# `database/` — qué hay en cada carpeta

Esta carpeta junta todo lo relacionado a la base de datos `alquileres_db`
que **no** vive dentro de `laravel/database/migrations/` (esas sí son
migraciones Laravel normales). Lo de acá es el esquema de las 18 tablas
heredadas de la app legacy, que Laravel no gestiona por migraciones propias
(ver `laravel/README.md`).

## `schema/`

Fragmentos de DDL (`CREATE TABLE`, `ALTER TABLE`, triggers, stored
procedures) que documentan **cómo llegó el esquema heredado a su forma
actual**. Cada archivo es una pieza que ya fue aplicada a la base real —
sirven como historial y como referencia si algún día hay que reconstruir el
esquema desde cero sobre una base vieja. Sin datos reales, seguros para el
repo público.

Incluye la subfamilia `pagos_por_concepto_*` (schema + migración de datos +
guardrails + consultas de validación) documentada en detalle en
`pagos_por_concepto_diseno.md`.

## `seed/`

Datos de referencia y el dump de arranque para levantar un entorno nuevo:

- `fresh_local_dump_fixed.sql` — dump completo (schema + datos) más reciente,
  el que se usa para restaurar/levantar `alquileres_db` en un equipo nuevo.
  **Contiene datos reales** (inquilinos, pagos, hashes de password) — está
  commiteado porque el repo ya es público y este dump ya estaba ahí antes;
  no agregar dumps nuevos con datos reales sin avisar primero.
- `schema_dump_test.sql` / `conceptos_cobro_seed.sql` — usados por
  `laravel/README.md` para armar la base de tests `alquileres_db_test`
  (solo esquema + catálogo, sin datos de negocio).

## `backups/`

Herramienta de backup automático (`backup-db.ps1` + su
`backup-db.README.md`, versionados) y los `.sql`/`.log` que va generando
(**ignorados por git** — nunca suben datos reales al repo). Ver
`backups/backup-db.README.md` para instalar/reinstalar la tarea programada.
