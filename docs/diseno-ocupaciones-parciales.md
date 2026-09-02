> Sesión de diseño solicitada por el punto 8 de `requerimientos-proyecto.md` ("prorrateo por días... pendiente de auditar y diseñar en una sesión propia"). Producido 2026-09-01, verificado contra el código y los datos reales de `database/backups/backup_alquileres_db_20260819_030003.sql`. Estado: **diseño aprobado para lectura, ninguna fase implementada todavía** — las decisiones de negocio de la sección 5 siguen abiertas.

---

# Diseño: atribución de consumo entre ocupaciones dentro de un mismo período

**Alcance:** cómo el sistema atribuye correctamente el consumo de luz (y con qué gancho, más adelante, el alquiler/servicios) cuando dentro de un mismo período de facturación hay más de una ocupación involucrada — sea en la misma unidad o entre dos unidades del mismo inquilino.
**Fuera de alcance (deliberado):** decidir la regla de prorrateo del alquiler fijo y de agua/gas/mantenimiento. Este diseño deja el gancho, no la respuesta (§5).

---

## 0. Hallazgos de la verificación previa (corrigen o precisan el enunciado)

| # | Hallazgo verificado | Dónde | Impacto en el diseño |
|---|---|---|---|
| 0.1 | Los períodos **no son meses calendario**. `periodos` reales: enero 2026 = `2025-12-15 → 2026-01-14`; abril 2026 = `2026-04-01 → 2026-04-14` (14 días). | `database/backups/backup_alquileres_db_20260819_030003.sql`, tabla `periodos` | "Dos inquilinos en el mismo mes" hay que reformularlo como **dentro del mismo período**. Y cualquier prorrateo por días necesita un denominador definido explícitamente (§5.3) porque los períodos no miden lo mismo. |
| 0.2 | **La convención de intervalos de `ocupacion_unidad` es inconsistente en los datos reales.** La UI (`prefillRenovacion`) sugiere `fecha_inicio = fecha_fin_anterior + 1 día`, pero la mayoría de las filas reales se solapan un día: oc. 5 termina `2026-04-26` y oc. 39 empieza `2026-04-26`; ídem 2→38, 4→41, 35→10. Solo 1→62 usa +1 día. | `laravel/resources/js/Pages/Ocupaciones/Index.jsx:239-254` vs. datos de `ocupacion_unidad` | **Bloqueante para calcular tramos de forma determinista**: hay días en que dos ocupaciones son "vigentes" a la vez. Hay que fijar la convención y limpiar los datos ANTES de tocar la lógica (§6, Fase 0). |
| 0.3 | El escenario "dos ocupaciones solapando el mismo período" **ya ocurrió en producción**: unidad 5, período 9 (mayo, `2026-04-15→2026-05-14`), ocupaciones 5 y 39. Pasó desapercibido porque era la misma persona (renovación). | Datos reales | El bug ya es latente, no hipotético. Y muestra el caso que rompe la unicidad de `cobros_mensuales` (§2.4). |
| 0.4 | Existe una lectura ligada a una ocupación que **no se solapa con el período**: `lecturas_unidad` id 121 (período 11, unidad 4, `id_ocupacion=41`), y la oc. 41 empieza `2026-07-15`, un día después del fin del período (`2026-07-14`). | Datos reales | El vínculo lectura→ocupación es frágil y se corrompe por ediciones manuales. Refuerza la necesidad de que la resolución de tramos sea **derivada y recalculable**, no un puntero editable a mano. |
| 0.5 | Una persona con **varias unidades simultáneas es un estado legítimo y existente** (persona 5 → unidades 12, 13, 14; cobros 238/239, 39/40). | `cobros_mensuales` reales | Descarta "una persona = un cobro por período" como simplificación. Y descarta cambiar `deuda_anterior` a keyear solo por persona (§3.7). |
| 0.6 | Los `UNIQUE` que hoy encierran el problema son **tres**, no uno: `lecturas_unidad.uq_lectura_periodo_unidad (id_periodo,id_unidad)`, `liquidacion_luz_detalle.uq_liquidacion_periodo_unidad (id_periodo,id_unidad)` — nótese que **no** incluye persona — y `cobros_mensuales.uq_cobro_periodo_persona_unidad`. | DDL real | El `UNIQUE` de `liquidacion_luz_detalle` es el más restrictivo y el que descarta la opción "una fila de liquidación por ocupación" (§1.3). |
| 0.7 | El código ya se culpa a sí mismo por la falta de `id_ocupacion` en cobros: *"cobros_mensuales NO tiene columna id_ocupacion — el vinculo es indirecto por (id_unidad, id_persona). Es exactamente la ausencia de esta relacion explicita la que causo el bug de monto_alquiler desincronizado que origino esta migracion."* | `laravel/app/Models/OcupacionUnidad.php:41-50` | La columna `cobros_mensuales.id_ocupacion` no es solo para este diseño: cierra un gap ya diagnosticado. |
| 0.8 | `CobroMensual::ocupacion()` resuelve la ocupación con `where estado = 'ACTIVO'` → devuelve `null` para cualquier cobro de un contrato ya finalizado, y `montoAlquilerDesactualizado()` da falso negativo silencioso. | `laravel/app/Models/CobroMensual.php:53-69` | Mismo síntoma que 0.7; se arregla con la misma columna. |
| 0.9 | `unidades_medidor_compartido` busca la ocupación de la unidad dependiente con `where estado='ACTIVO'` (no "vigente en el período"). | `laravel/app/Services/CobroService.php:146-149` y su gemelo legacy `api/modules/cobros/common.php:117-121` | Bug latente de la misma familia; al regenerar un período viejo, el cobro del dependiente se le atribuye al ocupante de HOY. Hay que corregirlo en la misma pasada (§3.5). |
| 0.10 | El consumo de una unidad **100% vacía** hoy no se factura pero **sí se redistribuye**: se excluye de `$liquidados`, lo que agranda `diferenciaComun`, que se reparte proporcionalmente entre las unidades ocupadas. | `laravel/app/Services/LiquidacionService.php:130,138` | Define el precedente para decidir qué pasa con el consumo del **tramo vacante** (§5.4). Hoy la respuesta implícita para vacancia total es "lo pagan los demás". |
| 0.11 | `lecturas_unidad.estado='VALIDADO'` **no se usa en ningún archivo** del repo (solo aparece en los dumps de esquema). | Grep global | No reutilizarlo como discriminador de "lectura de corte": es un slot semánticamente vacío que confundiría. Mejor columnas/tablas explícitas. |
| 0.12 | Ya existe precedente de **tabla Laravel-nativa (grupo 2) con FK a tabla legacy (grupo 1)**: `renovaciones_pendientes` referencia `ocupacion_unidad`. | `laravel/database/migrations/2026_07_22_110000_create_renovaciones_pendientes_table.php` | Permite crear las tablas nuevas por migración normal, sin pasar por el procedimiento de `modificar-esquema-legacy` (que queda solo para la columna en `cobros_mensuales`). |
| 0.13 | Hay precedente de **ALTER a tabla legacy hecho por migración Laravel idempotente** (`motivo_fin`, `renovada_de_id`), en contradicción con el skill que manda `.sql` suelto. | `laravel/database/migrations/2026_07_22_090000_*.php` vs. `.claude/skills/modificar-esquema-legacy/SKILL.md` | Elegir un camino y ser explícito. Recomendación en §2.6. |
| 0.14 | Los triggers de la base solo tocan `pagos`/`pagos_detalle` y operan por `id_cobro`/`id_cobro_detalle`. No hay triggers sobre `cobros_mensuales`, `lecturas_unidad` ni `liquidacion_luz_detalle`. | Backup real + `database/schema/pagos_por_concepto_guardrails.sql` | Agregar columnas a `cobros_mensuales` no rompe guardrails de BD. |
| 0.15 | El legacy PHP replica **exactamente** la misma consulta de sincronización (`ORDER BY fecha_inicio DESC, id_ocupacion DESC LIMIT 1`). | `api/modules/lecturas/sync.php:35-44` | Cualquier cambio que rompa la unicidad de `lecturas_unidad` hace que las dos apps calculen distinto sobre la misma base. Argumento fuerte a favor de la Opción B (§1.3). |

