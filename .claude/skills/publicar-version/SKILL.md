---
name: publicar-version
description: Publica una nueva version de Alquileres App - commit y push a GitHub, y despliegue de esos cambios al servidor de produccion. Usar cuando se pida "subir los cambios", "hacer push", "publicar", "desplegar", "sacar nueva version" o "que el servidor tenga los ultimos cambios".
---

# Publicar una nueva version

Publicar tiene **dos mitades que no son lo mismo**, y esa es la idea central de este skill:

1. **Git** lleva el *codigo fuente*.
2. **El servidor** necesita ademas cosas que git **no** transporta (dependencias, build del frontend, `.env`, esquema de BD).

Hacer solo `git push` **no** actualiza produccion. Un `git pull` en el servidor tampoco alcanza por si solo.

## Contexto del proyecto (leer antes de tocar nada)

- La app viva es la de **`laravel/`** (Laravel 13 + Inertia/React + Vite + MySQL). El `document root` del servidor debe apuntar a **`laravel/public`**.
- En la raiz sobrevive la app **legacy** en PHP plano (`api/` + `public/`). No se despliega salvo que se pida explicitamente.
- Repo: `https://github.com/Jeferson0512/alquileres_app.git`, rama `main`.

> **El repositorio es PUBLICO.** Nunca commitear `.env`, credenciales, ni dumps nuevos con datos reales sin avisar primero al usuario.

## Parte A — Subir a Git

```powershell
git status                    # ver que hay pendiente
git diff                      # revisar el contenido real de los cambios
```

Antes de commitear, verificar que no se esta subiendo basura ni secretos:

- `laravel/.env` esta ignorado y **debe seguir ignorado**.
- Dumps `.sql` con datos reales (nombres, DNI, telefonos, hashes de password): **preguntar al usuario** antes de incluirlos. El repo es publico.
- `vendor/`, `node_modules/`, `public/build/` estan ignorados a proposito. No forzar su inclusion.

Luego:

```powershell
git add <archivos concretos>   # preferir rutas explicitas sobre "git add ."
git commit -m @'
Titulo corto en imperativo, sin punto final

Cuerpo explicando el porque del cambio, no el que.
'@
git push origin main
```

Comprobar que el push entro:

```powershell
git log origin/main --oneline -3
```

### Verificaciones previas recomendadas

```powershell
cd laravel
php artisan test        # suite Pest
npm run build           # que el build de Vite no falle ANTES de publicar
```

## Parte B — Llevar los cambios al servidor

### Que viaja por git y que no

| Elemento | En git? | Como llega al servidor |
|---|---|---|
| Codigo PHP/JS (`app/`, `routes/`, `resources/`) | Si | `git pull` |
| Migraciones (`database/migrations/`, tablas grupo 2) | Si | `git pull` + `php artisan migrate` |
| Esquema legacy (`database/schema/*.sql`, tablas grupo 1) | Si | `git pull` + **aplicar el `.sql` a mano** (ver abajo) |
| `vendor/` (dependencias PHP) | **No** | `composer install` en el servidor |
| `public/build/` (assets compilados Vite) | **No** | `npm run build` en el servidor |
| `node_modules/` | **No** | `npm ci` en el servidor |
| `laravel/.env` | **No** | Se crea **una sola vez a mano** en el servidor |
| `storage/app/` (comprobantes, QR) | **No** | Datos de usuario: **nunca se sobrescriben** |

Esa columna "No" es exactamente lo que hay que resolver aparte en cada despliegue.

### Dos caminos distintos para cambios de esquema — no confundirlos

Este proyecto tiene **dos grupos de tablas** (ver skill `modificar-esquema-legacy`
para el detalle completo):

1. **Grupo 1 — 18 tablas heredadas** (`personas`, `unidades`, `ocupacion_unidad`,
   `cobros_mensuales`, `pagos`, `periodos`, `config_cobranza`, etc.). Laravel
   **no** las gestiona por migraciones. Sus cambios viven como `.sql` sueltos en
   `database/schema/`, y **`php artisan migrate` nunca los toca** — hay que
   aplicarlos a mano contra la base de destino.
2. **Grupo 2 — tablas nativas de Laravel** (`users`, `comprobantes_pago`,
   `renovaciones_pendientes`, `comprobante_correlativos`, etc.). Estas sí tienen
   migraciones normales en `laravel/database/migrations/` y `migrate --force`
   las aplica solo.

**Antes de cada deploy, revisar si el rango de commits a publicar toca el grupo 1**:

```bash
git diff <ultimo-commit-desplegado>..HEAD --stat -- database/schema/
```

Por cada archivo `.sql` nuevo o modificado ahí, aplicarlo explícitamente
(los scripts son idempotentes, con `IF NOT EXISTS`/chequeo de columna —
seguros de re-ejecutar si hay duda de si ya corrieron):

```bash
# local
mysql -h127.0.0.1 -uroot alquileres_db < database/schema/archivo.sql
# servidor
sudo mysql alquileres_prod < database/schema/archivo.sql
```

**Caso real (2026-07-25)**: un cambio de columna en `config_cobranza`
(`whatsapp_contacto`) se agregó correctamente como `.sql` suelto en un
commit, pero nunca se aplicó ni en el servidor de producción ni en otra
máquina de desarrollo — el código (`ConfigCobranzaController`,
`PortalController`) ya referenciaba la columna nueva. El síntoma no fue
que el sitio se cayera: cargaba bien, pero **guardar** la pantalla de
Config. cobranza tiraba un error de MySQL ("Unknown column"). Se detectó
revisando el diff antes de desplegar, no después de que fallara en vivo.
No repetir el error de "arreglarlo" convirtiéndolo en una migración de
Laravel — eso rompe la convención del proyecto para tablas grupo 1.

