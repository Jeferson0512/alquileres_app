# Pruebas E2E (Playwright)

Este paquete ejecuta pruebas E2E sobre el sistema y entrega reporte HTML.

## Que incluye

1. Suite de flujo real para Cobros y Avisos (incluye pago y anulación).
2. Reparto de medidor compartido (`medidor-compartido.spec.js`): ejercita `buildCobrosProgramados()` (la misma función que usa `cobros/generate.php` en producción) contra una unidad titular y una dependiente sembradas ad-hoc, sin tocar los cobros reales del periodo activo.
3. Reporte automatico de ejecucion en `playwright-report`.
4. Seed + cleanup de datos de prueba para no dejar basura en BD.

## Comandos

```bash
npm install
npm run e2e:install
npm run e2e
npm run e2e:report
```

## Como funciona el seed/cleanup

- Antes de correr pruebas (`global-setup`):
  - crea un inquilino, unidad, ocupacion y cobro propio de prueba con marcador unico `E2E_<timestamp>`.
- Al terminar (`global-teardown`):
  - llama a `testing/e2e-cleanup` para borrar fisicamente en BD todos los datos creados para ese seed.

El estado temporal del seed se guarda en `tests/e2e/.e2e-seed.json` durante la ejecucion y se elimina al final.