---

## 1. Modelo conceptual propuesto

### 1.1 La unidad atómica correcta es el **tramo de ocupación**, no el período

> **Tramo** = intersección entre el rango de una ocupación y el rango de un período, sobre una unidad.
> `Tramo = (id_periodo, id_unidad, id_ocupacion|null, fecha_desde, fecha_hasta)`

Propiedades que lo hacen la abstracción correcta:

- **Es derivado, no capturado.** Se calcula desde `ocupacion_unidad` × `periodos` + los puntos de medición. No hay un dato nuevo que el admin pueda desincronizar (evita el hallazgo 0.4).
- **Generaliza los 3 escenarios sin ifs.** El caso de hoy (una ocupación estable) es simplemente *n = 1*, y produce resultados idénticos a los actuales.
- **Admite el tramo vacante** (`id_ocupacion = null`) como ciudadano de primera, lo que resuelve el escenario 1 sin un "modo especial de unidad vacía".
- **Es la clave natural del dinero**: un tramo → un cobro (salvo fusión, §5.7).

| Escenario del negocio | Tramos que se generan | Cobros | Nada especial que codificar |
|---|---|---|---|
| 1. Se retira a mitad, la unidad queda vacía | U201: `[inicio…corte] oc.A` + `[corte+1…fin] vacante` | 1 (tramo A) | El tramo vacante simplemente no genera cobro |
| 2. Sale uno, entra otro | U201: `[inicio…corte] oc.A` + `[corte+1…fin] oc.B` | 2 | La `uq` actual de cobros ya lo permite (personas distintas) |
| 3. Mismo inquilino 201 → 202 | U201: `oc.A` + `vacante`; U202: `vacante` + `oc.B` | 2 (unidades distintas) | Es el escenario 1 aplicado dos veces, en espejo. La unidad **destino** también necesita su corte de apertura, o su consumo de días vacíos se le carga entero al entrante |

Que el escenario 3 sea *"el escenario 1 aplicado dos veces en espejo"* es la prueba de que el modelo no tiene casos especiales.

### 1.2 Las lecturas de corte son lecturas normales — lo que cambia es qué delimitan

Conceptualmente el medidor de una unidad, dentro de un período, produce una **cadena ordenada de puntos de medición**:

```
P0 (cierre del período anterior) → C1 → C2 → … → Pf (cierre de este período)
     └── tramo 1 ──┘   └─ tramo 2 ─┘        └── tramo n ──┘
```

Cada fila de medición representa el **intervalo que TERMINA en ella**. Nótese que la fila única actual de `lecturas_unidad` ya tiene exactamente esa semántica (su intervalo es el período completo) — o sea, el modelo no cambia la semántica de nada existente, solo permite *n* intervalos en vez de 1.

Una lectura de corte por lo tanto **no necesita un concepto propio**: es un punto de medición con `fecha` distinta del fin de período. Lo único genuinamente nuevo es que ahora hay un **orden** y una **frontera de ocupación asociada** a cada punto.

### 1.3 Decisión clave: ¿`lecturas_unidad` pasa a "una fila por tramo"?

**Recomendación: NO.** Se conserva `lecturas_unidad` como está (1 fila por unidad+período = el cierre), y los puntos intermedios van a una tabla satélite `lecturas_corte`.

| | Opción A — `lecturas_unidad` se vuelve la cadena (1 fila por tramo) | **Opción B (recomendada)** — cortes en tabla satélite |
|---|---|---|
| Cambio en `lecturas_unidad` | Romper `uq_lectura_periodo_unidad`, agregar `orden`/`tipo` | **Ninguno** |
| Cambio en `liquidacion_luz_detalle` | Obligatorio: romper `uq_liquidacion_periodo_unidad` (0.6) | **Ninguno** |
| Cambio en `LiquidacionService` (fórmula IGV + `roundUpToTenth` + congelado) | Reescritura: hay que re-keyear `previoGuardado()`/`calcularPorcentajes()` por tramo | **Fórmula intacta**; solo se agrega un paso posterior de reparto |
| Invariante "Σ luz de todas las unidades == `total_recibo`" | Hay que re-demostrarla con el redondeo hacia arriba aplicado *n* veces por unidad → riesgo real de sobre-cobrar | **Se preserva estructuralmente** (el reparto es post-cálculo, con residuo) |
| App legacy (`api/modules/lecturas/sync.php`, `liquidacion/*.php`) | Se rompe silenciosamente: el `LIMIT 1` elige una fila arbitraria y la liquidación duplica filas por unidad | **Sigue funcionando** (ignora la tabla nueva) |
| `DashboardService::consumoPorUnidadPeriodoAnterior()` (`pluck` por `id_unidad`) y `PortalReciboController::detalleConcepto()` (`value()` por período+unidad) | Se rompen en silencio (se quedan con una fila al azar) | Siguen funcionando |
| Pureza conceptual | Mayor (una sola tabla es la cadena) | Menor (los números del medidor viven en dos tablas) |

El desempate: la Opción A obliga a reescribir el código de fórmula de dinero (el más riesgoso del sistema, con IGV, redondeo hacia arriba y congelado de porcentajes) para resolver un problema que **no es de fórmula sino de atribución**. La Opción B aísla el cambio exactamente donde está el problema.

La pureza se recupera en la capa lógica: **el `Tramo` es un objeto derivado único** que produce un solo servicio (`TramoResolver`), y todos los consumidores hablan de tramos, no de "cortes" ni de "filas de lectura". Dónde se almacenan los números crudos es un detalle de persistencia.

> **Puerta de salida:** si algún día los cortes múltiples se vuelven rutina (más de 1 por unidad/período de forma habitual), migrar a la Opción A es mecánico — `lecturas_corte` ya tiene `fecha` y orden implícito; se vuelca a `lecturas_unidad` con `orden` y se cambian los `UNIQUE`. La Opción B no es un callejón sin salida.

### 1.4 Arquitectura de tres capas (el corazón del diseño)

```
CAPA 1 — MEDICIÓN (físico, por unidad)
  lecturas_unidad (sin cambios: P0/Pf)  +  lecturas_corte (nueva: C1..Cn)

CAPA 2 — ATRIBUCIÓN (lógico, derivado, en memoria)
  TramoResolver::tramosParaPeriodo(Periodo, ?idUnidad): Tramo[]
  ← la ÚNICA pieza que sabe cruzar ocupaciones × período × cortes

CAPA 3 — DINERO (persistido, snapshot)
  liquidacion_luz_detalle  (POR UNIDAD, sin cambios — ancla el recibo)
        ↓ reparto con residuo, análogo a unidades_medidor_compartido
  liquidacion_luz_tramo    (nueva: POR TRAMO — el detalle del detalle)
        ↓
  cobros_mensuales         (+ id_ocupacion)
```

La regla de oro que sostiene todo: **el reparto entre unidades sigue siendo el que define el recibo eléctrico; el reparto entre tramos es una subdivisión interna de lo que ya le tocó a esa unidad.** Nunca al revés.

