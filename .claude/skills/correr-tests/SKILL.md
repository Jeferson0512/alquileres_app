---
name: correr-tests
description: Correr la suite de tests (Pest o Playwright E2E) de Alquileres App. Usar cuando se pida "correr los tests", "ejecutar las pruebas", "testear el cambio" o antes de dar por terminado un cambio en Services (Liquidacion/Cobro/Pago).
---

# Correr los tests de Alquileres App

Hay dos suites independientes, para dos apps distintas.

## Pest (Laravel) — `laravel/tests/`

Los tests de `LiquidacionService`, `CobroService` y `PagoService` corren
contra una base de datos MySQL **dedicada** (`alquileres_db_test`), **no**
contra sqlite — el esquema heredado usa triggers, un stored procedure
(`sp_recalcular_estado_cobro`) y una columna generada
(`ocupacion_unidad.activa_flag`) que sqlite no puede replicar. Ver skill
`modificar-esquema-legacy` para el detalle de por qué.

### Setup (una sola vez por equipo)

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS alquileres_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysqldump -u root --no-data --routines --triggers --events alquileres_db > database/seed/schema_dump_test.sql
mysql -u root alquileres_db_test < database/seed/schema_dump_test.sql
mysql -u root alquileres_db_test < database/seed/conceptos_cobro_seed.sql   # tabla de referencia conceptos_cobro
```

(Usar el `mysql`/`mysqldump` de Laragon, no el de XAMPP — ver skill
`levantar-proyecto` sobre por qué el PATH resuelve al binario viejo.)

### Correr

```bash
cd laravel
"<ruta-al-php-8.4>/php.exe" artisan test
```

Cada test corre envuelto en una transacción (`DatabaseTransactions`, ver
`tests/Pest.php`) que se revierte al final — **nunca se usa
`RefreshDatabase`**, porque `migrate:fresh` borraría las 18 tablas de
negocio heredadas (no gestionadas por migraciones Laravel). Los fixtures
mínimos (inmueble, unidad, persona, periodo, recibo, lectura...) están en
`laravel/tests/Support/AlquileresFixtures.php`.

Si `alquileres_db_test` queda desincronizada respecto a `alquileres_db`
(por ejemplo, después de aplicar un script nuevo de
`database/schema/`), regenerar `schema_dump_test.sql` repitiendo el
`mysqldump` del setup y reimportándolo.

## Playwright E2E — `tests/e2e/` (app legacy, PHP plano)

Prueba el flujo real de Cobros/Avisos contra la app legacy en
`http://alquileres_app.test/` (Laragon, siempre corriendo).

```bash
npm install          # en la raíz del repo, no en laravel/
npm run e2e:install  # una vez, instala navegadores de Playwright
npm run e2e
npm run e2e:report   # abre el reporte HTML
```

Crea datos de prueba propios marcados `E2E_<timestamp>` (seed/cleanup
automático, no toca los cobros reales del periodo activo). Detalle en
`tests/e2e/README.md`.
