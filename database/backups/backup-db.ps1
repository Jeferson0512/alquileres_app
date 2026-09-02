<#
.SYNOPSIS
    Backup automatico de alquileres_db (Laragon/MySQL local).

.DESCRIPTION
    Corre mysqldump contra la base local, guarda un .sql con timestamp en
    esta misma carpeta (database/backups/ — los .sql/.log estan en
    .gitignore, nunca se suben al repo publico) y borra los backups con
    mas de RetentionDays de antiguedad.

    Pensado para registrarse como tarea programada de Windows (ver
    database/backups/backup-db.README.md para el comando de instalacion).
#>

param(
    [string]$DbName = "alquileres_db",
    [string]$DbUser = "root",
    [string]$DbPassword = "",
    [string]$DbHost = "127.0.0.1",
    [int]$DbPort = 3306,
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

$backupDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logFile = Join-Path $backupDir "backup.log"

if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

function Write-Log([string]$message) {
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $message
    Add-Content -Path $logFile -Value $line
    Write-Output $line
}

# Ubicaciones conocidas de mysqldump en este equipo (Laragon). Si cambia de
# maquina o de version de MySQL, ajustar esta lista o pasar mysqldump por PATH.
$candidatePaths = @(
    "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqldump.exe"
)
$mysqldump = $candidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $mysqldump) {
    $onPath = Get-Command mysqldump.exe -ErrorAction SilentlyContinue
    if ($onPath) { $mysqldump = $onPath.Source }
}

if (-not $mysqldump) {
    Write-Log "ERROR: no se encontro mysqldump.exe (ni en las rutas conocidas de Laragon ni en PATH)."
    exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $backupDir "backup_${DbName}_${timestamp}.sql"

Write-Log "Iniciando backup de '$DbName' -> $outFile"

$args = @(
    "-h$DbHost",
    "-P$DbPort",
    "-u$DbUser",
    "--routines", "--triggers", "--events",
    # El mysqldump 8.4.x de Laragon corre contra un server MariaDB (no
    # MySQL) -- sin estos dos flags falla con "Unknown table
    # 'column_statistics' in information_schema" (exit code 2). Sin este
    # flag el backup automatico vino fallando en silencio del 20/08 al
    # 02/09/2026 (ver backup.log).
    "--column-statistics=0", "--no-tablespaces",
    $DbName
)
if ($DbPassword -ne "") {
    $args = @("-p$DbPassword") + $args
}

try {
    & $mysqldump @args | Out-File -FilePath $outFile -Encoding utf8
    if ($LASTEXITCODE -ne 0) {
        throw "mysqldump devolvio exit code $LASTEXITCODE"
    }
    $sizeKb = [Math]::Round((Get-Item $outFile).Length / 1KB, 1)
    Write-Log "Backup OK ($sizeKb KB)"
} catch {
    Write-Log "ERROR durante el backup: $_"
    if (Test-Path $outFile) { Remove-Item $outFile -Force }
    exit 1
}

# Rotacion: borrar backups mas viejos que RetentionDays
$cutoff = (Get-Date).AddDays(-$RetentionDays)
$old = Get-ChildItem -Path $backupDir -Filter "backup_${DbName}_*.sql" |
    Where-Object { $_.LastWriteTime -lt $cutoff }

foreach ($file in $old) {
    Remove-Item $file.FullName -Force
    Write-Log "Borrado backup viejo: $($file.Name)"
}

Write-Log "Backup finalizado. Retencion: $RetentionDays dias."