El precedente exacto de esa técnica ya está en el código: `CobroService::buildProgramados()` (líneas 144-160) parte el `total_pagar_luz` de la unidad titular entre dos unidades por porcentaje, calculando el dependiente y dando el **residuo** al titular (`$montoLuzTitular = $montoLuzTotal - $montoLuzDependiente`), lo que garantiza que la suma no cambie ni un centavo. El reparto por tramos usa la misma técnica: los primeros *n-1* tramos se redondean a 2 decimales y el último se lleva el residuo. **No aplicar `roundUpToTenth()` por tramo** — eso sobre-cobraría.

---

## 2. Cambios de esquema

Resumen: **una sola tabla legacy cambia** (`cobros_mensuales`), y solo de forma aditiva. Todo lo nuevo son tablas grupo 2 (migraciones Laravel normales, precedente 0.12).

### 2.1 `lecturas_corte` — NUEVA, grupo 2 (migración Laravel)

```
id                    BIGINT UNSIGNED  PK AUTO_INCREMENT
id_periodo            INT UNSIGNED     NOT NULL   FK → periodos
id_unidad             INT UNSIGNED     NOT NULL   FK → unidades
fecha_corte           DATE             NOT NULL   -- último día que corresponde al tramo saliente
id_ocupacion_sale     INT UNSIGNED     NULL       FK → ocupacion_unidad
id_ocupacion_entra    INT UNSIGNED     NULL       FK → ocupacion_unidad  -- NULL = la unidad queda vacía
lectura_corte         DECIMAL(12,2)    NULL       -- NULL = frontera detectada, lectura pendiente de tomar
origen                ENUM('AUTO','MANUAL') NOT NULL DEFAULT 'AUTO'
observacion           VARCHAR(255)     NULL
registrado_por        VARCHAR(191)     NULL
created_at/updated_at

UNIQUE KEY uq_corte_periodo_unidad_fecha (id_periodo, id_unidad, fecha_corte)
KEY idx_corte_periodo_unidad (id_periodo, id_unidad)
```

Decisiones de diseño de esta tabla:

- **`lectura_corte` es NULLABLE a propósito.** Una fila con valor `NULL` es "el sistema detectó que acá hay una frontera de ocupación y falta el número". Eso convierte un problema invisible (hoy: nadie se entera de que faltó la lectura de corte) en un ítem visible y accionable en la pantalla de Lecturas.
- **`origen`** distingue el corte auto-detectado por `sincronizar()` del que el admin agregó a mano (ej. tomó una lectura de control a mitad de mes sin cambio de inquilino). No se borran automáticamente los `MANUAL` ni los que ya tienen valor.
- **Regla de aplicación (no BD):** al menos uno de `id_ocupacion_sale` / `id_ocupacion_entra` debe ser no nulo. Un CHECK en MySQL 8 lo soporta, pero el legacy corre en MariaDB local — mejor validarlo en el FormRequest/Service para no dividir comportamientos entre entornos.

### 2.2 `liquidacion_luz_tramo` — NUEVA, grupo 2

```
id                       BIGINT UNSIGNED PK AUTO_INCREMENT
id_liquidacion_detalle   INT UNSIGNED    NOT NULL FK → liquidacion_luz_detalle  (ojo: int unsigned, no bigint)
id_periodo               INT UNSIGNED    NOT NULL FK → periodos
id_unidad                INT UNSIGNED    NOT NULL FK → unidades
id_ocupacion             INT UNSIGNED    NULL     FK → ocupacion_unidad   -- NULL = tramo vacante
id_persona               INT UNSIGNED    NULL     FK → personas
fecha_desde              DATE            NOT NULL
fecha_hasta              DATE            NOT NULL
dias                     SMALLINT UNSIGNED NOT NULL
lectura_desde            DECIMAL(12,2)   NOT NULL
lectura_hasta            DECIMAL(12,2)   NOT NULL
consumo_kwh              DECIMAL(12,2)   NOT NULL DEFAULT 0
porcentaje_tramo         DECIMAL(10,6)   NOT NULL DEFAULT 0   -- share dentro de la unidad
total_pagar_luz          DECIMAL(10,2)   NOT NULL DEFAULT 0   -- Σ por unidad == liquidacion_luz_detalle.total_pagar_luz
fecha_calculo            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP

UNIQUE KEY uq_tramo_periodo_unidad_desde (id_periodo, id_unidad, fecha_desde)
KEY idx_tramo_ocupacion (id_ocupacion)
```

- Se escribe **siempre**, también cuando *n = 1* (una fila espejo del detalle de la unidad). Sin excepciones = sin ifs aguas abajo, y son ≤ 9 filas por período.
- `dias` se persiste (no se recalcula) porque es el insumo del futuro prorrateo y debe quedar congelado como snapshot junto con el resto (RF-16).
- Es el registro de auditoría de **por qué a este inquilino le tocó ese monto** — hoy esa trazabilidad no existe para el split de medidor compartido tampoco.

### 2.3 `traslados_ocupacion` — NUEVA, grupo 2

```
id                     BIGINT UNSIGNED PK AUTO_INCREMENT
id_ocupacion_origen    INT UNSIGNED NOT NULL FK → ocupacion_unidad
id_ocupacion_destino   INT UNSIGNED NOT NULL FK → ocupacion_unidad
fecha_traslado         DATE NOT NULL
regla_alquiler         ENUM('POR_DEFINIR','ORIGEN_COMPLETO','DESTINO_COMPLETO',
                            'PRORRATEO_DIAS','AMBOS_COMPLETOS')
                       NOT NULL DEFAULT 'POR_DEFINIR'
observacion            VARCHAR(255) NULL
creado_por             VARCHAR(191) NULL
created_at/updated_at

UNIQUE KEY uq_traslado_origen  (id_ocupacion_origen)
UNIQUE KEY uq_traslado_destino (id_ocupacion_destino)
KEY idx_traslado_fecha (fecha_traslado)
```

- **Análogo estructural de `renovada_de_id`**, pero como tabla en vez de columna, por tres razones concretas: (a) `renovada_de_id` encadena renovaciones *en la misma unidad* y mezclar los dos significados en la misma columna volvería ambiguas todas las consultas existentes; (b) el traslado necesita atributos propios (`fecha_traslado`, `regla_alquiler`) que no caben en una FK; (c) es grupo 2 → migración normal, sin pasar por el procedimiento legacy.
- **`regla_alquiler` es el gancho limpio pedido en la consigna.** Se ships con default `POR_DEFINIR`, que el motor interpreta como "comportamiento actual" (cada ocupación cobra su alquiler completo). Cuando el negocio decida, se cambia el default y se agrega una implementación — no se toca la forma del modelo.
- **No se toca el ENUM `motivo_fin`.** Un traslado se registra con `motivo_fin='MUDANZA'` (que ya existe y ya se usa en datos reales) + la fila de `traslados_ocupacion` que lo desambigua. Agregar `'TRASLADO'` al ENUM es un rebuild de tabla legacy a cambio de casi nada; queda como opcional cosmético para Fase 3+.

### 2.4 `cobros_mensuales` — MODIFICADA, grupo 1 (procedimiento `modificar-esquema-legacy`)

**Fase 0/2 (aditivo, no-breaking):**

```sql
ALTER TABLE cobros_mensuales
  ADD COLUMN id_ocupacion INT UNSIGNED NULL AFTER id_unidad,
  ADD COLUMN consumo_kwh  DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER monto_luz,
  ADD KEY idx_cobro_ocupacion (id_ocupacion),
  ADD CONSTRAINT fk_cobro_ocupacion
      FOREIGN KEY (id_ocupacion) REFERENCES ocupacion_unidad (id_ocupacion);
```

