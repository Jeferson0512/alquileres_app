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
| Migraciones (`database/migrations/`) | Si | `git pull` + `php artisan migrate` |
| `vendor/` (dependencias PHP) | **No** | `composer install` en el servidor |
| `public/build/` (assets compilados Vite) | **No** | `npm run build` en el servidor |
| `node_modules/` | **No** | `npm ci` en el servidor |
| `laravel/.env` | **No** | Se crea **una sola vez a mano** en el servidor |
| `storage/app/` (comprobantes, QR) | **No** | Datos de usuario: **nunca se sobrescriben** |
| Esquema de la BD | Indirecto | Lo aplica `php artisan migrate --force` |

Esa columna "No" es exactamente lo que hay que resolver aparte en cada despliegue.

### Estado actual del hosting

**Todavia no hay servidor de produccion configurado en este repo**: no hay script de deploy, ni CI, ni `.env.production`, ni credenciales. Segun [`docs/auditoria-tecnologica.html`](../../../docs/auditoria-tecnologica.html):

> InfinityFree es **tecnicamente incompatible con Laravel**: sin SSH no hay Composer/Artisan, y `vendor/` (30-50MB) excede el limite de subida por FTP.

Conclusion documentada: Laravel exige **VPS con SSH** (Oracle Cloud Always Free) o una PaaS con soporte real de Composer (Render). **Hosting compartido por FTP no es una opcion viable para esta app.**

Si el usuario aun no eligio hosting, decirselo en vez de inventar un procedimiento.

### Despliegue en VPS con SSH (camino previsto)

Una vez hecho el `git push`, en el servidor:

```bash
cd /ruta/al/proyecto/laravel

php artisan down                              # modo mantenimiento

git pull origin main

composer install --no-dev --optimize-autoloader
npm ci
npm run build

php artisan migrate --force                   # --force = no pide confirmacion en prod

php artisan optimize                          # cachea config, rutas y vistas
php artisan queue:restart                     # QUEUE_CONNECTION=database: el worker
                                              # corre codigo viejo hasta reiniciarlo

php artisan up
```

**Primera instalacion unicamente** (no repetir en cada deploy):

```bash
cp .env.example .env
php artisan key:generate         # APP_KEY nueva y propia del servidor
php artisan storage:link         # expone storage/app/public como public/storage
```

Y editar `.env` en el servidor con:

```
APP_ENV=production
APP_DEBUG=false          # critico: en true se filtran rutas, queries y credenciales
APP_URL=https://<dominio-real>
DB_DATABASE=...  DB_USERNAME=...  DB_PASSWORD=...
```

### Cuidados especificos de esta app

- **`storage/app/private/comprobantes`** guarda los comprobantes de pago que suben los inquilinos y **`storage/app/public/qr`** el QR de cobranza. Son datos reales de usuarios: no borrar, no sobrescribir, e incluir en el backup.
- **`php artisan optimize` cachea la config**: si se edita `.env` despues, hay que correr `php artisan optimize` de nuevo (o `optimize:clear`) para que el cambio tome efecto.
- **Backup de la BD antes de migrar**, siempre:
  ```bash
  mysqldump -u <user> -p alquileres_db > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql
  ```

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
