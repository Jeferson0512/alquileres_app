const API_BASE = "http://localhost/proyectos/alquileres-app/api/config/router.php?path=";
const fetch = require("node-fetch");

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error(`Respuesta no JSON en ${path}: ${text.slice(0, 180)}`);
  }

  if (!res.ok || !data.ok) {
    throw new Error(`API ${path} fallo: ${data.message || "Error desconocido"}`);
  }

  return data;
}

async function createSeedData(marker) {
  const seed = await apiRequest("testing/e2e-seed", {
    method: "POST",
    body: JSON.stringify({ marker }),
  });
  return seed.data;
}

async function cleanupSeedData(seed) {
  await apiRequest("testing/e2e-cleanup", {
    method: "POST",
    body: JSON.stringify(seed),
  });
}

async function createSeedMedidorCompartido(marker) {
  const seed = await apiRequest("testing/e2e-seed-medidor", {
    method: "POST",
    body: JSON.stringify({ marker }),
  });
  return seed.data;
}

async function cleanupSeedMedidorCompartido(seed) {
  await apiRequest("testing/e2e-cleanup-medidor", {
    method: "POST",
    body: JSON.stringify(seed),
  });
}

module.exports = {
  apiRequest,
  createSeedData,
  cleanupSeedData,
  createSeedMedidorCompartido,
  cleanupSeedMedidorCompartido,
};