Por qué cada una:

- **`id_ocupacion`**: cierra el gap que el propio código denuncia (0.7), arregla `CobroMensual::ocupacion()` (0.8), y es la identidad del tramo que necesita `CobroService::key()`.
- **`consumo_kwh` (snapshot)**: hoy el recibo del inquilino re-consulta `liquidacion_luz_detalle` por `(periodo, unidad)` en tiempo de generación del PDF (`PortalReciboController.php:151-154`). Eso significa que **si se regenera la liquidación de un período viejo, los kWh impresos en el recibo cambian aunque el dinero cobrado no** — una inconsistencia de la familia RF-16 que ya existe hoy. Con dos tramos por unidad esa consulta además elegiría una fila arbitraria. Un snapshot lo arregla y desacopla el recibo de la liquidación.

**Fase 3 (solo si la decisión 5.9 lo pide — romper la unicidad):**

```sql
-- Requiere id_ocupacion 100% backfilleado y NOT NULL. Ver §6, Fase 0.
ALTER TABLE cobros_mensuales
  MODIFY COLUMN id_ocupacion INT UNSIGNED NOT NULL,
  DROP INDEX uq_cobro_periodo_persona_unidad,
  ADD UNIQUE KEY uq_cobro_periodo_unidad_ocupacion (id_periodo, id_unidad, id_ocupacion);
```

**Cuándo hace falta romper la unicidad, exactamente:**

| Caso | ¿Rompe `uq (periodo, persona, unidad)`? |
|---|---|
| Escenario 2 — dos personas distintas, misma unidad, mismo período | **No.** Personas distintas → filas distintas. La `uq` actual ya lo soporta |
| Escenario 3 — misma persona, dos unidades | **No.** Unidades distintas |
| Escenario 1 — uno sale, unidad vacía | **No.** Un solo cobro |
| **Renovación/reingreso a mitad de período** — misma persona, misma unidad, dos ocupaciones (caso real 0.3: persona 4, unidad 5, oc. 5→39 en período 9) | **Sí**, y solo si el negocio quiere dos cobros separados en vez de fusionarlos |

Es decir: **la ruptura de la unicidad no es requisito de los 3 escenarios planteados.** Es requisito solo de la decisión 5.9. Por eso va en Fase 3 y no antes — y mientras tanto la protección contra duplicados accidentales sigue en pie.

> **Trampa a evitar:** no dejar `id_ocupacion` NULLABLE en la `uq` nueva. MySQL permite múltiples NULLs en un índice único, así que las filas históricas sin backfill quedarían sin ninguna protección de duplicados. O se hace `NOT NULL`, o se conserva la `uq` vieja.

### 2.5 Lo que explícitamente NO cambia

| Tabla | Cambio | Por qué |
|---|---|---|
| `lecturas_unidad` | **Ninguno** | Con Opción B no hace falta. Sí hay que **redefinir por escrito** la semántica de `id_ocupacion`: pasa de "la ocupación de `fecha_inicio` más reciente que se solapa" (accidente del `ORDER BY`) a **"la ocupación de cierre del período"**, y deja de ser fuente de verdad para el dinero |
| `liquidacion_luz_detalle` | **Ninguno** | Sigue siendo el ancla unidad↔recibo. Su `id_persona` pasa a ser informativo = persona de la ocupación de cierre; documentarlo y dejar de usarlo para calcular dinero |
| `ocupacion_unidad` | **Ninguno** | `traslados_ocupacion` cubre el vínculo; `motivo_fin='MUDANZA'` ya existe |
| `cobros_overrides_servicio` | **Ninguno en Fase 2** | Ver el ítem abierto en §3.6 |

### 2.6 Procedimiento de esquema — resolver la contradicción 0.13

El skill `modificar-esquema-legacy` manda `.sql` suelto en `database/schema/`, pero existen migraciones Laravel que ya alteraron `ocupacion_unidad` (guardadas con `Schema::hasColumn`). El skill `publicar-version` es explícito: *"No repetir el error de 'arreglarlo' convirtiéndolo en una migración de Laravel — eso rompe la convención del proyecto para tablas grupo 1."*

**Recomendación:** seguir el skill al pie de la letra.
- Tablas nuevas (`lecturas_corte`, `liquidacion_luz_tramo`, `traslados_ocupacion`) → **migraciones Laravel** (grupo 2, precedente `renovaciones_pendientes`).
- Columnas en `cobros_mensuales` → **`database/schema/cobros_id_ocupacion.sql`**, idempotente, aplicado a mano en local y en prod.
- **Agregar el `.sql` al checklist de despliegue** (el incidente `whatsapp_contacto` de 2026-07-25 es exactamente este fallo).
- Actualizar `$fillable` de `CobroMensual` (paso 3 del skill) y **regenerar `database/seed/schema_dump_test.sql`** (paso 4) — si no, los tests Pest de `CobroService` fallan contra `alquileres_db_test`.

---

## 3. Cambios de lógica de servicio

### 3.1 NUEVO: `TramoResolver` — la única fuente de verdad de la atribución

`laravel/app/Services/TramoResolver.php` (o `LecturaService::tramosParaPeriodo()`, si se prefiere no crear una clase).

```
tramosParaPeriodo(Periodo $p, ?int $idUnidad = null): Tramo[]
```

Algoritmo, por unidad:
1. Traer todas las ocupaciones no-`ANULADO` que se solapan con `[p.fecha_inicio, p.fecha_fin]` (misma condición de hoy, pero **sin `->first()`**).
2. Ordenar por `fecha_inicio ASC, id_ocupacion ASC`.
3. Recortar cada rango al período → candidatos a tramo.
4. Insertar tramos **vacantes** en los huecos (incluyendo huecos al inicio y al final del período).
5. Traer los `lecturas_corte` del par (período, unidad) ordenados por `fecha_corte`, y asignar los puntos de medición: `P0 = lecturas_unidad.lectura_anterior`, `Pf = lecturas_unidad.lectura_actual`, los `Ci` en el medio.
6. Calcular por tramo: `consumo_kwh = max(lectura_hasta - lectura_desde, 0)`, `dias`, `porcentaje_tramo`.
7. Marcar el estado del tramo: `OK` / `CORTE_PENDIENTE` (falta el número) / `INCONSISTENTE` (los cortes no son monótonos entre P0 y Pf).

Reglas invariantes que el resolver garantiza (y que hay que testear como propiedades):
- La unión de los tramos cubre exactamente `[p.fecha_inicio, p.fecha_fin]`, sin huecos ni solapes.
- `Σ consumo_kwh(tramos) == lectura_actual − lectura_anterior` de `lecturas_unidad`. **Esta es la invariante que evita inventar o perder kWh.**
- Con *n = 1* y sin cortes, devuelve un tramo idéntico al comportamiento actual.

**Fallback obligatorio:** si hay *n > 1* tramos pero el corte no tiene valor, el resolver **no adivina**. Devuelve `CORTE_PENDIENTE` y deja que la política de §5.8 decida (bloquear la generación vs. repartir por días).

### 3.2 `LecturaService::sincronizar()` — `laravel/app/Services/LecturaService.php:19`

