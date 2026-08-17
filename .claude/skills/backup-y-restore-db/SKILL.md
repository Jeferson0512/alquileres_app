---
name: backup-y-restore-db
description: Backup y restauración de alquileres_db. Usar cuando se pida "hacer un backup de la base", "restaurar la base de datos", "recuperar los datos", "hacer un dump" o "necesito la base completa".
---

# Backup y restauración de `alquileres_db`

**El repositorio es público.** Ningún dump con datos reales (nombres,
pagos, hashes de password) se commitea fuera de las carpetas ya
preparadas para eso — ver regla al final.

## `database/` — qué hay en cada carpeta

Ver también `database/README.md` (más detalle).

- **`database/schema/`** — DDL de las 18 tablas heredadas (sin datos
  reales, seguro para el repo). Ver skill `modificar-esquema-legacy` si
  hay que tocar esto.
- **`database/seed/`** — datos de referencia + `fresh_local_dump_fixed.sql`,
  el dump completo (schema + datos) más reciente. Es el que se usa para
  levantar `alquileres_db` en un equipo nuevo. Contiene datos reales, pero
  ya estaba commiteado antes de que se prestara atención a esto — no
  agregar dumps nuevos ahí sin avisar primero.
- **`database/backups/`** — herramienta de backup automático
  (`backup-db.ps1` + `backup-db.README.md`, versionados) y los `.sql`/`.log`
  que genera (**ignorados por git**, `database/backups/*.sql` y `*.log`
  en `.gitignore`).

## Hacer un backup ahora mismo

Ya existe un script listo, no hace falta escribir `mysqldump` a mano:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\laragon\www\alquileres_app\database\backups\backup-db.ps1"
```

Guarda un `.sql` con timestamp en `database/backups/` y rota automático a
30 días. También corre solo, todos los días 3:00 AM, vía la tarea
programada de Windows `AlquileresApp - Backup DB`:

```powershell
Get-ScheduledTask -TaskName "AlquileresApp - Backup DB"
```

Si esa tarea no existe (equipo nuevo, o se borró), reinstalarla — el
comando exacto está en `database/backups/backup-db.README.md`.

## Restaurar / levantar la base en un equipo nuevo

```bash
mysql -h127.0.0.1 -uroot alquileres_db < database/seed/fresh_local_dump_fixed.sql
```

Esto reemplaza el contenido actual de `alquileres_db`. **Antes de
restaurar sobre una base que ya tiene datos, hacer un backup de
seguridad primero** (el comando de arriba, o un `mysqldump` manual) —
confirmar con el usuario si la base actual tiene datos que le importen
antes de sobrescribir.

Después de restaurar, correr `php artisan migrate:status` desde
`laravel/` para confirmar que las migraciones de Laravel quedaron
sincronizadas (el dump de referencia ya las trae aplicadas, normalmente
no hace falta correr `migrate`).

## "¿Se puede recuperar todo?" / "no sé si esta es la base real"

Si la base local está incompleta o parece vieja (le faltan tablas como
`users`/`roles`/`comprobantes_pago`, o tiene pocos registros), casi
seguro que `database/seed/fresh_local_dump_fixed.sql` es la versión más
completa — compararla por cantidad de filas antes de asumir cuál es la
"buena":

```bash
mysql -h127.0.0.1 -uroot alquileres_db -e "SELECT COUNT(*) FROM personas;"
grep -o -F "),(" database/seed/fresh_local_dump_fixed.sql | wc -l   # aproximado, por tabla hay que grep la linea especifica
```

## Regla que no se negocia

Nunca commitear un dump o backup con datos reales fuera de
`database/seed/` (ya existente, ya evaluado) o `database/backups/` (ya
ignorada por git). Si aparece la necesidad de un dump nuevo en otro
lugar, preguntar al usuario primero — el repo es público.
