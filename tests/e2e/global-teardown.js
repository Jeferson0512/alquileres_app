const fs = require("fs");
const path = require("path");
const { cleanupSeedData } = require("./helpers/api-client");

module.exports = async () => {
  const statePath = path.resolve(__dirname, ".e2e-seed.json");
  if (!fs.existsSync(statePath)) return;

  const raw = fs.readFileSync(statePath, "utf8");
  const seed = JSON.parse(raw);

  await cleanupSeedData(seed);

  fs.unlinkSync(statePath);
};