| Qué | Cambio |
|---|---|
| Fila de `lecturas_unidad` | **Sin cambios**: sigue siendo una por unidad+período |
| Resolución de `id_ocupacion` | Reemplazar `orderByDesc('fecha_inicio')->orderByDesc('id_ocupacion')->first()` por *"la ocupación que cubre `periodo.fecha_fin`; si ninguna la cubre (unidad vacía al cierre), la última que se solapa"*. **Ojo:** difiere del comportamiento actual en un borde real — una ocupación que empieza tarde pero termina antes del fin del período hoy gana el `ORDER BY` y con la regla nueva no. Ese borde es precisamente el bug del escenario 2 |
| Nuevo | Sincronizar `lecturas_corte`: por cada frontera interna entre ocupaciones consecutivas dentro del período, `updateOrCreate` de una fila con `origen='AUTO'` y `lectura_corte = NULL` si no existía |
| Nuevo (guardas) | Nunca borrar un corte con `lectura_corte` no nula ni con `origen='MANUAL'`. Si una frontera desaparece (se editó la ocupación) y el corte ya tenía valor, marcarlo como huérfano visible en la UI en vez de borrarlo en silencio |
| Guarda nueva | Rechazar la sincronización si el período ya tiene cobros con pagos `REGISTRADO` (ver §6, riesgo de `forceRefresh`). Hoy solo se valida `periodo.assertEditable()` |

### 3.3 `LecturaService::filasParaPeriodo()` — `LecturaService.php:84`

- Devolver, además de la fila por unidad, `tramos[]` (desde el resolver) con: rango de fechas, inquilino, `lectura_corte` editable, consumo del tramo, días, y el estado del tramo.
- Extender `auditoria_lectura_anterior` con dos valores nuevos: `CORTE_PENDIENTE` y `CORTE_INCONSISTENTE`.
- **Cuidado con la lógica de bloqueo de edición existente**: hoy el frontend bloquea el input de `lectura_actual` cuando la auditoría da `OK` (`Lecturas/Index.jsx:116-121`). Esa regla no debe bloquear la edición de un corte pendiente — una unidad puede estar `OK` en su lectura de cierre y tener un corte sin cargar.

### 3.4 `LiquidacionService::preview()` / `generar()` — `LiquidacionService.php:106,199`

**La fórmula no se toca.** Ni `roundUpToTenth`, ni el IGV, ni `calcularPorcentajes()`, ni `previoGuardado()` (que sigue keyeado por `id_unidad` — cero riesgo sobre el congelado).

Se agrega un **paso 2 posterior**, dentro de la misma transacción de `generar()`:

1. Para cada unidad ya liquidada, pedirle los tramos al resolver.
2. Repartir `total_pagar_luz` de esa unidad entre los tramos **facturables** (los que tienen `id_ocupacion`), proporcional a `consumo_kwh` del tramo.
3. **Residuo al último tramo facturable**: `monto_ultimo = total_unidad − Σ(montos anteriores)`. Nunca `roundUpToTenth` por tramo.
4. Persistir en `liquidacion_luz_tramo` (delete + insert del período, igual que hace hoy con `liquidacion_luz_detalle`).
5. `preview()` devuelve los tramos anidados dentro de cada fila de unidad, para que la pantalla muestre el reparto **antes** de generar.

Caso borde a definir en código: si el consumo de todos los tramos facturables es 0 pero la unidad tiene monto (por `ajuste`), repartir por `dias` en vez de por `kWh`. Documentarlo.

**Punto que depende de la decisión 5.4:** con el reparto en esta capa, el dinero del tramo vacante **no se factura y lo absorbe el dueño**, lo cual es *inconsistente con el tratamiento actual de las unidades 100% vacías* (0.10: ahí se redistribuye entre los ocupados). Las dos implementaciones posibles:

- **(i) Absorbe el dueño (recomendada para Fase 2):** el reparto es puramente interno a la unidad. `LiquidacionService` no cambia su input. La diferencia se muestra en la UI como "consumo no atribuido: X kWh / S/ Y".
- **(ii) Se redistribuye (consistente con hoy):** hay que restar los kWh vacantes del `consumo_kwh` que entra a `calcularPorcentajes()`, con lo cual `liquidacion_luz_detalle.consumo_kwh` deja de ser el delta real del medidor → se pierde la trazabilidad directa contra `lecturas_unidad` y hay que agregar una columna para el crudo. Más caro y menos auditable.

### 3.5 `CobroService::buildProgramados()` — `laravel/app/Services/CobroService.php:104`

| Qué | Cambio | Por qué |
|---|---|---|
| Fuente de filas | `liquidacion_luz_detalle` → **`liquidacion_luz_tramo`** (que ya trae `id_ocupacion`, `id_persona`, `consumo_kwh`) | Con *n=1* el resultado es idéntico fila por fila |
| Join a `ocupacion_unidad` | Deja de ir vía `lecturas_unidad.id_ocupacion`; va directo por `liquidacion_luz_tramo.id_ocupacion` | Elimina la dependencia del puntero frágil (0.4) |
| **`CobroService::key()` (línea 26)** | `"{$idUnidad}:{$idPersona}"` → **`"{$idUnidad}:{$idOcupacion}"`** | **Crítico.** Sin esto, `keyBy('key')` en `forceRefresh` colapsa dos tramos en uno y se pierde un cobro en silencio |
| `armarFilaCobro()` (línea 61) | Agregar `id_ocupacion`, `consumo_kwh`, `dias`, y **`factor_alquiler` / `factor_servicios` (default 1.0)** | El factor es el gancho de §5. Con 1.0 el comportamiento es idéntico al de hoy — incluido el "defecto" de cobrar dos alquileres completos en el mes de traslado, que se conserva a propósito hasta que el negocio decida |
| Medidor compartido (líneas 144-160) | La ocupación del dependiente deja de buscarse por `estado='ACTIVO'` y pasa a resolverse por **tramos del período** (bug 0.9). Y si el dependiente tiene *n>1* tramos, su porción también se sub-reparte | Composición limpia: primero se parte entre unidades, después dentro de cada unidad entre tramos |
| Mínimo de luz (líneas 162-163) | Hoy se aplica por fila de cobro → con 2 tramos se cobrarían **2 mínimos** en el mes de transición. Depende de la decisión 5.5 | No decidirlo en el código: leerlo de la política |

### 3.6 `CobroService::generar()` / `forceRefresh()` — líneas 197 y 391

- `generar()`: persistir `id_ocupacion` y `consumo_kwh` en cada fila creada.
- `forceRefresh()`: `$actualesByKey` (línea 400) debe keyear por `id_ocupacion` del cobro. **Riesgo alto de regresión:** si los cobros históricos no tienen `id_ocupacion` backfilleado, la key vieja y la nueva no coinciden → `structureChanged = true` → con pagos activos lanza `ValidationException` y el admin no puede corregir un período viejo. Mitigación en dos partes: (a) backfill 100% en Fase 0 con query de verificación; (b) **key de compatibilidad** — si el cobro y el programado tienen ambos `id_ocupacion` nulo, caer a `unidad:persona`.
- `carryForwardOverride()` (línea 37) usa `(periodo, unidad, persona)`. Tras un traslado, el override de agua del inquilino **no lo sigue a la unidad nueva**. Decidir si debe seguirlo (usando `traslados_ocupacion` para mapear la unidad origen→destino).
- **Ítem abierto menor:** los overrides se keyean `unidad:persona:servicio`. Con dos tramos de la misma persona en la misma unidad, un override se aplicaría a los dos. Opciones: dejarlo así y documentarlo, o agregar `id_ocupacion` nullable a `cobros_overrides_servicio`. Recomendación: dejarlo así en Fase 2.

### 3.7 `CobroService::listarParaPeriodo()` (línea 281) y `PortalReciboController` — deuda y consumo

