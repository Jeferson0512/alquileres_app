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

**Fix agregado después de Fase 3 (detectado probando en vivo):** una renovación de contrato crea una fila nueva en `ocupacion_unidad` aunque sea la misma persona — eso generaba un `CORTE_PENDIENTE` para *cualquier* renovación, incluidas las que no cambian nada (mismo inquilino, mismo alquiler; ej. la unidad 101 del propio dueño). `segmentar()` ahora fusiona dos ocupaciones consecutivas de la misma persona y el mismo `monto_alquiler` en un único tramo, sin pedir corte — pero **solo si el alquiler cambió** (decisión 5.9) sigue partiendo, porque ahí la separación sí importa para facturar cada tramo a su propio precio.

**Diagnóstico en vivo, sin cambio de código (unidad 208, sept. 2026):** un contrato vencido (`fecha_fin` en el pasado) pero sin renovación procesada — inquilino sigue viviendo ahí, `estado='ACTIVO'` — generaba `CORTE_PENDIENTE` porque `segmentar()` recortaba el tramo en esa `fecha_fin` como si fuera un corte real. Se evaluó parchear `segmentar()` para ignorar `fecha_fin` en ocupaciones `ACTIVO`, pero **no hizo falta**: la vía correcta es crear la ocupación de renovación (mismo inquilino, mismo `monto_alquiler`, `fecha_inicio` = `fecha_fin` anterior + 1 día) con **`fecha_fin = NULL`** — con eso el fix de la línea 90 (fusión sin cambios) la absorbe en el mismo tramo sin pedir corte, sin tocar `TramoResolver`. `fecha_fin` se completa después, cuando el inquilino efectivamente firma, editando esa fila a mano — no afecta ningún cobro ya generado mientras el monto no cambie. Lección: un contrato vencido sin procesar nunca debería dejarse así — crear la renovación con `fecha_fin` abierta apenas se detecta, no esperar a que aparezca el bug.

**Caso especial de corte histórico sin capturar (unidad 204):** un inquilino se mudó (`MUDANZA`) justo el primer día de un período — el corte automático quedó pendiente porque la función no existía todavía cuando pasó. Cuando `lectura_anterior == lectura_actual` del período completo (el medidor no se movió nada, con o sin él), el valor del corte no es una decisión de negocio ni una suposición: un medidor nunca retrocede, así que si empieza y termina en el mismo número, estuvo en ese número todo el tiempo. Se carga ese mismo valor como corte y ambos tramos resuelven a `OK` con 0 kWh, sin margen de error.

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

## Fase 2 — Atribución de consumo + prorrateo ✅ completa

Esta fase sí cambia dinero. Aplica las decisiones de negocio 5.1-5.9 (ver [`diseno-ocupaciones-parciales.md`](diseno-ocupaciones-parciales.md) §Decisiones).

### 1. La regla central: la fórmula de luz no se toca, se le agrega un paso después

`LiquidacionService` sigue calculando exactamente igual que siempre — IGV, `roundUpToTenth`, el % de participación congelado si el consumo no cambió. Todo eso opera **por unidad**, como antes. Lo nuevo es un paso posterior: una vez que la unidad tiene su `total_pagar_luz`, se reparte entre sus tramos ocupados (`LiquidacionService::repartirPorTramos()`) proporcional al `consumo_kwh` de cada uno, con el **residuo en el último tramo** — misma técnica que ya usaba `unidades_medidor_compartido` para partir el consumo entre dos unidades sin perder centavos. Con un solo tramo (el caso de siempre) no hay reparto que hacer: se lleva el total tal cual, sin ningún redondeo intermedio nuevo.

```
total_pagar_luz de la unidad = 94.4
  Ana (60/80 kWh, no es el último) → round(94.4 * 0.75, 2) = 70.8
  Beto (20/80 kWh, es el último)   → round(94.4 - 70.8, 2) = 23.6   (residuo exacto)
```

### 2. El consumo vacante no se pierde ni lo absorbe el dueño — se reparte (decisión 5.4)

