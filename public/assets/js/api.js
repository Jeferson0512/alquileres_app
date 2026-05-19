const BASE = "../api/config/router.php?path=";

/* Helper: genera el sufijo &periodo_id=X cuando se pasa un pid */
const pid = (periodoId) => periodoId ? `&periodo_id=${periodoId}` : "";

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(BASE + path, {
    headers,
    ...options,
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (_) {
    throw new Error(`Respuesta invalida del servidor: ${text.slice(0, 120)}`);
  }

  if (!response.ok || !data.ok) {
    throw new Error(data.message || "Error en la petición");
  }

  return data;
}

export const API = {
  listPeriodos: () => request("periodos"),
  getDashboard: (periodoId) => request(`dashboard${pid(periodoId)}`),
  getRecibo: (periodoId) => request(`recibo${pid(periodoId)}`),
  saveRecibo: (payload, periodoId) => request(`recibo${pid(periodoId)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  getLecturas: (periodoId) => request(`lecturas${pid(periodoId)}`),
  syncLecturas: (periodoId) => request(`lecturas/sync${pid(periodoId)}`, { method: "POST" }),
  saveLecturas: (items, periodoId) => request(`lecturas/save${pid(periodoId)}`, {
    method: "POST",
    body: JSON.stringify({ items }),
  }),
  createPeriodo: (payload) => request("periodos", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updatePeriodo: (id, payload) => request(`periodos&id_periodo=${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
  previewLiquidacion: (periodoId) => request(`liquidacion/preview${pid(periodoId)}`),
  generateLiquidacion: (periodoId, payload = {}) => request(`liquidacion/generate${pid(periodoId)}`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  getCobros: (periodoId) => request(`cobros${pid(periodoId)}`),
  getCobroDetalle: (idCobro) => request(`cobros/detalle&id_cobro=${encodeURIComponent(idCobro)}`),
  getDeudaAnterior: (idPersona, idUnidad, idPeriodo) => request(
    `cobros/deuda-anterior&id_persona=${encodeURIComponent(idPersona)}&id_unidad=${encodeURIComponent(idUnidad)}&id_periodo=${encodeURIComponent(idPeriodo)}`
  ),
  generateCobros: (periodoId) => request(`cobros/generate${pid(periodoId)}`, { method: "POST" }),
  forceRefreshCobros: (periodoId, payload = {}) => request(`cobros/force-refresh${pid(periodoId)}`, { method: "POST", body: JSON.stringify(payload) }),

  listInquilinos: (q = "") => request(`inquilinos${q ? `&q=${encodeURIComponent(q)}` : ""}`),
  getInquilino: (id) => request(`inquilinos&id=${id}`),
  createInquilino: (payload) => request("inquilinos", { method: "POST", body: JSON.stringify(payload) }),
  updateInquilino: (id, payload) => request(`inquilinos&id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteInquilino: (id) => request(`inquilinos&id=${id}`, { method: "DELETE" }),

  listUnidades: () => request("unidades"),
  getUnidad: (id) => request(`unidades&id=${id}`),
  createUnidad: (payload) => request("unidades", { method: "POST", body: JSON.stringify(payload) }),
  updateUnidad: (id, payload) => request(`unidades&id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUnidad: (id) => request(`unidades&id=${id}`, { method: "DELETE" }),

  listOcupaciones: (estado = "") => request(`ocupaciones${estado ? `&estado=${encodeURIComponent(estado)}` : ""}`),
  getOcupacion: (id) => request(`ocupaciones&id=${id}`),
  createOcupacion: (payload) => request("ocupaciones", { method: "POST", body: JSON.stringify(payload) }),
  updateOcupacion: (id, payload) => request(`ocupaciones&id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteOcupacion: (id) => request(`ocupaciones&id=${id}`, { method: "DELETE" }),

  listPagos: (filters = {}) => {
    const params = [];
    if (filters.id_cobro) params.push(`id_cobro=${encodeURIComponent(filters.id_cobro)}`);
    if (filters.id_periodo) params.push(`id_periodo=${encodeURIComponent(filters.id_periodo)}`);
    return request(`pagos${params.length ? `&${params.join("&")}` : ""}`);
  },
  getPago: (id) => request(`pagos&id=${id}`),
  createPago: (payload) => request("pagos", { method: "POST", body: JSON.stringify(payload) }),
  reversePago: (id, payload) => request(`pagos/reversa&id=${id}`, { method: "POST", body: JSON.stringify(payload) }),
  getPagoAuditoria: (id) => request(`pagos/auditoria&id=${id}`),
  updatePago: (id, payload) => request(`pagos&id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deletePago: (id) => request(`pagos&id=${id}`, { method: "DELETE" }),

  listTarifas: (idInmueble = 1) => request(`tarifas&id_inmueble=${idInmueble}`),
  updateTarifa: (id, payload) => request(`tarifas&id=${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  getConfigCobranza: (idInmueble = 1) => request(`config-cobranza&id_inmueble=${idInmueble}`),
  saveConfigCobranza: (payload, idInmueble = 1) => request(`config-cobranza&id_inmueble=${idInmueble}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }),
  uploadQrCobranza: (file, idInmueble = 1) => {
    const formData = new FormData();
    formData.append("qr", file);
    formData.append("id_inmueble", String(idInmueble));
    return request(`config-cobranza/upload-qr&id_inmueble=${idInmueble}`, {
      method: "POST",
      body: formData,
    });
  },
};