### Estado actual del hosting

**Ya hay servidor de producción real, desplegado el 2026-07-25**:

- Oracle Cloud Free Tier, instancia Ampere A1 (Frankfurt), Ubuntu 24.04, IP `130.61.110.40`.
- Acceso: `ssh -i "$env:USERPROFILE\Downloads\Oracle\ssh-key-2026-07-25.key" ubuntu@130.61.110.40`
  (en Git Bash: `ssh -i "$HOME/Downloads/Oracle/ssh-key-2026-07-25.key" ubuntu@130.61.110.40`)
  Misma llave privada en cualquier máquina desde donde se despliegue — vive en
  `Downloads/Oracle/` dentro del perfil de cada usuario, ruta portátil entre
  computadoras distintas siempre que se mantenga esa subcarpeta.
- Proyecto en `/var/www/alquileres-prod` (repo clonado completo; la app Laravel vive en `/var/www/alquileres-prod/laravel`).
- Stack: Nginx + PHP 8.4-FPM + MySQL 8.0 (base `alquileres_prod`, usuario `alquileres_user`).
- Dominio: `https://alquileres.jeffray.site`, proxied por Cloudflare (certificado Origin CA instalado en `/etc/nginx/ssl/`, vhost en `/etc/nginx/sites-available/alquileres-prod.conf`).
- `.env` de producción ya configurado (`APP_ENV=production`, `APP_DEBUG=false`) — no se toca en cada deploy, solo si cambia una credencial.

Con esto, "el usuario aún no eligió hosting" **ya no aplica** — el flujo de abajo es directamente ejecutable contra ese servidor.

### Despliegue en el VPS

Una vez hecho el `git push`, conectarse por SSH y correr esto en `/var/www/alquileres-prod`:

```bash
cd /var/www/alquileres-prod
git status                                    # limpio antes de pull -- si hay
                                              # cambios de permisos sueltos (chmod
                                              # previo), `git checkout -- .` primero

git pull origin main --ff-only

# aplicar a mano cualquier .sql nuevo de database/schema/ -- ver seccion
# "Dos caminos distintos para cambios de esquema" mas arriba, ANTES de
# tocar codigo/migraciones si el orden importa para ese cambio puntual

cd laravel
composer install --no-dev --optimize-autoloader   # si GitHub tira 504 en
                                                   # algun paquete (dompdf y
                                                   # afines), reintentar con
                                                   # --prefer-source
npm ci
npm run build

php artisan migrate --force                   # --force = no pide confirmacion en prod

php artisan optimize:clear                    # limpiar antes de recachear, si venias
                                              # de un deploy previo con cache viejo
php artisan config:cache
php artisan route:cache
php artisan view:cache

sudo chown -R ubuntu:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

sudo systemctl restart php8.4-fpm             # limpia OPcache -- si esta con
                                              # validate_timestamps=0, codigo
                                              # nuevo no se ve hasta reiniciar
```

No hay cola (`QUEUE_CONNECTION=database` pero sin jobs `ShouldQueue` en uso
todavia) ni modo mantenimiento configurado — deploys rápidos (segundos de
build) no lo han necesitado hasta ahora. Si algún cambio grande lo amerita,
agregar `php artisan down`/`up` alrededor del bloque de arriba.

**Primera instalación únicamente** (ya hecha, no repetir):

```bash
cp .env.example .env
php artisan key:generate
php artisan storage:link
```

### Cuidados especificos de esta app

- **`storage/app/private/comprobantes`** guarda los comprobantes de pago que suben los inquilinos y **`storage/app/public/qr`** el QR de cobranza. Son datos reales de usuarios: no borrar, no sobrescribir, e incluir en el backup.
- **`php artisan optimize` cachea la config**: si se edita `.env` despues, hay que correr `php artisan optimize` de nuevo (o `optimize:clear`) para que el cambio tome efecto.
- **Backup de la BD antes de migrar**, siempre (en el servidor, contra la BD real):
  ```bash
  sudo mysqldump alquileres_prod > /tmp/backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql
  ```
- **Gotcha MariaDB (local, XAMPP) → MySQL 8 (servidor)**: si algún día hay que
  llevar un dump del local al servidor (no el flujo normal de deploy, pero sí
  el que se usó para poblar `alquileres_prod` la primera vez), MySQL 8
  rechaza el `INSERT` de `ocupacion_unidad.activa_flag` (columna
  `GENERATED ALWAYS AS ... STORED`) que MariaDB sí vuelca con su valor —
  error `1419`/`3105`. Hay que quitarle el valor de esa columna al INSERT
  (o usar `mysqldump --no-create-info` + reconstruir el esquema aparte). El
  script de `database/backups/backup-db.ps1` es la referencia de cómo se
  genera un dump limpio.

### Verificacion post-despliegue

1. Cargar la app en el navegador y hacer login.
2. Revisar `laravel/storage/logs/laravel.log` por errores nuevos.
3. Probar el flujo tocado por los cambios de esta version.
4. Confirmar que los assets cargan (si el build fallo, la UI aparece sin estilos).

### Rollback

```bash
php artisan down
git reset --hard <commit-anterior>
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan optimize
php artisan up
```

Las **migraciones no se revierten solas**. Si la version incluia `migrate`, restaurar el dump previo o correr `php artisan migrate:rollback` — evaluando primero si eso destruye datos.

## Reglas

- Nunca `git push --force` sobre `main`: es un repo publico con historial compartido.
- Nunca desplegar sin backup de la base si la version trae migraciones.
- Nunca dejar `APP_DEBUG=true` en produccion.
- Si el push o el deploy fallan, reportar el error real al usuario en vez de reintentar a ciegas.
