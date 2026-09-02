# Implementación: atribución de consumo por ocupaciones parciales

> **Documento vivo.** Registra lo que **ya está construido y probado**, fase por fase, a medida que el [plan aprobado](diseno-ocupaciones-parciales.md) avanza. Cada fase nueva agrega su propia sección al final — las secciones ya escritas no se reescriben, salvo que algo se haya implementado distinto a como se diseñó originalmente (eso se nota explícitamente donde pasa). Para la propuesta original y las 13 decisiones de negocio ya resueltas, ver [`diseno-ocupaciones-parciales.md`](diseno-ocupaciones-parciales.md).

---

## Contexto (no cambia entre fases)

El sistema factura luz y alquiler asumiendo que una unidad tiene **una sola ocupación estable durante todo el período**. Cuando alguien se retira a mitad de mes, entra otro inquilino, o alguien se traslada de unidad, no hay forma de saber "hasta acá consumió uno, desde acá el otro" — hoy todo el consumo del mes se le atribuye a quien esté al cierre del período.

El plan lo resuelve en fases, separando **capturar el dato** (sin riesgo de plata) de **cambiar cómo se factura** (con riesgo de plata):

| Fase | Qué hace | Cambia algún cobro? |
|---|---|---|
| 0 | Saneamiento de datos + columnas nuevas | No |
| 1 | Captura de lecturas de corte | No |
| 2 | Atribución real del consumo + prorrateo | **Sí** |
| 3 | Traslado como acción de primera clase | Sí |

---

## Fase 0 — Saneamiento y base de datos ✅ completa

Resumen rápido (detalle completo en el commit `0f9dea5`):

- Fix del bug original de Lecturas (el campo "Actual" se bloqueaba solo por auditoría, sin relación con si se había cargado algo).
- `cobros_mensuales` gana `id_ocupacion` (FK) + `consumo_kwh` (snapshot) — backfilleado en 59/62 filas históricas.
- `CobroMensual::ocupacion()` usa el FK directo en vez de buscar por `(unidad, persona, estado=ACTIVO)`.
- Validación de fechas solapadas en Ocupaciones + limpieza de 4 solapes de 1 día que ya existían en datos reales.
- Fix del bug latente de medidor compartido (ocupación del dependiente por período, no por `estado=ACTIVO`).
- Test golden (`PeriodoHistoricoGoldenTest`) que reproduce un período real completo centavo a centavo — línea base de no-regresión para Fase 2.
- Bonus: el backup automático venía fallando en silencio desde hacía 13 días (incompatibilidad `mysqldump`/MariaDB) — corregido.

---

## Fase 1 — Captura de lecturas de corte ✅ completa

### 1. El modelo de datos nuevo

**Tabla `lecturas_corte`:**

| Columna | Qué es |
|---|---|
| `id_periodo`, `id_unidad` | a qué período/unidad pertenece |
| `fecha_corte` | el día que cierra el tramo saliente (ver algoritmo abajo) |
| `id_ocupacion_sale` / `id_ocupacion_entra` | qué ocupación termina y cuál empieza ahí. **Iguales** en un corte manual (no hay cambio de inquilino) |
| `lectura_corte` | el número del medidor ese día. `NULL` = "se detectó que acá hace falta un corte, todavía nadie cargó el número" |
| `origen` | `AUTO` (lo creó `sincronizar()` al detectar un cambio de ocupación) o `MANUAL` (lo creó un admin a mano) |
| `observacion`, `registrado_por` | trazabilidad de un corte manual |

Único índice: `(id_periodo, id_unidad, fecha_corte)` — no puede haber dos cortes el mismo día para la misma unidad.

La semántica de `lecturas_unidad.id_ocupacion` cambió: antes era "la ocupación con `fecha_inicio` más reciente que se solapa" (un accidente del `ORDER BY`); ahora es **la ocupación vigente al cierre del período**. Con una sola ocupación no hay diferencia — solo importa cuando hay más de una.

