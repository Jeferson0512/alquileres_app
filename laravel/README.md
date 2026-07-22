# Alquileres App — Laravel (migración en curso)

Este directorio es el destino de la migración descrita en `../docs/requerimientos-proyecto.md` y en el plan `streamed-inventing-kay.md`. Convive con el PHP plano legacy en `../api` y `../public` mientras dura la migración (patrón *strangler fig*) — ambos apuntan a la misma base `alquileres_db`.

## Requisito importante: PHP 8.4 aparte de XAMPP

Laravel 13 requiere PHP 8.3+ (en la práctica 8.4). El PHP que trae XAMPP en esta máquina es 8.2, así que se instaló un PHP 8.4 aparte en `C:\Users\Jeferson\php84`, sin tocar el de XAMPP (que sigue sirviendo el legacy en `../api`/`../public`).

Para correr cualquier comando de este proyecto (`composer`, `php artisan`, `npm run dev`), primero:

```bash
export PATH="/c/Users/Jeferson/php84:$PATH"
export PHPRC="/c/Users/Jeferson/php84"
```

## Levantar en local

```bash
php artisan serve --port=8000   # backend en http://127.0.0.1:8000
npm run dev                      # Vite en paralelo, para hot-reload de React
```

Usuario admin ya sembrado (`php artisan db:seed`): `jefersonbujaico@gmail.com` / `CambiarEstaClave123!` — **cambiar esta contraseña** en cuanto se use por primera vez.

## Tests (Pest)

Los tests de `LiquidacionService`, `CobroService` y `PagoService` corren contra una base de datos MySQL **dedicada** (`alquileres_db_test`), no contra sqlite — el esquema heredado usa triggers, un stored procedure (`sp_recalcular_estado_cobro`) y una columna generada (`ocupacion_unidad.activa_flag`) que sqlite no puede replicar.

Setup (una sola vez):

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS alquileres_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysqldump -u root --no-data --routines --triggers --events alquileres_db > ../database/schema_dump_test.sql
mysql -u root alquileres_db_test < ../database/schema_dump_test.sql
mysql -u root alquileres_db_test < ../database/conceptos_cobro_seed.sql   # tabla de referencia conceptos_cobro
```

Cada test corre envuelto en una transacción (`DatabaseTransactions`, ver `tests/Pest.php`) que se revierte al final — nunca se usa `RefreshDatabase`, porque `migrate:fresh` borraría las 18 tablas de negocio heredadas (no gestionadas por migraciones Laravel). Los fixtures mínimos (inmueble, unidad, persona, periodo, recibo, lectura...) están en `tests/Support/AlquileresFixtures.php`.

```bash
php artisan test
```

## Nota sobre instalación en esta carpeta (Windows)

Si en algún momento hay que reinstalar dependencias (`composer install`, `npm install`) y aparecen errores de "Permission denied" o "could not delete" durante la extracción de paquetes con muchos archivos chicos (Carbon, Faker, etc.), es un bloqueo transitorio de algún proceso de Windows (indexador o similar) escaneando archivos nuevos en tiempo real — no es un problema del proyecto. Si persiste tras 2-3 reintentos, instalar en `C:\Temp` y mover la carpeta resultante suele evitarlo.

---

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