Antes, una unidad 100% vacía se excluía del cálculo y su ausencia agrandaba el "gasto común" a repartir entre las demás. Ahora se aplica el **mismo mecanismo** a un tramo vacante *dentro* de una unidad ocupada: su consumo se excluye de lo que entra a `calcularPorcentajes()`, así que el costo de esos kWh queda automáticamente en `diferencia_comun` y se reparte proporcional entre las unidades ocupadas — no hace falta lógica nueva, es el mismo camino que ya existía.

Ajuste real que esto forzó: el filtro que antes excluía una fila con `consumo_kwh == 0` pasó de ser **por tramo** a ser **por unidad** (`filasPorUnidadConTramos()` en `LiquidacionService`) — un tramo ocupado de pocos días puede dar 0 kWh reales y aun así necesita cobrar alquiler prorrateado; lo que se excluye es la unidad completa solo si *ningún* tramo suyo tiene consumo facturable.

### 3. Un cobro por tramo, no por unidad

`CobroService::buildProgramados()` pasa a leer `liquidacion_luz_tramo` en vez de `liquidacion_luz_detalle` — cada fila que devuelve es un tramo, no una unidad. Una unidad con 2 tramos genera 2 cobros. Esto es, literalmente, lo que resuelve el caso original que arrancó todo esto (alguien se retira, entra otro — antes el consumo entero se le atribuía al que cierra el período; ahora cada uno paga el suyo) y el caso de traslado (201→202 el mismo período: dos cobros, uno por unidad, cada uno con su propio tramo).

**`CobroService::key()` cambió de `"{unidad}:{persona}"` a `"{unidad}:o{ocupación}"`** (con fallback a persona solo para 3 cobros históricos de antes del backfill de Fase 0). Es el cambio más delicado de toda la fase: sin él, `forceRefresh()` no puede distinguir dos tramos de la misma unidad y colapsaría uno en el otro, perdiendo un cobro en silencio. Por eso en Fase 0 se dejó *sin tocar* a propósito — cambiarlo antes de que `armarFilaCobro()` poblara `id_ocupacion` habría roto la comparación programado-vs-actual para *todos* los cobros, no solo los de tramos múltiples.

### 4. El prorrateo de días — alquiler y servicios fijos, no luz

Decisión 5.1/5.2/5.3: cualquier tramo parcial prorratea alquiler, agua, gas y mantenimiento por `factor = dias_tramo / dias_periodo` (días **reales** del período — no son 30 fijos, hubo uno de 14). La luz **no** lleva factor: ya viene prorrateada de origen, es el `total_pagar_luz` de ese tramo específico. Los overrides manuales (`cobros_overrides_servicio`) también se prorratean — se tratan como un reemplazo de la tarifa estándar, sujeto a la misma regla que todo lo demás en esa categoría.

Con un solo tramo cubriendo el período completo, `factor = dias_tramo / dias_periodo` da `1.0` exacto (mismo numerador y denominador, sin deriva de punto flotante) — el caso común queda bit a bit idéntico al de antes de esta fase.

### 5. El mínimo de luz es por unidad, no por tramo (decisión 5.5)

Si se calculara por tramo, un traslado a mitad de mes pagaría **dos** mínimos ese mes. En cambio: se calcula una sola vez sobre el `total_pagar_luz` de la unidad completa (leído de `liquidacion_luz_detalle`, que ya es la suma exacta de sus tramos), y si cae por debajo del mínimo configurado, el ajuste se reparte entre los tramos con el mismo criterio de residuo que la luz.

### 6. Bloqueo si falta un corte (decisión 5.8)

`LiquidacionService::generar()` revisa el estado de los tramos *antes* de calcular nada — si alguna unidad tiene un tramo `CORTE_PENDIENTE`, lanza `ValidationException` nombrando la unidad específica y **no genera nada para nadie**, ni siquiera para las unidades que sí estaban completas. Es a propósito: un período generado a medias es más difícil de razonar que uno que directamente no se generó. `preview()` no bloquea (es de solo lectura) — simplemente excluye esa unidad de la vista previa.

### 7. Snapshot de consumo — cierra un problema que ya existía

