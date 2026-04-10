# Diseno de pagos por concepto

## Objetivo

El modelo actual ya separa los importes del cobro mensual por columnas en `cobros_mensuales`, pero los pagos solo guardan un monto total en `pagos`. Para soportar pago total y pago por concepto sin perder historial, el modelo final agrega dos niveles:

1. `cobros_mensuales_detalle`: una fila por concepto facturado dentro de cada cobro.
2. `pagos_detalle`: una fila por aplicacion del pago sobre un concepto concreto del cobro.

Con esto se puede responder exactamente:

- cuanto debe por concepto;
- de que periodo es la deuda;
- cuanto pago en total y a que conceptos se aplico;
- quien registro, actualizo o reverso un pago;
- cual fue la asignacion real o inferida durante la migracion.

## Modelo propuesto

### Tablas nuevas

#### `conceptos_cobro`

Catalogo maestro de conceptos cobrables.

- `ALQUILER`
- `LUZ`
- `AJUSTE_MINIMO_LUZ`
- `AGUA`
- `GAS`
- `OTROS`
- `MORA`
- `DESCUENTO`

Campos principales:

- `codigo`: identificador estable para negocio y migracion.
- `prioridad_aplicacion`: orden por defecto para pagos automaticos.
- `permite_pago_directo`: evita asignar pagos manuales a conceptos negativos como descuento.

#### `cobros_mensuales_detalle`

Representa el detalle facturado por concepto dentro de un cobro mensual.

Campos principales:

- `id_cobro`: FK a `cobros_mensuales`.
- `id_concepto`: FK a `conceptos_cobro`.
- `monto_programado`: importe del concepto. Puede ser negativo para descuentos.
- `descripcion`: texto libre para aclarar el item.
- `orden_visual`: orden de presentacion.

Notas:

- `cobros_mensuales` se mantiene como cabecera y snapshot compatible.
- La deuda por concepto se calcula desde `cobros_mensuales_detalle` menos `pagos_detalle`.
- Los conceptos con monto negativo actuan como creditos de negocio; reducen el exigible neto del cobro, pero no reciben pagos directos.
- No se duplica deuda anterior en el periodo actual; se consulta desde periodos previos con saldo abierto.

#### `pagos_detalle`

Representa cuanto de un pago se aplica a cada concepto del cobro.

Campos principales:

- `id_pago`: FK a `pagos`.
- `id_cobro_detalle`: FK a `cobros_mensuales_detalle`.
- `monto_aplicado`: importe aplicado a esa linea.
- `origen_aplicacion`: `MANUAL`, `AUTOMATICA`, `MIGRACION` o `REVERSA`.

Restricciones:

- un mismo pago no debe tener dos filas para la misma linea del cobro;
- `monto_aplicado > 0`;
- la suma de `pagos_detalle` debe igualar `pagos.monto_pagado` para pagos activos;
- la linea aplicada debe pertenecer al mismo `id_cobro` que el pago.

#### `pagos_auditoria`

Bitacora de eventos de pago.

Eventos sugeridos:

- `CREADO`
- `ACTUALIZADO`
- `APLICADO`
- `REVERSADO`
- `ANULADO`

Campos principales:

- `id_pago`
- `accion`
- `actor`
- `payload_before`
- `payload_after`
- `created_at`

## Cambios sobre tablas existentes

### `pagos`

Se mantiene como cabecera del pago para compatibilidad con la app actual, pero se le agregan columnas de auditoria y reversa.

Campos nuevos:

- `estado`: `REGISTRADO`, `REVERSADO`, `ANULADO`
- `origen_registro`: `MANUAL`, `MIGRACION`, `AJUSTE`
- `registrado_por`
- `reversado_por`
- `fecha_reversa`
- `motivo_reversa`

`pagos.id_cobro` se conserva. En esta etapa el alcance recomendado es un pago por cobro. Eso simplifica la migracion y evita romper el backend actual.

### `cobros_mensuales`

Se conserva la estructura actual para no romper pantallas ni reportes.

Rol recomendado de cada nivel:

- `cobros_mensuales`: cabecera, estado global, total y columnas historicas de compatibilidad.
- `cobros_mensuales_detalle`: fuente de verdad del saldo por concepto.