- El `leftJoin` a `liquidacion_luz_detalle` por `(id_periodo, id_unidad, id_persona)` (líneas 286-288) **deja de matchear** para el cobro del inquilino saliente (la fila de liquidación lleva el `id_persona` del de cierre) → `consumo_kwh` vendría `null`. Reemplazar por el snapshot `cobros_mensuales.consumo_kwh`, que además elimina el join.
- Mismo arreglo en `PortalReciboController::detalleConcepto()` (líneas 151-154): pasa a leer `$cobro->consumo_kwh` en vez de re-consultar la liquidación. **Bonus: arregla el bug preexistente** de que los kWh del recibo pueden cambiar al regenerar la liquidación.
- `deuda_anterior` (`CobroService.php:305-316` y `PortalReciboController.php:167-181`) se calcula por `(persona, unidad)`. Tras un traslado, la deuda de la unidad vieja no aparece en el cobro de la nueva. **No** cambiarlo a "solo persona": el hallazgo 0.5 muestra que una persona puede tener 3 unidades a la vez y la deuda se mostraría triplicada. La corrección correcta es **incluir las unidades encadenadas por `traslados_ocupacion`**.
- `DashboardService::consumoPorUnidadPeriodoAnterior()` sigue funcionando sin cambios (lee `liquidacion_luz_detalle`, que sigue siendo 1 fila por unidad). Esa es una de las ventajas concretas de la Opción B.

### 3.8 NUEVO: `TrasladoService` (Fase 3)

Una sola transacción que hace: finalizar origen (`FINALIZADO`, `fecha_fin = fecha_traslado`, `motivo_fin='MUDANZA'`) → crear ocupación destino (`fecha_inicio = fecha_traslado + 1`, según la convención de 0.2) → crear `traslados_ocupacion` → crear el `lecturas_corte` de la unidad **origen** y el de la unidad **destino** con los números que el admin acaba de tomar.

Guardas: respetar `uq_ocupacion_unidad_activa` (la unidad destino no puede tener otra ACTIVA), validar que `fecha_traslado` cae dentro de un período `ABIERTO`, y no permitir traslados sobre períodos con pagos registrados.

---

## 4. Implicancias de UI

### 4.1 Lecturas (`laravel/resources/js/Pages/Lecturas/Index.jsx`)

- **Fila maestra por unidad, igual que hoy** (Anterior / Auditoría / Actual / Consumo / Alquiler) → nada se mueve para el 90% de los casos.
- **Sub-filas expandibles cuando la unidad tiene tramos** (*n>1*), una por tramo: `15/07–24/07 · Juan Pérez · 10 días · [lectura de corte ___] · 12.40 kWh`.
- **Badge nuevo `Corte pendiente`** (variante `warning`) en la fila maestra + una tarjeta KPI nueva arriba ("Cortes pendientes: N"), en línea con las 4 tarjetas existentes.
- **Acción nueva por fila**: "Registrar corte" (fecha + lectura + observación) para el caso de una lectura de control sin cambio de inquilino.
- **La lectura de corte se ve y se edita igual que la de cierre** — mismo input numérico, misma validación. Lo único que la distingue visualmente es que vive en la sub-fila del tramo y muestra su rango de fechas. Esto es coherente con §1.2: no es un concepto nuevo para el usuario, es "la lectura que tomé el día que se fue".
- **Validación en vivo:** `lectura_anterior ≤ corte₁ ≤ … ≤ lectura_actual`. Si falla, badge `Inconsistente` y bloquear el guardado de esa unidad.
- **Endpoint `lecturas.save`** (`LecturaController.php:26`) hoy solo actualiza `lectura_actual` por `id_lectura`. Necesita aceptar un array paralelo `cortes: [{id, lectura_corte}]`.
- **Permisos:** reutilizar `lecturas.registrar` para cortes (el Supervisor ya toma lecturas; tomar la de corte es la misma tarea física). Crear `lecturas.cortes.gestionar` solo si el negocio quiere que el Supervisor no pueda alterar fronteras de ocupación.

### 4.2 Ocupaciones (`laravel/resources/js/Pages/Ocupaciones/Index.jsx`)

**Sí, hace falta una acción explícita "Trasladar a otra unidad".** Razones concretas, no de comodidad:

1. **Es el único momento en que el dueño tiene el número del medidor en la mano.** Si el flujo es "Finalizar" + "Crear" (dos pantallas, dos momentos), la lectura de corte se pierde — que es exactamente el problema del escenario 1.
2. Es el único punto donde se puede escribir `traslados_ocupacion` de forma confiable (reconstruirlo después desde `motivo_fin='MUDANZA'` + proximidad de fechas es heurística, no dato).
3. Garantiza la convención de fechas (0.2) en vez de dejarla al criterio de quien tipea.

Diseño del modal, en un solo paso, sobre una ocupación ACTIVA:

```
Trasladar a otra unidad
  Desde:  201 · Juan Pérez  (contrato desde 01/03)
  Hacia:  [selector de unidades sin ocupación activa]
  Fecha del traslado: [__/__/____]
  ─────────────────────────────────────────────
  Lectura del medidor de 201 al 24/07:  [______]   ← corte de salida
  Lectura del medidor de 202 al 24/07:  [______]   ← corte de apertura
  ─────────────────────────────────────────────
  Alquiler / garantía en la unidad nueva: [___] [___]
  ⚠ Este mes se generarán dos cobros (201 y 202). La regla de alquiler
    para meses de traslado está pendiente de definir — ver Configuración.
```

Ese aviso es importante: hace **visible** el comportamiento actual (dos alquileres completos) en vez de que aparezca como sorpresa en Cobros. Reutiliza el patrón ya existente de `prefillRenovacion` (que precarga el formulario tras finalizar), solo que en un único paso atómico.

Permisos: `ocupaciones.trasladar` nuevo (o exigir `ocupaciones.crear` **y** `ocupaciones.finalizar` juntos, que es lo que la acción realmente hace).

En el **mapa de unidades** (`unidadesMapa`), marcar con un badge las unidades con traslado en el período abierto.

### 4.3 Cobros (`laravel/resources/js/Pages/Cobros/Index.jsx`)

- Bajo el código de unidad, mostrar el **rango del tramo** cuando no cubre el período completo: `201 · 15/07–24/07 (10 d)`. Si cubre todo, no mostrar nada → cero ruido en el caso normal.
- **Badge `Traslado`** en los dos cobros vinculados por `traslados_ocupacion`, con tooltip "201 → 202 el 24/07" y link cruzado.
- La columna de consumo pasa a leer el snapshot del cobro (§3.7).
- El modal de detalle ya lista conceptos; agregar una línea de contexto arriba: `Tramo: 15/07–24/07 · 10 días · 12.40 kWh`.

### 4.4 Liquidación (`laravel/resources/js/Pages/Liquidacion/Index.jsx`)

- Fila por unidad igual que hoy (el ajuste manual sigue siendo **por unidad**, keyeado por `id_unidad` en `LiquidacionController::generar()` — no cambia).
- Sub-filas expandibles con el reparto por tramo: `kWh · % del tramo · S/`.
- Fila destacada **"consumo no atribuido"** cuando hay tramos vacantes, con el monto. Hoy ese número no existe en ningún lado y es justamente lo que el dueño necesita ver para decidir 5.4.

### 4.5 Recibo del inquilino (`PortalReciboController` + `resources/views/portal/recibo.blade.php`)

**Recomendación: un recibo por cobro** (no consolidar). Mantiene la regla "1 cobro = 1 recibo = 1 folio", no toca la numeración correlativa (`comprobante_correlativos` + `PagoService::siguienteNumeroComprobante()`), y no rompe la separación recibo/comprobante del skill de facturación.