`cobros_mensuales` gana la columna `consumo_kwh` (ya agregada en Fase 0, recién usada acá). `listarParaPeriodo()`, `PortalReciboController::detalleConcepto()` y el `minimo_kwh_aviso` de Avisos dejaron de re-consultar `liquidacion_luz_detalle` por `(periodo, unidad, persona)` — con más de un tramo por unidad ese join ya no encontraba al inquilino saliente. De paso arregla algo que **ya pasaba antes** de esta fase: regenerar la liquidación de un período viejo podía cambiar los kWh impresos en un recibo ya cobrado, aunque el dinero no cambiara (RF-16 lo prohíbe para el monto, pero no protegía el kWh mostrado).

El umbral de `minimo_kwh_aviso` (decisión 5.6) se evalúa contra el consumo del **período completo de la unidad** (todos los tramos sumados, campo nuevo `consumo_periodo_unidad`), no contra el tramo individual — si no, un tramo corto casi siempre mostraría 0.00 kWh aunque el mes completo haya sido consumo normal. Lo que se **muestra** sigue siendo el consumo propio de ese cobro/tramo.

### 8. Qué cambió en cada archivo

| Archivo | Qué hace ahora |
|---|---|
| `app/Services/LiquidacionService.php` | `filasPorUnidadConTramos()` (privado, única fuente para preview/generar), `repartirPorTramos()`, persiste `liquidacion_luz_tramo` además de `liquidacion_luz_detalle` |
| `app/Services/CobroService.php` | `key()` con `id_ocupacion`; `buildProgramados()` lee tramos; `armarFilaCobro()` con factor de prorrateo; mínimo de luz repartido; medidor compartido resuelto por tramo del titular |
| `app/Http/Controllers/PortalReciboController.php` | `detalleConcepto()` lee el snapshot en vez de re-consultar liquidación |
| `resources/js/Pages/Liquidacion/Index.jsx` | sub-filas por tramo, badge de estado (incluye `Corte pendiente`), nota de consumo vacante |
| `resources/js/Pages/Cobros/Index.jsx` | rango de fechas bajo el código de unidad cuando el cobro es de un tramo parcial |
| `resources/js/Pages/Avisos/Index.jsx` | umbral de consumo bajo evaluado contra el período completo de la unidad |
| `database/migrations/..._create_liquidacion_luz_tramo_table.php` | tabla nueva (grupo 2) |

### 9. Simplificaciones deliberadas

- **Medidor compartido + tramos múltiples del dependiente**: si la unidad titular tiene varios tramos, cada uno reparte su porción al dependiente por separado (correcto). Si el dependiente *también* tuviera varios tramos dentro del rango de un mismo tramo del titular, no se sub-divide más allá de resolver "quién está vigente al cierre de ese tramo" — documentado en el código, no implementado a fondo porque `unidades_medidor_compartido` no tiene ninguna fila activa en producción hoy.
- **`INCONSISTENTE` sigue siendo solo informativo** (heredado de Fase 1) — no bloquea la generación, a diferencia de `CORTE_PENDIENTE`.

### 10. Gotcha real encontrado en el camino

Al borrar y regenerar, `liquidacion_luz_tramo` tiene una FK hacia `liquidacion_luz_detalle` — hay que borrar el hijo (`liquidacion_luz_tramo`) antes que el padre, si no MySQL rechaza el delete con "Cannot delete or update a parent row". El orden importa aunque ambos borrados estén en la misma transacción.

### 11. Cobertura de tests

18 tests nuevos entre `LiquidacionServiceTest.php` (reparto entre tramos con residuo exacto, consumo vacante repartido vía gasto común, bloqueo por corte pendiente) y `CobroServiceTest.php` (un cobro por tramo con alquiler prorrateado, cada uno con el alquiler de su propia ocupación, mínimo de luz repartido 50/50 con residuo). Los fixtures de `CobroServiceTest`/`PagoServiceTest` que antes insertaban `liquidacion_luz_detalle` a mano pasaron a generar vía `LiquidacionService` real, para que también quede la fila de tramo que `CobroService` necesita.

