const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const APP_URL = "http://localhost/proyectos/alquileres-app/public/index.html";
const STATE_PATH = path.resolve(__dirname, ".e2e-seed.json");

function loadSeed() {
  return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
}

test.describe("Cobros y Avisos", () => {
  test("navegacion y render en Cobros", async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.locator("#menu .menu-item").first()).toBeVisible({ timeout: 30000 });

    await page.getByRole("button", { name: "Cobros" }).click();
    await expect(page.getByRole("heading", { name: "Cobros generados" })).toBeVisible();

    const detailBtn = page.locator("[data-detail]").first();
    if (await detailBtn.count()) {
      await detailBtn.click();
      await expect(page.getByText("Detalle por concepto")).toBeVisible();
    }
  });

  test("navegacion y render en Avisos", async ({ page }) => {
    await page.goto(APP_URL);
    await expect(page.locator("#menu .menu-item").first()).toBeVisible({ timeout: 30000 });
    await page.getByRole("button", { name: "Avisos" }).click();

    await expect(page.getByRole("heading", { name: "Avisos de cobro" })).toBeVisible();

    const avisoItem = page.locator(".aviso-item").first();
    if (await avisoItem.count()) {
      await avisoItem.click();
      await expect(page.locator("#avisoCard")).toBeVisible();
    }
  });

  test("seed E2E visible y buscable", async ({ page }) => {
    const seed = loadSeed();

    await page.goto(APP_URL);
    await expect(page.locator("#menu .menu-item").first()).toBeVisible({ timeout: 30000 });
    await page.getByRole("button", { name: "Inquilinos" }).click();

    const search = page.locator("#globalSearch");
    await search.fill(seed.marker);
    await page.waitForTimeout(400);

    await expect(page.getByText(seed.marker)).toBeVisible();
  });

  test("flujo real E2E: Cobros -> pago -> anular -> Avisos", async ({ page }) => {
    const seed = loadSeed();

    await page.goto(APP_URL);
    await expect(page.locator("#menu .menu-item").first()).toBeVisible({ timeout: 30000 });

    await page.getByRole("button", { name: "Cobros" }).click();
    await expect(page.getByRole("heading", { name: "Cobros generados" })).toBeVisible();

    const search = page.locator("#cobrosSearch");
    await search.fill(seed.codigo_unidad);
    await page.waitForTimeout(400);

    const row = page.locator("tbody tr", { hasText: seed.codigo_unidad }).first();
    await expect(row).toBeVisible({ timeout: 15000 });

    const payBtn = row.locator("[data-pay]").first();
    await expect(payBtn).toBeVisible({ timeout: 10000 });
    await payBtn.click();

    await expect(page.locator("#pagoFecha")).toBeVisible();
    await page.locator("#pagoMonto").fill(String(seed.total_cobrar));
    await page.locator("#pagoOperacion").fill(`OP-${seed.marker}`);
    await page.locator("#modalSave").click();

    await expect(page.locator("tbody tr", { hasText: seed.codigo_unidad }).first().getByText("PAGADO")).toBeVisible({ timeout: 15000 });

    const summaryBtn = page.locator("tbody tr", { hasText: seed.codigo_unidad }).first().locator("[data-summary]").first();
    await expect(summaryBtn).toBeVisible({ timeout: 10000 });
    await summaryBtn.click();

    const reverseBtn = page.locator("#modalBody [data-reverse]").first();
    await expect(reverseBtn).toBeVisible({ timeout: 10000 });
    await reverseBtn.click();

    await expect(page.locator("#confirmOverlay")).toBeVisible();
    await page.locator("#confirmYes").click();

    await page.locator("#modalClose").click();
    await expect(page.locator("#modalOverlay")).toBeHidden();

    await search.fill(seed.codigo_unidad);
    await page.waitForTimeout(400);
    await expect(page.locator("tbody tr", { hasText: seed.codigo_unidad }).first().getByText("PAGADO")).toHaveCount(0);

    await page.getByRole("button", { name: "Avisos" }).click();
    await expect(page.getByRole("heading", { name: "Avisos de cobro" })).toBeVisible();

    const aviso = page.locator(".aviso-item", { hasText: seed.codigo_unidad }).first();
    await expect(aviso).toBeVisible({ timeout: 10000 });
    await aviso.click();

    await expect(page.locator("#avisoCard")).toBeVisible();
    await expect(page.locator("#avisoCard").getByText("Pago confirmado")).toHaveCount(0);
    await expect(page.locator("#avisoCard").getByText("Yape")).toBeVisible();
  });
});
