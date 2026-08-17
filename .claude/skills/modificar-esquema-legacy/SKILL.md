---
name: modificar-esquema-legacy
description: Cambiar el esquema de una tabla heredada de la app legacy (Ocupaciones, Cobros, Pagos, Lecturas, etc.). Usar cuando se pida agregar una columna, crear una tabla, un trigger o un constraint relacionado a esas tablas de negocio — NO para tablas nuevas propias de Laravel (users, roles, comprobantes_pago...), esas van con migraciones normales.
---

# Modificar el esquema de una tabla heredada

## La distinción que importa

Este proyecto tiene **dos tipos de tablas** en `alquileres_db`, y
confundirlas rompe cosas:

1. **18 tablas de negocio heredadas de la app legacy** — `personas`,
   `unidades`, `ocupacion_unidad`, `cobros_mensuales`,
   `cobros_mensuales_detalle`, `pagos`, `pagos_detalle`, `pagos_auditoria`,
   `periodos`, `recibos_luz`, `lecturas_unidad`, `liquidacion_luz_detalle`,
   `tarifas_servicios`, `config_cobranza`, `conceptos_cobro`, `inmuebles`,
   etc. **Laravel no las gestiona por migraciones** — Eloquent solo las lee.
2. **Tablas nuevas introducidas durante la migración a Laravel** —
   `users`, `roles`/`permissions` (Spatie), `comprobantes_pago`,
   `renovaciones_pendientes`, `contact_inquiries`, `modules`,
   `payment_gateway_transactions`, `comprobante_correlativos`, etc. Estas
   **sí** tienen sus migraciones normales en `laravel/database/migrations/`.

Cómo distinguir una tabla dada: si aparece en `docs/requerimientos-proyecto.md`
punto 1 (los 13 módulos originales) o en `database/schema/*.sql`, es del
grupo 1. Si no, buscarla en `laravel/database/migrations/` — si tiene
migración propia, es del grupo 2.

## Regla que no se negocia

**Nunca `php artisan migrate:fresh`** — borraría las 18 tablas del grupo 1
porque Laravel no las tiene registradas como propias, y no hay forma de
recrearlas solo con `migrate` (ver más abajo cómo se reconstruyen). El
propio `laravel/README.md` lo advierte explícitamente.

## Para una tabla del grupo 2 (Laravel-nativa)

Flujo normal:

```bash
php artisan make:migration crear_tabla_x
php artisan migrate
```

No hace falta este skill para eso.

## Para una tabla del grupo 1 (heredada)

1. Escribir el cambio como un script `.sql` nuevo en `database/schema/`,
   siguiendo el estilo de los archivos existentes ahí (`START TRANSACTION;`
   ... DDL idempotente con `IF NOT EXISTS` / chequeo de columna existente
   ... `COMMIT;`). Ver `database/schema/ocupacion_activa_constraint.sql`
   o `database/schema/tarifas_auditoria_schema.sql` como referencia de
   formato.
2. Aplicarlo directo contra la base:
   ```bash
   mysql -h127.0.0.1 -uroot alquileres_db < database/schema/nombre_del_cambio.sql
   ```
3. Si el cambio afecta a un Model de Laravel existente (`laravel/app/Models/`),
   actualizar su `$fillable`/relaciones para que Eloquent lo vea.
4. Si hay tests Pest que dependen del esquema (`LiquidacionService`,
   `CobroService`, `PagoService`), regenerar `database/seed/schema_dump_test.sql`
   — ver skill `correr-tests`.
5. Documentar el archivo nuevo en `database/README.md` si agrega una
   pieza no obvia (igual que las demás entradas de `schema/`).

## Piezas no obvias que ya viven en tablas del grupo 1

- `ocupacion_unidad.activa_flag` — columna generada (`GENERATED ALWAYS AS`)
  usada para un índice único que evita dos ocupaciones ACTIVAS
  simultáneas en la misma unidad. sqlite no puede replicar esto, por eso
  los tests Pest corren contra MySQL real.
- `sp_recalcular_estado_cobro` — stored procedure (en
  `database/schema/pagos_por_concepto_guardrails.sql`) que recalcula el
  estado de un cobro. Los Services de Laravel replican esta lógica en PHP
  (`PagoService::sincronizarEstadoCobro`), no llaman al procedure — pero
  el procedure sigue existiendo en la base y algunos tests lo asumen.
- `comprobante_correlativos` — sí es tabla Laravel-nativa (grupo 2, tiene
  su migración), pero trabaja en conjunto con `pagos.numero_comprobante`
  vía `lockForUpdate()` dentro de la misma transacción — si se toca la
  lógica de `PagoService::registrar()`, cuidado con no romper la
  atomicidad del correlativo (ver el método `siguienteNumeroComprobante`).