**El golden test (`PeriodoHistoricoGoldenTest`, período real 11, 8 unidades) pasó centavo a centavo en cada paso de esta fase** — la reescritura completa de `LiquidacionService` y `CobroService` no cambió ni un céntimo para el caso de una sola ocupación por unidad. Suite completa: 59/63 (los 4 que fallan son de scaffolding de Laravel sin relación, ya fallaban antes de esta fase).

### 12. La unicidad de `cobros_mensuales` — aplicada, con una desviación del plan

`uq_cobro_periodo_persona_unidad` → `uq_cobro_periodo_unidad_ocupacion (id_periodo, id_unidad, id_ocupacion)`, vía `database/schema/cobros_unicidad_por_ocupacion.sql`, con backup previo. Desbloquea el único escenario que de verdad la necesitaba: una **renovación de contrato con cambio de precio a mitad de período, misma persona, misma unidad** (decisión 5.9 — ya ocurrió una vez en producción, persona 4/unidad 5/período 9). Probado con un test dedicado que genera dos cobros para esa misma persona sin que la base los rechace como duplicados. Los otros 3 escenarios originales (retiro a mitad de período, dos inquilinos en la misma unidad, traslado entre unidades) no la necesitaban — todos con personas distintas, la unicidad vieja ya los permitía.

**Desviación del plan original:** el plan decía "`id_ocupacion` pasa a `NOT NULL` (ya backfilleado en 0.5)". Verificado antes de aplicar: **no** está 100% backfilleado — quedan 3/63 cobros históricos en `NULL` a propósito (período 2/feb-2026, ya `PAGADO`, sin ninguna ocupación real que cubra esas fechas — ver `database/schema/cobros_id_ocupacion.sql`, sección Fase 0). Forzar `NOT NULL` habría hecho fallar el `ALTER`. Se dejó `id_ocupacion` nullable: MySQL/MariaDB trata cada `NULL` como distinto dentro de un `UNIQUE`, y esas 3 filas ya están en `(periodo, unidad)` distintos entre sí, así que no hay riesgo real de colisión — y el código de aplicación siempre puebla `id_ocupacion` en cobros nuevos, así que ese hueco no crece.

### 13. Lo que falta

- Verificación visual en navegador de las páginas tocadas (Lecturas, Liquidación, Cobros, Avisos) — mismo límite en toda esta implementación: sin credenciales ni herramienta de browser en este entorno.

---

## Fase 3 — Traslado como acción de primera clase ✅ completa

Reemplaza el flujo manual de dos pantallas (Finalizar + Crear ocupación nueva) por una sola acción, y resuelve 3.4/3.5/3.6 sobre lo que Fase 2 ya dejó funcionando.

### 1. `TrasladoService` — qué hace en una sola transacción

Un solo método (`trasladar()`) que: finaliza la ocupación de origen (`FINALIZADO`, `motivo_fin='MUDANZA'`), crea la ocupación destino (`fecha_inicio` = fecha del traslado + 1 día, misma persona), crea el vínculo en `traslados_ocupacion`, y crea **las dos lecturas de corte ya con el número cargado** (no placeholders pendientes — el admin las escribe en el momento, que es exactamente el problema que originó toda esta migración). El prorrateo de dinero no lo calcula este service — ya lo resuelve `CobroService` automáticamente en cuanto ve los dos tramos.

**Decisión 5.10 (garantía):** se copia tal cual de origen a destino. El alquiler de la unidad destino es un dato nuevo — unidades distintas, precios distintos, no tendría sentido copiarlo.

**Validaciones antes de tocar nada:** unidad destino sin ocupación activa, fecha dentro del período (antes del cierre), ambas unidades ya sincronizadas este período (si no, no hay `lecturas_unidad` donde colgar el corte), sin corte ya cargado en esa fecha, período sin pagos registrados.

**Simplificación respecto al diseño original:** la tabla `traslados_ocupacion` no tiene columna `regla_alquiler` — en el diseño original iba a ser el "gancho" para cuando se decidiera si el alquiler se prorratea en un traslado, pero esa decisión (5.1/5.2, prorratear siempre por días) ya estaba tomada y ya implementada por Fase 2 antes de escribir esta tabla. La columna hubiera quedado sin uso real.