### 2. El algoritmo: `TramoResolver`

Es la única pieza que sabe cruzar ocupaciones × período × cortes. Nada más en el código debe reconstruir esta lógica por su cuenta.

**Idea central** — el medidor de una unidad, dentro de un período, produce una cadena ordenada de lecturas:

```
P0 (cierre del período anterior) → C1 → C2 → ... → Pf (cierre de este período)
     └── tramo 1 ──┘   └─ tramo 2 ─┘        └── tramo n ──┘
```

`P0` = `lectura_anterior`, `Pf` = `lectura_actual` (ya existían). Cada `Ci` es un `lecturas_corte`. Con una sola ocupación cubriendo todo el período (el caso de siempre), `n=1` y el resultado es idéntico al de hoy — cero cambio de comportamiento para el caso común.

**Dos fuentes de cortes, dos capas de segmentación:**

- **Capa 1 — automática (`segmentar()`):** recorta cada ocupación al rango del período y rellena los huecos con tramos "vacantes". Solo mira `ocupacion_unidad`.
- **Capa 2 — manual (`partirEnFechasManuales()`):** si hay cortes `MANUAL`, parte de nuevo cada segmento de la Capa 1 en esas fechas, conservando la **misma** ocupación a los dos lados (un corte manual nunca es un cambio de inquilino).

```
Capa 1 (por ocupación):        [01/07 ─────────────── Juan ─────────────── 30/07]
Capa 2 (+ corte manual 15/07): [01/07 ── Juan ── 15/07][16/07 ── Juan ── 30/07]
```

**Regla central: nunca adivina.** Si un corte interno no existe o tiene `lectura_corte = NULL`, ese tramo queda `CORTE_PENDIENTE` — y esa falta de dato se **propaga hacia adelante**: el tramo siguiente tampoco puede calcular su consumo, aunque su propio corte de salida sí esté cargado.

**Estados de un tramo:**

| Estado | Cuándo |
|---|---|
| `OK` | ambos extremos conocidos, consumo calculado |
| `CORTE_PENDIENTE` | falta cargar un corte en esta frontera (o en una anterior que arrastra el hueco) |
| `INCONSISTENTE` | ambos extremos conocidos pero la lectura de cierre es menor que la de apertura. Solo informativo por ahora — igual que hoy el sistema tolera un consumo negativo clampeándolo a 0 |

**Invariantes garantizados** (probados en `TramoResolverTest`): cobertura exacta del período sin huecos ni solapes; suma de `consumo_kwh` de tramos conocidos == `lectura_actual - lectura_anterior`; con una sola ocupación y sin cortes, un único tramo idéntico al período completo.

### 3. Cuándo se crea un corte — las dos vías

**Automático**, dentro de `sincronizar()` (botón "Sincronizar unidades"): en cada unidad recalcula las fronteras entre ocupaciones y crea un placeholder `AUTO` en cada una que todavía no exista. Nunca pisa un corte existente — tenga o no valor, sea `AUTO` o `MANUAL`.

**Manual**, botón "Registrar corte" — ver la sección siguiente en detalle, es la parte que se explica aparte porque generó dudas.

**Guard compartido:** ninguna de las dos vías crea cortes en un período que ya tiene pagos `REGISTRADO` — Fase 1 no cobra nada por los cortes todavía, pero agregar una frontera pendiente a un período que el dinero ya dio por cerrado es la sorpresa que hay que evitar antes de que Fase 2 empiece a leerlos para facturar. El resto de `sincronizar()` (refrescar `lectura_anterior`/`id_ocupacion`) sigue funcionando igual con este guard puesto.

### 4. El botón "Registrar corte" — qué es y para qué sirve

