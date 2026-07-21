# Alquileres App

Sistema de gestión de alquileres multi-unidad (estilo casa de cuartos / minidepartamentos) para administrar periodos de facturación, lecturas de medidor eléctrico, liquidación proporcional de luz con IGV, cobros mensuales por concepto (alquiler, luz, agua, gas, mantenimiento), avisos de pago y tarifas de servicios.

## ¿Qué resuelve este proyecto?

Un propietario que alquila varios cuartos/departamentos dentro de un mismo inmueble necesita repartir el recibo de luz entre los inquilinos según su consumo real, sumarle alquiler y otros servicios, generar el cobro mensual de cada uno, y llevar el control de pagos y deudas — todo respetando periodos de facturación mensuales que no siempre coinciden con el mes calendario (ej. del 15 de un mes al 14 del siguiente). Este sistema automatiza ese flujo de punta a punta.

## Stack técnico

- **Backend:** PHP plano (sin framework), con un router minimalista (`api/config/router.php`) que mapea rutas a archivos por módulo. Acceso a base de datos vía PDO con consultas preparadas.
- **Frontend:** SPA en JavaScript vanilla (ES modules), sin frameworks ni paso de build. Render por `innerHTML` + event listeners.
- **Base de datos:** MySQL / MariaDB (`utf8mb4`), corriendo sobre XAMPP en desarrollo.
- **Tests:** End-to-end con [Playwright](https://playwright.dev/) (`tests/e2e/`).

## Estructura del proyecto

```
alquileres-app/
├── api/
│   ├── config/         Database.php, config.php, helpers.php, router.php
│   └── modules/        un folder por módulo de negocio (ver abajo), cada uno con
│                        index.php (CRUD) y scripts puntuales (generate.php, sync.php, etc.)
├── public/
│   ├── assets/
│   │   ├── css/        estilos de la SPA y de plan-mejoras.html
│   │   └── js/         api.js (cliente HTTP), app.js (shell/sidebar/router), utils.js,
│   │                    state.js, y modules/ (un archivo JS por sección del sidebar)
│   ├── uploads/         archivos subidos (ej. QR de cobranza)
│   ├── index.html       punto de entrada de la SPA
│   └── plan-mejoras.html  roadmap de mejoras con checklist persistido en localStorage
├── database/            dumps y esquemas SQL (backups, migraciones puntuales)
└── tests/e2e/           specs de Playwright + helpers de setup/teardown
```

## Módulos del sistema

| Módulo | Qué hace |
|---|---|
| **Dashboard** | KPIs generales del periodo activo. |
| **Periodos** | Ciclos de facturación mensuales (ABIERTO/CERRADO/ANULADO); valida que cada periodo nuevo inicie justo al día siguiente del cierre del anterior, y cierra automáticamente el periodo previo. |
| **Inquilinos** | Datos de las personas que alquilan. |
| **Unidades** | Cuartos/departamentos del inmueble. |
| **Ocupaciones** | Vincula una persona a una unidad en un rango de fechas (el "contrato"). |
| **Recibo de luz** | Datos del recibo real de la empresa eléctrica para el periodo (lectura general, IGV, cargos fijos). |
| **Lecturas** | Lectura de medidor por unidad; sincroniza automáticamente la lectura anterior desde el periodo previo. |
| **Liquidación** | Reparte el recibo de luz entre las unidades según su consumo real + IGV, más una porción proporcional del gasto común; permite ajustes manuales por unidad que se preservan al regenerar. |
| **Cobros** | Genera el cobro mensual por persona/unidad, sumando alquiler + luz liquidada + agua/gas/mantenimiento (con posibilidad de override manual por inquilino) + mora/descuentos; registra pagos y preserva el historial al regenerar. |
| **Avisos** | Vista para compartir el resumen de cobro (PNG/texto) por Yape/transferencia, e incluye alertas de vencimiento de contrato. |
| **Tarifas** | Montos de agua/gas/mantenimiento/precio kWh por inmueble, con auditoría de cambios. |

## Cómo correrlo en local (XAMPP)

1. Cloná el repo dentro de `htdocs` (ej. `C:\xampp\htdocs\proyectos\alquileres-app`).
2. Levantá Apache y MySQL desde el panel de XAMPP.
3. Creá la base de datos `alquileres_db` e importá uno de los dumps de `database/` (el backup más reciente) usando phpMyAdmin o `mysql` por línea de comandos.
4. Revisá las credenciales en `api/config/config.php` (por defecto `root` sin password, host `127.0.0.1:3306`).
5. Abrí `http://localhost/proyectos/alquileres-app/public/` en el navegador.

## Tests end-to-end

```bash
npm install
npm run e2e          # corre los specs de Playwright
npm run e2e:headed   # corre con navegador visible
npm run e2e:report   # abre el último reporte
```

## Roadmap y mejoras pendientes

El detalle de riesgos conocidos, plan de mejoras por plazo, e ideas innovadoras evaluadas (con investigación de mercado) está en [`public/plan-mejoras.html`](public/plan-mejoras.html) — abrilo directamente en el navegador, tiene un checklist que guarda tu progreso en el propio navegador.

## Auditoría tecnológica

Evaluación de qué stack conviene para este proyecto (frontend, backend, base de datos/BaaS, hosting), con investigación de mercado de julio 2026, arquitectura propuesta y once combos posibles con pros/contras: [`docs/auditoria-tecnologica.html`](docs/auditoria-tecnologica.html) — abrilo directamente en el navegador. También existe una versión interactiva publicada en [claude.ai/code/artifact/3cc0f5a9-1bd8-4453-9f4f-a0a387a2c7b8](https://claude.ai/code/artifact/3cc0f5a9-1bd8-4453-9f4f-a0a387a2c7b8) (puede requerir sesión iniciada en claude.ai); el HTML local en `docs/` es la copia durable que no depende de ese servicio.

Complemento con instalación y tour visual de las 12 bases de datos/BaaS mencionadas en la auditoría: [`docs/tour-bases-de-datos.html`](docs/tour-bases-de-datos.html) (también publicado en [claude.ai/code/artifact/ab04c366-2536-45a1-9bcb-8b5642693dc5](https://claude.ai/code/artifact/ab04c366-2536-45a1-9bcb-8b5642693dc5)).

## Pendiente de limpieza

Hay algunos archivos sueltos en la raíz que parecen scripts de un solo uso y están pendientes de archivar o eliminar: `insertar_enero.php`, `resumen_enero.php`, `prueba.html`, `PLANTILLA_HISTORICO.tsv`, `PLANTILLA_HISTORICO_ENERO_FEBRERO.txt`.
