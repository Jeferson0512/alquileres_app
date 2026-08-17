# Backup automático de `alquileres_db`

`backup-db.ps1` corre `mysqldump` contra la base local, guarda el `.sql` con
timestamp en `database/backups/` (ignorada por git — nunca sube datos reales
al repo público) y borra automáticamente los backups con más de 30 días.

## Estado en este equipo

Ya está instalado como tarea programada de Windows, corre todos los días a
las 3:00 AM:

```powershell
Get-ScheduledTask -TaskName "AlquileresApp - Backup DB"
```

Para correrlo a mano en cualquier momento:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\laragon\www\alquileres_app\database\backups\backup-db.ps1"
```

## Reinstalar en otro equipo (o si se borró la tarea)

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument '-NoProfile -ExecutionPolicy Bypass -File "C:\laragon\www\alquileres_app\database\backups\backup-db.ps1"'
$trigger = New-ScheduledTaskTrigger -Daily -At 3:00AM
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd
Register-ScheduledTask -TaskName "AlquileresApp - Backup DB" -Action $action -Trigger $trigger -Settings $settings -Description "Backup diario de alquileres_db (mysqldump) con rotacion de 30 dias" -Force
```

Si `mysqldump.exe` no está en `C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\`
(por ejemplo, tras actualizar la versión de MySQL de Laragon), ajustar la
lista `$candidatePaths` al inicio de `backup-db.ps1`.

## En el futuro servidor de producción (VPS)

Esta tarea es solo para el equipo local. Cuando exista un VPS de producción
(ver `.claude/skills/publicar-version/SKILL.md`), el equivalente ahí es un
`cron` con la misma lógica de `mysqldump` — no una tarea de Windows.
