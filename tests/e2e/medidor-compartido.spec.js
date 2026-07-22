const { test, expect } = require("@playwright/test");
const { createSeedMedidorCompartido, cleanupSeedMedidorCompartido } = require("./helpers/api-client");

/**
 * Prueba el reparto de medidor compartido (unidades_medidor_compartido):
 * una unidad "dependiente" no tiene medidor propio y paga un porcentaje
 * fijo de la luz de su unidad "titular". El seed ejercita la MISMA funcion
 * que usa cobros/generate.php (buildCobrosProgramados) sobre datos 100%
 * aislados -- no llama al endpoint real de "Generar cobros" a proposito,
 * porque eso regeneraria tambien los cobros REALES del periodo activo
 * (las 8 unidades ocupadas de produccion). buildCobrosProgramados en si
 * misma es de solo lectura (calcula el "programado", no persiste nada),
 * asi que se puede ejercitar con seguridad contra el periodo real.
 *
 * Aislado del seed/cleanup global (.e2e-seed.json): este test siembra y
 * limpia sus propios datos dentro del mismo test.
 */
test.describe("Medidor compartido", () => {
  test("reparte el consumo de luz entre unidad titular y dependiente segun el porcentaje configurado", async () => {
    const marker = `E2E_MEDIDOR_${Date.now()}`;
    const seed = await createSeedMedidorCompartido(marker);

    try {
      expect(seed.porcentaje_dependiente).toBe(25);
      expect(seed.total_pagar_luz_titular).toBe(200);

      // Misma logica de reparto que corre en produccion: 75% para el
      // titular, 25% para el dependiente, sobre el total_pagar_luz del titular.
      expect(seed.titular.monto_luz_programado).toBe(150);
      expect(seed.dependiente.monto_luz_programado).toBe(50);
      expect(seed.titular.monto_luz_programado + seed.dependiente.monto_luz_programado).toBe(seed.total_pagar_luz_titular);
    } finally {
      await cleanupSeedMedidorCompartido(seed);
    }
  });
});
