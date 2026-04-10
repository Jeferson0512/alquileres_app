const fs = require("fs");
const path = require("path");
const { createSeedData } = require("./helpers/api-client");

module.exports = async () => {
  const marker = `E2E_${Date.now()}`;
  const seed = await createSeedData(marker);
  if (!seed?.id_cobro || !seed?.codigo_unidad) {
    throw new Error("Seed E2E incompleto: falta id_cobro o codigo_unidad");
  }

  const statePath = path.resolve(__dirname, ".e2e-seed.json");
  fs.writeFileSync(statePath, JSON.stringify(seed, null, 2), "utf8");
};