## Reglas de negocio

### 1. No duplicar deuda anterior

La deuda anterior no se inserta como una nueva fila en el cobro actual. Se calcula como la suma de saldos abiertos de `cobros_mensuales_detalle` en periodos anteriores del mismo `id_persona + id_unidad`.

Consecuencia:

- el periodo actual solo contiene sus conceptos propios;
- la deuda anterior se ve en consultas o vistas de saldo;
- no se infla artificialmente `total_cobrar` del nuevo periodo.

### 2. Pago total

Si el usuario registra un pago total sin especificar conceptos, el sistema aplica automaticamente dentro del mismo cobro:

1. conceptos con saldo pendiente;
2. ordenados por `prioridad_aplicacion` del catalogo;
3. a igualdad de prioridad, por `orden_visual` y luego `id_cobro_detalle`.

Prioridad inicial recomendada:

1. `ALQUILER`
2. `LUZ`
3. `AJUSTE_MINIMO_LUZ`
4. `AGUA`
5. `GAS`
6. `OTROS`
7. `MORA`

`DESCUENTO` no recibe pagos directos.

### 3. Pago por concepto

Si el usuario selecciona conceptos, el backend inserta un `pago` y sus filas en `pagos_detalle` exactamente por los importes indicados. No se debe permitir:

- aplicar a conceptos con saldo cero;
- exceder el saldo del concepto;
- registrar un `monto_pagado` distinto a la suma de `pagos_detalle`.

### 4. Estados de pago

Estado global del cobro:

- `PENDIENTE`: suma aplicada igual a 0.
- `PARCIAL`: suma aplicada mayor a 0 y menor al total exigible neto del cobro.
- `PAGADO`: suma aplicada igual o mayor al total exigible neto del cobro.
- `ANULADO`: solo por anulacion explicita del cobro.

Estado por concepto:

- no se almacena; se deriva del saldo de cada fila. Para conceptos credito como `DESCUENTO`, el saldo exigible es 0 y el efecto se ve en el total neto del cobro.

### 5. Reversa

Una reversa no elimina fisicamente el pago. Debe:

1. cambiar `pagos.estado` a `REVERSADO`;
2. guardar `reversado_por`, `fecha_reversa` y `motivo_reversa`;
3. mantener intacto `pagos_detalle` para auditoria;
4. excluir pagos reversados de los calculos de saldo.

### 6. Migracion historica

Los pagos historicos no contienen asignacion real por concepto. Para no perder datos, la migracion los distribuye por una regla determinista usando `prioridad_aplicacion` y marca las filas migradas con `origen_aplicacion = 'MIGRACION'`.

Esto deja trazabilidad, pero hay una limitacion importante:

- si historicamente un usuario pago primero luz y luego alquiler, hoy esa intencion no existe en la base actual;
- por eso la migracion puede reconstruir un saldo consistente, pero no garantizar la intencion exacta de cada pago historico.

## Plan de migracion

### Fase 1. Preparacion

1. crear tablas nuevas;
2. cargar catalogo `conceptos_cobro`;
3. agregar columnas de auditoria y reversa a `pagos`.

### Fase 2. Carga inicial de detalle de cobros

Generar `cobros_mensuales_detalle` desde las columnas actuales de `cobros_mensuales`.

Mapeo inicial:

- `monto_alquiler` -> `ALQUILER`
- `monto_luz` -> `LUZ`
- `ajuste_minimo_luz` -> `AJUSTE_MINIMO_LUZ`
- `monto_agua` -> `AGUA`
- `monto_gas` -> `GAS`
- `otros_conceptos` -> `OTROS`
- `mora` -> `MORA`
- `descuento` -> `DESCUENTO` con monto negativo

### Fase 3. Migracion de pagos

1. marcar pagos actuales con `origen_registro = 'MIGRACION'`;
2. distribuir cada `pagos.monto_pagado` entre las lineas del cobro segun prioridad;
3. insertar `pagos_detalle`;
4. registrar auditoria inicial.

### Fase 4. Validacion

Validaciones minimas:

- suma de `cobros_mensuales_detalle.monto_programado` por cobro igual a `cobros_mensuales.total_cobrar`;
- suma de `pagos_detalle.monto_aplicado` por pago activo igual a `pagos.monto_pagado`;
- estados globales de `cobros_mensuales` recalculados y consistentes.

### Fase 5. Adaptacion de backend

Despues de validar la migracion:

1. al generar cobros, insertar cabecera y detalle en la misma transaccion;
2. al registrar pagos, exigir detalle de aplicacion o aplicar automaticamente por prioridad;
3. recalcular `estado_pago` desde el detalle.

## Consultas principales esperadas

1. saldo por concepto de un cobro;
2. deuda anterior por persona y unidad;
3. pagos con sus conceptos aplicados;
4. resumen por periodo y concepto;
5. auditoria y reversas.

## Decisiones finales recomendadas

### Prioridad de aplicacion

Recomendacion operativa final:

1. `ALQUILER`
2. `LUZ`
3. `AJUSTE_MINIMO_LUZ`
4. `AGUA`
5. `GAS`
6. `OTROS`
7. `MORA`

Motivo:

- mantiene primero la renta principal;
- evita que servicios menores consuman pagos antes del alquiler;
- deja la mora al final para no inflar castigos sobre deuda principal aun no cubierta.

### Reversa

Recomendacion operativa final:

- usar reversa por cambio de estado en `pagos`;
- no insertar montos negativos espejo en `pagos_detalle`;
- conservar las aplicaciones historicas y excluirlas por `pagos.estado` en consultas de saldo;
- exigir `motivo_reversa`, `reversado_por` y `fecha_reversa`.

Motivo:

- la auditoria queda mas clara;
- se evita duplicar movimientos contables dentro del mismo modelo transaccional;
- simplifica la consulta de trazabilidad del pago original.

### Actor de auditoria

Recomendacion operativa final:

- mientras no exista tabla de usuarios, guardar `registrado_por` y `reversado_por` como texto libre controlado por backend;
- cuando exista autenticacion, migrar estos campos a `id_usuario` nullable manteniendo el texto como snapshot opcional.

### Exactitud del detalle del pago

Recomendacion operativa final:

- permitir que un pago nazca en transaccion con cabecera y detalle;
- validar que la suma de `pagos_detalle` sea igual a `pagos.monto_pagado` antes de confirmar la transaccion;
- no depender solo de triggers para esta igualdad exacta, porque el detalle puede insertarse en varias filas dentro de la misma operacion.

## Pasos de implementacion recomendados

### Paso 1. Desplegar estructura

1. ejecutar [database/pagos_por_concepto_schema.sql](database/pagos_por_concepto_schema.sql);
2. ejecutar [database/pagos_por_concepto_migracion.sql](database/pagos_por_concepto_migracion.sql);
3. ejecutar [database/pagos_por_concepto_guardrails.sql](database/pagos_por_concepto_guardrails.sql);
4. correr validaciones de [database/pagos_por_concepto_consultas.sql](database/pagos_por_concepto_consultas.sql).

### Paso 2. Adaptar backend sin romper compatibilidad

1. al generar cobros, seguir llenando `cobros_mensuales` y ademas insertar `cobros_mensuales_detalle`;
2. al listar cobros, empezar a leer saldo por concepto desde el detalle;
3. mantener temporalmente los campos columnares actuales para las pantallas existentes.

### Paso 3. Reemplazar registro de pagos

1. insertar cabecera en `pagos`;
2. insertar `pagos_detalle` manual o automatico dentro de la misma transaccion;
3. recalcular estado del cobro;
4. insertar auditoria.

### Paso 4. Habilitar reversa y consulta historica

1. agregar endpoint de reversa;
2. exponer detalle aplicado por concepto;
3. exponer deuda anterior desde periodos previos sin duplicarla en el periodo vigente.

### Paso 5. Retiro gradual de dependencias antiguas

1. migrar reportes a consultas por detalle;
2. dejar `cobros_mensuales.total_cobrar` como snapshot y compatibilidad;
3. evaluar mas adelante si conviene una cabecera superior de recibo para pagos multi-cobro.

