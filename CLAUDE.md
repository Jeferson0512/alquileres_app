# Alquileres App

Sistema de gestión de alquileres (1 inmueble, unidades variables — 14
activas verificado 2026-09-04, no hardcodear el número en código):
inquilinos, ocupaciones, recibo de luz + prorrateo, cobros mensuales,
pagos, avisos.

## Arquitectura: dos apps, una sola base de datos

Migración en curso de PHP plano a Laravel, patrón *strangler fig* — las
dos conviven y comparten `alquileres_db` (MySQL de Laragon,
`127.0.0.1:3306`, `root` sin password).

| | Legacy | Laravel (**la app viva**) |
|---|---|---|
| Carpeta | `api/` + `public/` | `laravel/` |
| Stack | PHP plano + JS vanilla (ES modules) | Laravel 13 + Inertia/React + Vite + TailAdmin |
| Cómo corre | Siempre arriba, vhost de Laragon (`alquileres_app.test`) | Manual: `artisan serve` + `npm run dev` — ver skill `levantar-proyecto` |
| Auth/roles | No tiene | Sí (Spatie): Admin / Supervisor / Propietario (reservado) / Inquilino |

`docs/requerimientos-proyecto.md` es la fuente de verdad del alcance de
la migración — revisarlo antes de asumir si algo "hace falta ahora".

**18 tablas de negocio heredadas** (`personas`, `ocupacion_unidad`,
`cobros_mensuales`, `pagos`, etc.) **no están gestionadas por migraciones
Laravel** — Eloquent solo las lee. Cambiarles el esquema es un
procedimiento distinto al de una tabla Laravel-nativa. Ver skill
`modificar-esquema-legacy` antes de tocar cualquiera de esas tablas o de
correr `migrate:fresh` (**nunca correrlo** — borraría esas 18 tablas).

## Diseño — sistema de diseño único, no inventar otro

Paleta (azul confianza/financiero) — única fuente de verdad de color,
documentada en `docs/requerimientos-proyecto.md` punto 7:

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#2563EB` | Botones, links activos, sidebar activo |
| `primary-dark` | `#1D4ED8` | Hover/estados activos |
| `primary-light` | `#DBEAFE` | Fondos suaves de elementos activos |
| `surface` | `#F8FAFC` claro / `#0F172A` oscuro | Fondo general |
| `success` | `#16A34A` | Pagos completos, estados OK |
| `warning` | `#D97706` | Vencimientos próximos, parciales |
| `danger` | `#DC2626` | Anulaciones, errores, deuda vencida |

Layout: Sidebar izquierda (colapsable, agrupado por módulo desde la
tabla `modules`, cada ítem visible solo si el usuario tiene el permiso
`.ver`) + Topbar (breadcrumb, usuario/rol, logout, campana de
notificaciones) + contenido con cards de KPI y tablas.

Base de componentes: **TailAdmin free** (React + Tailwind, MIT) — se
reutiliza su capa visual (Sidebar, Topbar, Card, Table, Badge, Modal), no
su routing ni sus páginas de ejemplo. Antes de crear un componente nuevo,
buscar si ya existe algo similar en `laravel/resources/js/Components/`.

## Convención de módulos y permisos

Cada módulo/submódulo tiene un `code` (tabla `modules`) que define tanto
la URL como el permiso: `{módulo}.{acción}` o
`{módulo}.{submódulo}.{acción}` (ej. `cobros.pagos.registrar`). Catálogo
completo en `docs/requerimientos-proyecto.md` punto 6. El mapeo
`code` → URL vive en `CODE_TO_PATH` dentro de
`laravel/resources/js/Layouts/AdminLayout.jsx` (solo tiene excepciones,
la mayoría de los `code` coinciden literal con el segmento de URL).

## Reglas que no se negocian

- **Nunca `php artisan migrate:fresh`** (ver arriba).
- **El repo es público.** Nunca commitear `.env`, credenciales, ni dumps
  `.sql` nuevos con datos reales fuera de `database/seed/` o
  `database/backups/` (ya evaluados) sin preguntar antes — ver skill
  `backup-y-restore-db`.
- El `php`/`composer` del PATH de este equipo resuelve al de XAMPP
  (viejo, insuficiente). Usar el PHP 8.4 de Laragon explícito — ver
  skill `levantar-proyecto`.
- Los tests de Services corren contra MySQL real (`alquileres_db_test`),
  nunca sqlite — ver skill `correr-tests`.
- `User` tiene el cast `'password' => 'hashed'` (`app/Models/User.php`). Al
  asignar el atributo (`$user->password = ...`, `update([...])`), el cast
  llama a `Hash::isHashed()` antes de hashear — si el valor ya es un hash
  válido no lo vuelve a hashear. Verificado: tanto asignar la password
  **plana** como asignarla ya con `Hash::make()` funcionan bien, no hay
  riesgo de doble hasheo. Si alguna vez un login falla justo después de
  resetear una password a mano, verificar con `Hash::check()` directo
  antes de asumir que es esto — no se logró reproducir la causa real la
  vez que pasó.

## Skills de este proyecto

- `levantar-proyecto` — arrancar la app en local.
- `backup-y-restore-db` — backups, restaurar/levantar la base.
- `modificar-esquema-legacy` — cambiar el esquema de una tabla heredada.
- `correr-tests` — Pest y Playwright E2E.
- `reglas-negocio-facturacion` — reglas no obvias de Liquidación/Cobros/Avisos
  (mínimos de luz, recibo vs. comprobante, prorrateo pendiente).
- `publicar-version` — commit, push y despliegue a producción.

## Si algo no está documentado acá

Si en una sesión se descubre o se decide algo no obvio del proyecto (una
convención, un workaround, un gotcha de este equipo, una decisión de
diseño) — proponerle al usuario agregarlo acá o al skill correspondiente
antes de cerrar la tarea, en vez de dejar que se pierda para la próxima
sesión.
