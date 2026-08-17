---
name: levantar-proyecto
description: Levanta Alquileres App en local (Laragon). Usar cuando se pida "levantar el proyecto", "arrancar la app", "correr en local", "iniciar servidores", "prender la app" o similar.
---

# Levantar Alquileres App en local

Hay **dos apps corriendo en paralelo** sobre la misma base de datos
(`alquileres_db`, MySQL de Laragon en `127.0.0.1:3306`, usuario `root` sin
password). Antes de "levantar" nada, hay que saber cuál de las dos hace falta.

## App legacy (PHP plano) — ya está arriba, no requiere acción

Laragon corre Apache y MySQL como servicios de fondo, siempre activos
mientras Laragon esté abierto. El vhost `alquileres_app.test` ya apunta a
la raíz del repo (`C:\laragon\www\alquileres_app`) — Laragon lo crea solo
por el nombre de la carpeta.

```
http://alquileres_app.test/public/
```

Si esa URL no responde, el problema es Laragon (Apache/MySQL no están
corriendo), no el código.

## App Laravel (`laravel/`) — la app viva, necesita arranque manual

El vhost de Apache **no** la sirve (su `DocumentRoot` es la raíz, no
`laravel/public`). Se levanta con el servidor de desarrollo de Laravel +
Vite, cada uno en su propia terminal/proceso:

```bash
cd laravel
"<ruta-al-php-8.4>/php.exe" artisan serve --port=8000
npm run dev
```

Luego: `http://127.0.0.1:8000`

### El PHP correcto no es el del PATH

El `php`/`composer` que resuelve el PATH de este equipo es el de XAMPP
(viejo, PHP 8.0.x) — insuficiente, el `composer.lock` exige **PHP ≥ 8.4.1**
real (no alcanza con 8.3). Hay que usar explícitamente el PHP 8.4 de
Laragon:

```bash
ls /c/laragon/bin/php/          # buscar la carpeta php-8.4.x-...
# ej: C:\laragon\bin\php\php-8.4.12-nts-Win32-vs17-x64\php.exe
```

Si esa carpeta no existe, agregarla desde Laragon: clic derecho en el
ícono de la bandeja → PHP → **+ Quick add** → elegir una versión 8.4.x (no
lo puede hacer un agente, es una acción de GUI — pedírselo al usuario).

**Una versión de PHP recién agregada por Laragon no trae `php.ini`
configurado** (sin extensiones activas). Si `composer install` o
`artisan` fallan por extensión faltante, crear el ini y habilitar lo
necesario:

```bash
DIR="/c/laragon/bin/php/php-8.4.x-..."
cp "$DIR/php.ini-development" "$DIR/php.ini"
# habilitar extension_dir="ext" y las extensiones: curl, fileinfo, gd,
# intl, mbstring, openssl, pdo_mysql, zip (descomentar esas líneas)
```

## Setup de primera vez (solo si `laravel/vendor` o `laravel/.env` no existen)

```bash
cd laravel
cp .env.example .env
# editar .env:
#   APP_URL=http://127.0.0.1:8000
#   DB_CONNECTION=mysql
#   DB_HOST=127.0.0.1
#   DB_PORT=3306
#   DB_DATABASE=alquileres_db
#   DB_USERNAME=root
#   DB_PASSWORD=

"<php-8.4>/php.exe" -d memory_limit=-1 /c/composer/composer.phar install --no-interaction
"<php-8.4>/php.exe" artisan key:generate
"<php-8.4>/php.exe" artisan storage:link
"<php-8.4>/php.exe" artisan migrate      # solo aplica migraciones Laravel nuevas, no toca las 18 tablas legacy
npm install
```

**`composer install` puede fallar la primera vez** con "Could not delete
... antivirus o Windows Search Indexer". Es transitorio — simplemente
reintentar el mismo comando (usa el lock file, retoma donde quedó, no
reinstala todo de nuevo).

Si `alquileres_db` está vacía o le faltan tablas (`users`, `roles`,
`comprobantes_pago`, etc. — o `php artisan migrate:status` tira error de
tabla faltante), ver el skill `backup-y-restore-db` para restaurar el
dump de referencia antes de seguir.

## Verificación rápida

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8000/login   # esperar 200
```

Si tira 500 "Vite manifest not found", es que `npm run dev` recién
arrancó y todavía no escribió `laravel/public/hot` — esperar unos
segundos y reintentar (Vite tarda ~15-20s en quedar listo la primera vez).