Lo que se agrega:
- Junto a `periodoTexto`, el rango del tramo cuando es parcial: `Julio 2026 · del 15 al 24`.
- Una **nota cruzada** cuando el cobro pertenece a un traslado: *"Traslado a la unidad 202 el 24/07. Ver el recibo complementario de esa unidad."*
- En el detalle de LUZ, seguir aplicando la regla `minimo_kwh_aviso` del skill `reglas-negocio-facturacion` — pero definir contra qué consumo se evalúa (decisión 5.6).
- `descargarTodos()` ya agrupa por persona sin asumir una unidad; no requiere cambios.

---

## 5. Decisiones de negocio abiertas (para que las tome el usuario, no el diseño)

| # | Decisión | Opciones | Impacto técnico |
|---|---|---|---|
| **5.1** | **Alquiler de un tramo parcial** (se fue el día 10 de un período de 30) | (a) completo (=hoy) · (b) prorrateo por días · (c) cero si ocupó menos de X días | `factor_alquiler` en `armarFilaCobro()`. Ninguna estructura cambia |
| **5.2** | **Alquiler en un traslado** (201→202 el mismo período) | (a) dos completos (=hoy) · (b) uno completo, ¿cuál? · (c) prorrateo entre las dos | `traslados_ocupacion.regla_alquiler`. Es el caso que la consigna señala como duplicación |
| **5.3** | **Denominador del prorrateo por días** | (a) días del período (¡no son 30 fijos: abril 2026 duró 14 — hallazgo 0.1) · (b) días del mes calendario · (c) 30 fijos | Define `Tramo.dias` / `Periodo.dias`. Con (a), en un período corto el prorrateo da montos muy distintos a la intuición |
| **5.4** | **Consumo del tramo vacante** — ¿quién lo paga? | (a) lo absorbe el dueño · (b) se redistribuye como gasto común entre los ocupados — **es el comportamiento actual para unidades 100% vacías** (0.10) · (c) se le carga al saliente | Determina si `LiquidacionService` recibe kWh crudos o kWh facturables (§3.4). (b) es más caro y menos auditable |
| **5.5** | **Mínimo de luz (`monto_minimo_luz`)** con dos tramos | (a) por cobro → se cobran **dos mínimos** ese mes · (b) uno por unidad+período, prorrateado entre tramos · (c) solo al tramo mayoritario | `CobroService.php:162-163`. Con 9 unidades y mínimos de S/ 5–10, (a) es plata real y visible |
| **5.6** | **`minimo_kwh_aviso`** (regla de presentación): ¿contra qué consumo se compara? | (a) el del tramo (un tramo corto casi siempre mostrará 0.00 kWh) · (b) el del período completo de la unidad | Solo presentación; afecta `Avisos/Index.jsx` y el recibo PDF |
| **5.7** | **Mínimo de días para que un tramo genere cobro propio** | (a) sin mínimo (un tramo de 1 día genera su cobro de S/ 2) · (b) < N días se fusiona con el tramo contiguo · (c) < N días se ignora y su consumo va al contiguo | Determina si hay que romper la `uq` de cobros (§2.4). Con fusión, en la mayoría de los casos **no hace falta romperla** |
| **5.8** | **Tramo sin lectura de corte cargada al momento de generar** | (a) bloquear la generación de cobros del período · (b) repartir por días como fallback y avisar · (c) atribuir todo al tramo de cierre (=hoy) | (a) es lo más seguro para el dinero pero puede trabar el ciclo mensual; (c) es literalmente el bug actual |
| **5.9** | **Renovación de contrato a mitad de período con cambio de precio** (caso real 0.3: persona 4, unidad 5) | (a) un cobro con el precio nuevo · (b) un cobro con el viejo · (c) dos cobros, uno por tramo | **Es la única decisión que obliga a romper `uq_cobro_periodo_persona_unidad`.** Solo (c) la requiere |
| **5.10** | **Garantía en un traslado** | (a) se traslada tal cual · (b) se devuelve y se cobra de nuevo · (c) se ajusta la diferencia si el alquiler cambia | Hoy `garantia` se copia a mano al crear la ocupación nueva |
| **5.11** | **Deuda anterior después de un traslado** | (a) sigue a la persona a la unidad nueva · (b) queda atada a la unidad vieja (=hoy) | `deuda_anterior` en `CobroService` y `PortalReciboController` (§3.7) |
| **5.12** | **Portal del inquilino en el mes de transición** | (a) dos cobros y dos recibos separados (recomendado técnicamente) · (b) uno consolidado | (b) obliga a repensar el folio correlativo y el modelo pago↔cobro |
| **5.13** | **Convención de intervalos de ocupación** (no es opinable, hay que fijarla — 0.2) | (a) cerrado-cerrado con `fecha_inicio = fecha_fin_anterior + 1` (lo que sugiere la UI) · (b) el día del traslado pertenece al saliente · (c) al entrante | Sin esto los tramos no son deterministas. **Requiere además limpiar las ~5 filas reales que se solapan un día** |

---

## 6. Plan de implementación por fases

### Fase 0 — Red de seguridad y saneamiento (sin cambio funcional visible)

| Paso | Qué | Riesgo |
|---|---|---|
| 0.1 | **Tests golden primero.** Fijar el comportamiento actual con *n=1*: un test que reproduzca 2–3 períodos históricos reales (datos de `database/backups/`) y afirme los `cobros_mensuales` resultantes centavo a centavo. Sin esto, no hay cómo demostrar que Fase 2 no rompió nada | — |
| 0.2 | **Fijar la convención de fechas (5.13)** + validación en `OcupacionController::rules()`/`assertSinActivaSolapada()` que impida solapes de fechas (hoy solo valida `estado='ACTIVO'`) | Bajo |
| 0.3 | **Limpiar los solapes de un día** en `ocupacion_unidad` (oc. 5/39, 2/38, 4/41, 35/10). Script `.sql` idempotente + backup previo | Bajo, pero toca datos reales |
| 0.4 | `database/schema/cobros_id_ocupacion.sql`: `ADD COLUMN id_ocupacion` + `consumo_kwh`. **Backfill** + query de verificación (`SELECT COUNT(*) FROM cobros_mensuales WHERE id_ocupacion IS NULL` debe dar 0) | Medio — aplicar en local **y** prod, checklist de deploy |
| 0.5 | `CobroService::key()` con `id_ocupacion` + fallback a `persona`. `CobroMensual::ocupacion()` usa la columna. `$fillable` actualizado. Regenerar `schema_dump_test.sql` | Medio — cubierto por 0.1 |
| 0.6 | Corregir el bug latente de medidor compartido (0.9): ocupación del dependiente por período, no por `estado='ACTIVO'` | Bajo |

**Shippeable al final de Fase 0:** nada cambia de cara al usuario, pero el sistema queda con la columna que cierra el gap denunciado en `OcupacionUnidad.php:41-50` y con la red de tests.

---

### Fase 1 — Captura del corte (shippeable ya, esquema mínimo, no-breaking)

Esta es la fase que **entrega valor inmediato al escenario 1** sin depender de ninguna decisión de negocio.

| Paso | Qué |
|---|---|
| 1.1 | Migración Laravel `lecturas_corte` (grupo 2) |
| 1.2 | `TramoResolver` + tests de propiedad (cobertura, no-solape, `Σ kWh` == delta del medidor) |
| 1.3 | `LecturaService::sincronizar()` detecta fronteras y crea cortes `AUTO` pendientes; `filasParaPeriodo()` devuelve tramos |
| 1.4 | UI de Lecturas: sub-filas, badge `Corte pendiente`, KPI, acción "Registrar corte", endpoint extendido |
| 1.5 | Guarda: no sincronizar cortes en períodos con pagos registrados |