Ver el mockup visual + la explicación paso a paso en el mensaje de chat (se armó aparte porque la explicación en texto no había quedado clara). En una frase: **es la única forma de anotar una lectura de control cuando NO hubo cambio de inquilino** — si hubo cambio de inquilino, ese corte ya se crea solo al sincronizar.

### 5. Qué cambió en cada archivo

| Archivo | Qué hace ahora |
|---|---|
| `app/Services/TramoResolver.php` (nuevo) | `tramosParaPeriodo()`, `segmentar()` (público, lo usa también `LecturaService`), `partirEnFechasManuales()` |
| `app/Services/LecturaService.php` | `sincronizar()` detecta fronteras automáticas; `sincronizarCortes()` (privado) crea los placeholders; `registrarCorteManual()` para el corte a mano; `filasParaPeriodo()` expone `tramos[]` e `inquilino` resuelto por tramo |
| `app/Models/LecturaCorte.php` (nuevo) | modelo Eloquent de `lecturas_corte` |
| `app/Http/Controllers/LecturaController.php` | `save()` acepta un array `cortes` además de `items`; `registrarCorte()` (nuevo) para el endpoint del modal |
| `routes/web.php` | `POST /lecturas/corte` → `lecturas.corte.registrar` (permiso `lecturas.registrar`) |
| `resources/js/Pages/Lecturas/Index.jsx` | sub-filas por tramo, badges, KPI "Cortes pendientes", modal "Registrar corte" |
| `database/migrations/..._create_lecturas_corte_table.php` | tabla nueva (grupo 2, Laravel-nativa) |

### 6. Simplificaciones deliberadas

- **`INCONSISTENTE` es solo informativo** — no bloquea nada en esta fase, coherente con que el sistema ya tolera un consumo negativo hoy (lo clampea a 0).
- **Sin regla de "mínimo de días" por tramo** — un tramo de 1 día es válido. Si en la práctica aparecen tramos irrisorios, se ajusta después con datos reales.
- **Un corte manual no reemplaza un cambio de ocupación real** — para eso sigue estando `sincronizar()`.

### 7. Gotcha real encontrado en el camino

`Periodo::fecha_inicio`/`fecha_fin` están casteadas a `date` (Carbon). Comparar un string PHP (`'2099-04-30'`) contra ese objeto con `<`/`>=` directo no compara fechas — compara el `__toString()` de Carbon (que incluye la hora), dando resultados incorrectos en silencio. Corrección: pasar por `->toDateString()` antes de comparar. No afecta las comparaciones dentro de `->where(...)` de Eloquent (esas las resuelve MySQL) — era específico de comparar en memoria con operadores de PHP.

### 8. Cobertura de tests

| Archivo | Qué prueba |
|---|---|
| `TramoResolverTest.php` (8 tests) | cobertura sin huecos/solapes, conservación de kWh, propagación de `CORTE_PENDIENTE`, unidad 100% vacante, ocupación parcial con vacantes a los lados, filtro por unidad, corte manual partiendo un tramo con la misma ocupación a ambos lados |
| `LecturaServiceTest.php` (10 tests) | `sincronizar()` con n=1 y n=2, no duplica ni pisa cortes, guard de pagos registrados, `filasParaPeriodo()` expone tramos, y las 5 validaciones de `registrarCorteManual()` |
| `PeriodoHistoricoGoldenTest.php` (Fase 0, 2 tests) | línea base del período real 11 — sigue pasando igual después de todos estos cambios |

Suite completa: 53/57 (los 4 que fallan son de scaffolding de Laravel sin relación — ya fallaban antes de esta sesión).

### 9. Lo que todavía no hace (a propósito)

Nada de esto factura. `LiquidacionService` y `CobroService` siguen leyendo `lecturas_unidad` como siempre — los tramos y cortes existen y se pueden cargar, pero el dinero se calcula igual que hoy. Eso es Fase 2.

---

## Fase 2 — Atribución de consumo + prorrateo (pendiente)

_Se completa esta sección cuando se implemente._