### 2. `deuda_anterior` sigue la cadena de traslados (decisión 5.11)

`CobroService::unidadesEnCadenaTraslado($idOcupacion)` camina hacia atrás por `traslados_ocupacion` desde la ocupación actual, juntando el `id_unidad` de cada eslabón. `listarParaPeriodo()` y `PortalReciboController::deudaAnterior()` (el mismo método, público, reusado en los dos lugares) ahora buscan deuda en **todas** las unidades de la cadena, no solo la actual — si no, el saldo pendiente de la unidad vieja desaparecía de la vista apenas alguien se trasladaba.

### 3. Portal y Cobros (decisión 5.12, 3.6)

Como cada tramo ya genera su propio `CobroMensual` (Fase 2), "dos recibos separados" ya salía gratis — no hizo falta ningún cambio estructural. Lo que sí se agregó: una nota cruzada en el PDF (`notaTraslado()`) cuando el cobro es un lado de un traslado — "Te trasladaste a/desde la unidad X el DD/MM" — y en la pantalla de Cobros del admin, un badge `⇄ {unidad}` junto al código de unidad que, al hacer clic, filtra la tabla al cobro complementario (reutiliza el buscador que ya existía, no hizo falta un link real).

### 4. Qué cambió en cada archivo

| Archivo | Qué hace ahora |
|---|---|
| `app/Services/TrasladoService.php` (nuevo) | `trasladar()`: finaliza origen, crea destino, vincula, crea los dos cortes |
| `app/Models/TrasladoOcupacion.php` (nuevo) | modelo Eloquent de `traslados_ocupacion` |
| `app/Services/CobroService.php` | `unidadesEnCadenaTraslado()` (público); `listarParaPeriodo()` expone `traslado` (badge) además de `deuda_anterior` con la cadena |
| `app/Http/Controllers/OcupacionController.php` | `trasladar()` (endpoint), `index()` expone `periodo` (antes no lo pasaba) |
| `app/Http/Controllers/PortalReciboController.php` | `notaTraslado()`, `deudaAnterior()` usa la cadena |
| `app/Models/OcupacionUnidad.php` | `cobros()` usa el FK directo `id_ocupacion` en vez del indirecto por `(unidad, persona)` que el propio docblock ya denunciaba (dead code, no se usaba en ningún lado, pero quedaba desactualizado) |
| `routes/web.php` | `POST /ocupaciones/{ocupacion}/trasladar` — sin permiso propio en el catálogo, exige `ocupaciones.crear` **y** `ocupaciones.finalizar` juntos (lo que la acción realmente hace) |
| `resources/js/Pages/Ocupaciones/Index.jsx` | modal "Trasladar a otra unidad" + botón en la tabla |
| `resources/js/Pages/Cobros/Index.jsx` | badge de traslado clickeable |
| `resources/views/portal/_recibo-contenido.blade.php` | nota cruzada cuando aplica |
| `database/migrations/..._create_traslados_ocupacion_table.php` | tabla nueva (grupo 2) |

### 5. Cobertura de tests

9 tests nuevos en `TrasladoServiceTest.php` (finaliza origen + crea destino + garantía copiada + los dos cortes cargados; el prorrateo automático de Fase 2 factura las dos unidades correctamente sin alquiler duplicado; las 3 validaciones) + 2 tests agregados a `CobroServiceTest.php` (deuda sigue la cadena hasta la unidad vieja; badge de traslado apunta a la unidad complementaria en ambos cobros). Suite completa: 65/69 (los 4 que fallan son de scaffolding de Laravel sin relación).

### 6. Lo que falta

- Verificación visual en navegador — mismo límite de siempre en esta implementación.
- El prototipo visual compartido ("Torre de Control") tiene una capa de pulido que todavía no está en la app real (tipografía Plus Jakarta Sans/IBM Plex Mono, sidebar oscuro con estados activos más trabajados) — la paleta de color ya coincide exactamente, el resto queda pendiente para una pasada de diseño aparte, a pedido explícito del usuario.