**El dinero NO cambia en esta fase.** Los tramos se calculan y se muestran, pero `LiquidacionService` y `CobroService` siguen intactos. El dueño ya puede registrar "esta lectura de corte pertenece a ESTA ocupación" y verla — que es literalmente lo que pide el escenario 1 — aunque el reparto del cobro todavía sea el de hoy.

Esto es deliberado: separa "capturar el dato" (sin riesgo) de "cambiar el dinero" (con riesgo), y permite acumular uno o dos meses de datos reales de corte antes de que muevan un centavo.

---

### Fase 2 — Atribución del consumo (cambia dinero; requiere decidir 5.4, 5.5, 5.7, 5.8)

| Paso | Qué |
|---|---|
| 2.1 | Migración `liquidacion_luz_tramo` |
| 2.2 | `LiquidacionService`: paso de reparto post-cálculo con residuo. Fórmula intacta |
| 2.3 | `CobroService::buildProgramados()` desde tramos; `factor_alquiler`/`factor_servicios` cableados en 1.0 |
| 2.4 | `forceRefresh` con key por ocupación + compat |
| 2.5 | `listarParaPeriodo` y `PortalReciboController` leen el snapshot `consumo_kwh` |
| 2.6 | UI: sub-filas en Liquidación con el reparto y el "no atribuido"; rango de tramo en Cobros y recibo |
| 2.7 | **Arnés de regresión:** correr Fase 2 contra los 8 períodos históricos y verificar salida byte-idéntica (ninguno tiene cortes → *n=1* en todos) |

**Criterio de aceptación duro:** un período sin cortes debe producir exactamente los mismos `cobros_mensuales` que antes. Si el arnés 2.7 no da idéntico, no se shipea.

**Riesgo específico y su mitigación:** cambiar la cantidad de filas de cobro de un período dispara `structureChanged` en `forceRefresh` (`CobroService.php:409`), y con pagos activos lanza excepción (línea 452). Además los triggers `trg_pagos_detalle_*` validan contra `cobros_mensuales_detalle`, así que partir un cobro en dos **después** de cobrado no es reversible. Mitigación: la guarda de 1.5 y 3.2 — **prohibir agregar cortes a un período que ya tiene cobros con pagos registrados**.

---

### Fase 3 — Traslado como acción de primera clase (requiere 5.2, 5.10, 5.11, 5.13)

| Paso | Qué |
|---|---|
| 3.1 | Migración `traslados_ocupacion` |
| 3.2 | `TrasladoService` + modal "Trasladar a otra unidad" (atómico: finaliza + crea + vincula + captura los dos cortes) |
| 3.3 | Badge `Traslado` y links cruzados en Cobros y en el recibo |
| 3.4 | `deuda_anterior` sigue la cadena de traslados (5.11) |
| 3.5 | `regla_alquiler` deja de ser `POR_DEFINIR` y `factor_alquiler` deja de ser 1.0 |
| 3.6 | Solo si 5.9 = "dos cobros": romper `uq_cobro_periodo_persona_unidad` (§2.4) |

---

### Fase 4 — Sesión propia: prorrateo general por días (5.1, 5.3)

Prorratear alquiler y servicios en **cualquier** tramo parcial, no solo en traslados. Requiere además decidir si el prorrateo aparece como línea propia en `cobros_mensuales_detalle` (lo que toca `conceptos_cobro` y la prioridad de aplicación de pagos en `PagoService::aplicacionesAutomaticas()`). Es el punto 8 del documento de requerimientos en su forma completa; este diseño solo deja el `factor_*` listo para recibirlo.

---

### Protecciones existentes que ningún cambio puede violar

| Protección | Dónde | Cómo se respeta |
|---|---|---|
| **RF-16** — un cobro generado no cambia de monto salvo regeneración explícita | `docs/requerimientos-proyecto.md`, `CobroServiceTest.php:35` | `liquidacion_luz_tramo` y `cobros_mensuales.consumo_kwh` son snapshots escritos al generar. El nuevo snapshot de kWh además **arregla** una violación preexistente del espíritu de RF-16 en el recibo PDF |
| **`forceRefresh` preserva pagos** | `CobroService.php:391-496` | Key con fallback + backfill 100% + guarda que impide alterar la estructura de tramos de un período con pagos |
| **`generar()` bloqueado si hay pagos** | `CobroService.php:202-205` | Sin cambios |
| **`uq_ocupacion_unidad_activa`** (columna generada `activa_flag`) | `database/schema/ocupacion_activa_constraint.sql` | `TrasladoService` finaliza el origen dentro de la misma transacción antes de activar el destino |
| **Nunca `migrate:fresh`** | `CLAUDE.md` | Las tablas nuevas son grupo 2, pero la regla sigue en pie |
| **Tests de Services contra MySQL real** | skill `correr-tests` | `schema_dump_test.sql` hay que regenerarlo tras el ALTER de `cobros_mensuales` |
| **`.sql` de grupo 1 se aplican a mano en prod** | skill `publicar-version` (incidente `whatsapp_contacto`) | El `.sql` de Fase 0.4 va explícito en el checklist de despliegue |

### Punto de control del strangler fig

A partir de la Fase 2, la app legacy (`api/modules/lecturas/sync.php`, `liquidacion/*.php`, `cobros/common.php`) **calcula números distintos** para cualquier período con cortes: ignora `lecturas_corte` y `liquidacion_luz_tramo`, así que sigue atribuyendo el consumo entero al ocupante de cierre. No se rompe (todas las tablas que lee siguen intactas), pero **discrepa en dinero**. Producción sirve solo Laravel (`document root` → `laravel/public`), así que el riesgo es local. Recomendación: al cerrar Fase 2, o se deshabilita el acceso local a esos tres módulos legacy, o se les pone un banner de "obsoleto — usar la app Laravel". Es el checkpoint natural para dar por estrangulados Lecturas/Liquidación/Cobros.

---

### Archivos críticos para la implementación

- `C:\laragon\www\alquileres_app\laravel\app\Services\LecturaService.php` — resolución de ocupación (línea 32) y `filasParaPeriodo()`; origen de los tramos y de los cortes
- `C:\laragon\www\alquileres_app\laravel\app\Services\CobroService.php` — `key()` (26), `armarFilaCobro()` (61), `buildProgramados()` (104), `forceRefresh()` (391); es donde aterriza el dinero por tramo
- `C:\laragon\www\alquileres_app\laravel\app\Services\LiquidacionService.php` — `preview()`/`generar()`; la fórmula NO se toca, se le agrega el reparto por tramo con residuo
- `C:\laragon\www\alquileres_app\laravel\app\Models\OcupacionUnidad.php` y `C:\laragon\www\alquileres_app\laravel\app\Models\CobroMensual.php` — el docblock de `cobros()` (41-50) y `ocupacion()` (53-69) documentan el gap exacto que cierra `cobros_mensuales.id_ocupacion`
- `C:\laragon\www\alquileres_app\laravel\app\Http\Controllers\OcupacionController.php` — `store`/`destroy`; base del futuro `TrasladoService` y de la validación de solapes de fechas (0.2)
- `C:\laragon\www\alquileres_app\database\backups\backup_alquileres_db_20260819_030003.sql` — DDL real y vigente de las 3 tablas legacy (el `schema_dump_test.sql` está desactualizado: le faltan `motivo_fin`/`renovada_de_id`)