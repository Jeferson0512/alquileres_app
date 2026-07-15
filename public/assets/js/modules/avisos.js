import { API } from "../api.js";
import { money, number, toast } from "../utils.js";

let selectedCobroId = null;
const deudaAnteriorCache = new Map();
let vencimientosContratoCache = null;
let vencimientosContratoLoading = false;
function getAvisoMinimoKwh(config) {
  const value = Number(config?.minimo_kwh_aviso ?? 13.5);
  return Number.isFinite(value) && value > 0 ? value : 13.5;
}

const deudaAnteriorLoading = new Set();
const DEBT_IGNORE_STORAGE_KEY = "avisos.ignore.deudaAnterior.v1";
let ignoredDebtByKey = loadIgnoredDebtMap();
let deudaAnteriorApiDisponible = true;
let deudaAnteriorApiWarned = false;

export function renderAvisos(view, state) {
  const cobros = state.cobros || [];
  const config = state.configCobranza || {};

  if (!selectedCobroId && cobros.length) {
    selectedCobroId = cobros[0].id_cobro;
  }

  const selected = cobros.find((row) => row.id_cobro === selectedCobroId) || cobros[0] || null;
  ensureSelectedDebtState(selected, state);
  ensureVencimientosContrato(state);

  view.innerHTML = `
    <section class="panel avisos-panel">
      <div class="panel-head avisos-head">
        <div>
          <h3>Avisos de cobro</h3>
          <p class="sub">Genera una vista bonita para compartir por Yape, transferencia o captura.</p>
        </div>
        <div class="info-callout avisos-chip">
          El ajuste minimo de luz se suma al cobro sin modificar la liquidacion original.
        </div>
      </div>

      ${renderVencimientosContrato()}

      <div class="avisos-layout">
        <div class="avisos-left">
          ${renderListado(cobros, selected?.id_cobro, config, state)}
        </div>
        <div class="avisos-right">
          ${selected ? renderPreview(selected, config, state) : renderEmpty()}
        </div>
      </div>
    </section>
  `;

  bindAvisosEvents(state);
}

export function openAvisosConfigModal(state) {
  openConfigModal(state.configCobranza || {}, state);
}

function ensureSelectedDebtState(selected, state) {
  if (!selected || !state?.periodoId) return;
  void loadDeudaAnterior(selected, state);
}

function ensureVencimientosContrato(state) {
  if (vencimientosContratoCache !== null || vencimientosContratoLoading) return;
  vencimientosContratoLoading = true;
  API.getAvisosVencimientos()
    .then((res) => {
      vencimientosContratoCache = res?.data || [];
    })
    .catch((error) => {
      vencimientosContratoCache = [];
      console.warn("No se pudo cargar avisos de vencimiento de contrato", error);
    })
    .finally(() => {
      vencimientosContratoLoading = false;
      renderAvisos(document.getElementById("view"), state);
    });
}

function renderVencimientosContrato() {
  const avisos = vencimientosContratoCache || [];
  if (!avisos.length) return "";

  return `
    <div class="vencimientos-contrato-list">
      ${avisos.map((aviso) => `
        <div class="info-callout vencimiento-contrato-item ${aviso.nivel === "URGENTE" ? "vencimiento-urgente" : "vencimiento-proximo"}">
          <strong>${aviso.nivel === "URGENTE" ? "Urgente" : "Próximo a vencer"}:</strong>
          ${escapeHtml(aviso.mensaje)}
        </div>
      `).join("")}
    </div>
  `;
}

async function loadDeudaAnterior(row, state) {
  if (!deudaAnteriorApiDisponible) {
    return;
  }

  const key = deudaAnteriorCacheKey(row, state);
  if (!key || deudaAnteriorCache.has(key) || deudaAnteriorLoading.has(key)) {
    return;
  }

  deudaAnteriorLoading.add(key);
  try {
    const res = await API.getDeudaAnterior(row.id_persona, row.id_unidad, state.periodoId);
    const deuda = Number(res?.data?.deuda_anterior_total || 0);
    deudaAnteriorCache.set(key, deuda);
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("no esta desplegado") || message.includes("schema")) {
      deudaAnteriorApiDisponible = false;
      if (!deudaAnteriorApiWarned) {
        toast("La deuda anterior por API no está disponible aún. Se usará el modo compatible.", "warning");
        deudaAnteriorApiWarned = true;
      }
    }

    // Fallback para evitar reintentos infinitos si el endpoint falla.
    deudaAnteriorCache.set(key, Number(row?.deuda_anterior || 0));
    console.warn("No se pudo cargar deuda anterior", error);
  } finally {
    deudaAnteriorLoading.delete(key);
    const current = getSelectedCobro(state);
    if (current && current.id_cobro === row.id_cobro) {
      renderAvisos(document.getElementById("view"), state);
    }
  }
}

function deudaAnteriorCacheKey(row, state) {
  const idPersona = Number(row?.id_persona || 0);
  const idUnidad = Number(row?.id_unidad || 0);
  const idPeriodo = Number(state?.periodoId || 0);
  if (!idPersona || !idUnidad || !idPeriodo) return "";
  return `${idPeriodo}|${idPersona}|${idUnidad}`;
}

function isDeudaAnteriorLoading(row, state) {
  const key = deudaAnteriorCacheKey(row, state);
  return key ? deudaAnteriorLoading.has(key) : false;
}

function isDebtIgnored(row, state) {
  const key = deudaAnteriorCacheKey(row, state);
  return key ? ignoredDebtByKey[key] === true : false;
}

function setDebtIgnored(row, state, ignored) {
  const key = deudaAnteriorCacheKey(row, state);
  if (!key) return;

  if (ignored) {
    ignoredDebtByKey[key] = true;
  } else {
    delete ignoredDebtByKey[key];
  }

  saveIgnoredDebtMap(ignoredDebtByKey);
}

function loadIgnoredDebtMap() {
  try {
    const raw = localStorage.getItem(DEBT_IGNORE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_) {
    return {};
  }
}

function saveIgnoredDebtMap(data) {
  try {
    localStorage.setItem(DEBT_IGNORE_STORAGE_KEY, JSON.stringify(data || {}));
  } catch (_) {
    // No-op: si falla storage, el toggle funciona solo en memoria.
  }
}

/* ---------- Modal de configuracion de cobranza ---------- */

function openConfigModal(config, state) {
  const $overlay = document.getElementById("modalOverlay");
  const $title   = document.getElementById("modalTitle");
  const $body    = document.getElementById("modalBody");
  const $save    = document.getElementById("modalSave");
  const $cancel  = document.getElementById("modalCancel");
  const $close   = document.getElementById("modalClose");
  const $modal   = $overlay?.querySelector(".modal");
  if (!$overlay) return;

  $title.textContent = "Configuracion de cobranza";
  $body.innerHTML    = renderConfigFormHtml(config);
  if ($modal) $modal.classList.add("modal-wide");
  $overlay.classList.remove("hidden");

  const fileInput = document.getElementById("cfgYapeQrFile");
  const qrInput   = document.getElementById("cfgYapeQr");
  const qrPreview = document.getElementById("cfgQrPreview");

  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (qrPreview) {
      qrPreview.src = URL.createObjectURL(file);
      qrPreview.hidden = false;
    }
  });

  qrInput?.addEventListener("input", () => {
    if (!qrPreview) return;
    qrPreview.src = qrInput.value || "";
    qrPreview.hidden = !qrInput.value;
  });

  const closeConfig = () => {
    $overlay.classList.add("hidden");
    if ($modal) $modal.classList.remove("modal-wide");
    // restaurar handlers genericos (los sobreescribimos abajo)
    $cancel.onclick = null;
    $close.onclick  = null;
    $save.onclick   = null;
  };

  $cancel.onclick = closeConfig;
  $close.onclick  = closeConfig;

  $save.onclick = async () => {
    const payload = {
      monto_minimo_luz: parseFloat(document.getElementById("cfgMinimoLuz")?.value  || 0),
      minimo_kwh_aviso: parseFloat(document.getElementById("cfgMinimoKwhAviso")?.value  || 13.5),
      yape_titular:     document.getElementById("cfgYapeTitular")?.value  || "",
      yape_numero:      document.getElementById("cfgYapeNumero")?.value   || "",
      yape_qr:          document.getElementById("cfgYapeQr")?.value       || "",
      banco_nombre:     document.getElementById("cfgBancoNombre")?.value  || "",
      banco_titular:    document.getElementById("cfgBancoTitular")?.value || "",
      banco_cuenta:     document.getElementById("cfgBancoCuenta")?.value  || "",
      banco_cci:        document.getElementById("cfgBancoCci")?.value     || "",
      mensaje_base:     document.getElementById("cfgMensajeBase")?.value  || "",
    };
    try {
      $save.disabled    = true;
      $save.textContent = "Guardando...";

      const qrFile = fileInput?.files?.[0] || null;
      if (qrFile) {
        const upload = await API.uploadQrCobranza(qrFile);
        payload.yape_qr = upload.data?.path || payload.yape_qr;
      }

      await API.saveConfigCobranza(payload);
      const res = await API.getConfigCobranza();
      state.configCobranza = res.data;
      closeConfig();
      renderAvisos(document.getElementById("view"), state);
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      $save.disabled    = false;
      $save.textContent = "Guardar";
    }
  };
}

function renderConfigFormHtml(config) {
  const qrVal = escapeAttr(config.yape_qr ?? "");
  const hasQr = (config.yape_qr ?? "").length > 0;
  return `
    <div class="form-grid aviso-config-grid">
      <label>
        <span>Minimo de luz (S/)</span>
        <input id="cfgMinimoLuz" type="number" step="0.01" min="0" value="${formatInputNumber(config.monto_minimo_luz)}" />
      </label>
      <label>
        <span>Consumo mínimo para PNG (kWh)</span>
        <input id="cfgMinimoKwhAviso" type="number" step="0.1" min="0" value="${formatInputNumber(config.minimo_kwh_aviso ?? 13.5)}" />
      </label>
      <label>
        <span>Titular Yape</span>
        <input id="cfgYapeTitular" type="text" value="${escapeHtml(config.yape_titular ?? "")}" />
      </label>
      <label>
        <span>Numero Yape</span>
        <input id="cfgYapeNumero" type="text" value="${escapeHtml(config.yape_numero ?? "")}" />
      </label>
      <label class="full">
        <span>QR Yape</span>
        <div class="qr-upload-row">
          <label class="btn btn-light qr-file-btn">
            Subir imagen
            <input id="cfgYapeQrFile" type="file" accept="image/*" style="display:none" />
          </label>
          <span class="qr-or">o pega una URL:</span>
          <input id="cfgYapeQr" type="text" class="qr-url-input" value="${qrVal}" placeholder="https://..." />
        </div>
        <small class="qr-help">Si subes una imagen, se guarda en el servidor y solo se registra su ruta.</small>
        <img id="cfgQrPreview" src="${qrVal}" class="qr-preview-thumb" alt="Vista previa QR" ${hasQr ? "" : "hidden"} />
      </label>
      <label>
        <span>Banco</span>
        <input id="cfgBancoNombre" type="text" value="${escapeHtml(config.banco_nombre ?? "")}" />
      </label>
      <label>
        <span>Titular banco</span>
        <input id="cfgBancoTitular" type="text" value="${escapeHtml(config.banco_titular ?? "")}" />
      </label>
      <label>
        <span>Cuenta</span>
        <input id="cfgBancoCuenta" type="text" value="${escapeHtml(config.banco_cuenta ?? "")}" />
      </label>
      <label>
        <span>CCI</span>
        <input id="cfgBancoCci" type="text" value="${escapeHtml(config.banco_cci ?? "")}" />
      </label>
      <label class="full">
        <span>Mensaje base</span>
        <textarea id="cfgMensajeBase" rows="3">${escapeHtml(config.mensaje_base ?? "")}</textarea>
      </label>
    </div>
  `;
}

function renderListado(cobros, selectedId, config, state) {
  const avisoMinimoKwh = getAvisoMinimoKwh(config);
  if (!cobros.length) {
    return `
      <section class="subpanel">
        <div class="subpanel-head">
          <h4>Cobros del periodo</h4>
          <span class="sub">Selecciona uno para generar el aviso</span>
        </div>
        <div class="info-callout">No hay cobros con consumo igual o superior a ${avisoMinimoKwh} kWh para este periodo.</div>
      </section>
    `;
  }

  return `
    <section class="subpanel">
      <div class="subpanel-head">
        <h4>Cobros del periodo</h4>
        <span class="sub">Selecciona uno para generar el aviso</span>
      </div>
      <div class="avisos-list">
        ${cobros.map((row) => `
          <button class="aviso-item ${isCobroPagadoCompleto(row, state) ? "aviso-item-paid" : ""} ${row.id_cobro === selectedId ? "active" : ""}" data-cobro-id="${row.id_cobro}">
            <div>
              <strong>${row.codigo_unidad}</strong>
              <span>${escapeHtml(formatTenantDisplayName(row))}</span>
            </div>
            <div class="aviso-item-right">
              <small>${buildAvisoItemMeta(row, state)}</small>
              <strong>${money(getSaldoTotalPendiente(row, state))}</strong>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPreview(row, config, state) {
  const tenantName = formatTenantDisplayName(row);
  const periodo = state.periodos.find((item) => item.id_periodo === state.periodoId);
  const periodoTexto = periodo
    ? new Date(periodo.anio, periodo.mes - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" })
    : "Periodo actual";
  const montoLuzFinal = getMontoLuzFinal(row);
  const otros = Number(row.otros_conceptos || 0);
  const pagado = getPagadoTotal(row);
  const saldoPeriodo = getSaldoPendiente(row);
  const consumo = Number(row?.consumo_kwh || 0);
  const avisoMinimoKwh = getAvisoMinimoKwh(config);
  const isLowConsumo = consumo < avisoMinimoKwh;
  const deudaAnteriorReal = getDeudaAnteriorReal(row, state);
  const deudaAnteriorLoadingNow = isDeudaAnteriorLoading(row, state);
  const deudaAnteriorIgnorada = isDebtIgnored(row, state) && deudaAnteriorReal > 0;
  const deudaAnterior = deudaAnteriorIgnorada ? 0 : deudaAnteriorReal;
  const saldoTotal = getSaldoTotalPendiente(row, state);
  const isPaid = isCobroPagadoCompleto(row, state);
  const hasDeudaAnterior = deudaAnterior > 0;
  const saldoLabel = isPaid ? "Pagado" : (hasDeudaAnterior ? "Pendiente total" : "Pendiente del mes");
  const totalPrincipal = isPaid
    ? Math.max(pagado, Number(row.total_cobrar || 0))
    : (hasDeudaAnterior ? saldoTotal : saldoPeriodo);

  return `
    <section class="subpanel aviso-preview-shell ${isPaid ? "paid" : ""}">
      <div class="subpanel-head">
        <h4>Vista previa</h4>
        <div class="aviso-actions">
          ${deudaAnteriorReal > 0 || deudaAnteriorIgnorada ? `
            <button class="btn btn-light" id="btnToggleDeudaAnterior">
              ${deudaAnteriorIgnorada ? "Reactivar deuda anterior" : "Cancelar deuda anterior"}
            </button>
          ` : ""}
          <button class="btn btn-light" id="btnCopiarAviso">Copiar resumen</button>
          <button class="btn btn-light" id="btnDescargarAviso">Descargar PNG</button>
          <button class="btn btn-primary" id="btnCompartirAviso">Compartir</button>
        </div>
        ${isLowConsumo ? `
          <div class="aviso-debt-note">
            <strong>En el PNG este consumo se mostrará como 0 kWh cuando sea menor a ${avisoMinimoKwh}.</strong>
          </div>
        ` : ""}
      </div>

      ${deudaAnteriorLoadingNow ? `
        <div class="aviso-debt-note">
          <strong>Calculando deuda anterior...</strong>
          <span>Estamos validando periodos previos para este inquilino.</span>
        </div>
      ` : ""}

      <div class="aviso-card ${isPaid ? "aviso-card-paid" : ""}" id="avisoCard">
        <div class="aviso-card-top">
          <div>
            <p class="aviso-kicker">Resumen de pago</p>
            <h3>${escapeHtml(tenantName)}</h3>
            <p class="aviso-periodo">${capitalize(periodoTexto)} · Unidad ${row.codigo_unidad}</p>
          </div>
          <div class="aviso-total-box">
            <span>${saldoLabel}</span>
            <strong>${money(totalPrincipal)}</strong>
            <small>${buildTotalBoxNote(row, state)}</small>
          </div>
        </div>

        ${hasDeudaAnterior ? `
          <div class="aviso-balance-strip">
            ${pagado > 0 ? `<div><span>Pagado del periodo</span><strong>${money(pagado)}</strong></div>` : ""}
            <div><span>Pendiente del periodo</span><strong>${money(isPaid ? 0 : saldoPeriodo)}</strong></div>
            ${deudaAnterior > 0 ? `<div><span>Deuda anterior</span><strong>${money(deudaAnterior)}</strong></div>` : ""}
          </div>
        ` : ""}

        <div class="aviso-grid">
          <div class="aviso-block">
            <h5>Detalle</h5>
            <div class="kv"><span>Alquiler</span><strong>${money(row.monto_alquiler)}</strong></div>
            <div class="kv"><span>Luz</span><strong>${money(montoLuzFinal)}</strong></div>
            <div class="kv"><span>Agua</span><strong>${money(row.monto_agua)}</strong></div>
            ${Number(row.monto_gas || 0) > 0 ? `<div class="kv"><span>Gas</span><strong>${money(row.monto_gas)}</strong></div>` : ""}
            ${otros > 0 ? `<div class="kv"><span>Otros conceptos</span><strong>${money(otros)}</strong></div>` : ""}
            ${pagado > 0 ? `<div class="kv kv-emphasis"><span>Pagado acumulado</span><strong>${money(pagado)}</strong></div>` : ""}
            <div class="kv kv-emphasis"><span>${isPaid ? "Estado del periodo" : "Saldo del periodo"}</span><strong>${isPaid ? "Cancelado" : money(saldoPeriodo)}</strong></div>
          </div>

          <div class="aviso-block">
            <h5>Consumo</h5>
            <div class="aviso-consumo-circle">
              <strong>${number(row.consumo_kwh ?? 0, 2)}</strong>
              <span>kWh</span>
            </div>
            <p class="aviso-consumo-note">Este valor refleja el consumo liquidado del periodo para tu unidad.</p>
          </div>
        </div>

        ${!isPaid ? `
          <div class="aviso-payments">
            <div class="aviso-method primary">
              <div>
                <p class="aviso-method-title">Yape</p>
                <strong>${escapeHtml(config.yape_titular || "Pendiente configurar")}</strong>
                <p>${escapeHtml(config.yape_numero || "Sin numero configurado")}</p>
              </div>
              <div class="aviso-qr-wrap">
                ${config.yape_qr ? `<img src="${escapeAttr(config.yape_qr)}" alt="QR Yape" class="aviso-qr" />` : `<div class="aviso-qr empty">QR pendiente</div>`}
              </div>
            </div>

            <div class="aviso-method secondary">
              <p class="aviso-method-title">Transferencia</p>
              <strong>${escapeHtml(config.banco_nombre || "Banco pendiente")}</strong>
              <p>Titular: ${escapeHtml(config.banco_titular || "Sin titular")}</p>
              <p>Cuenta: ${escapeHtml(config.banco_cuenta || "Sin cuenta")}</p>
              <p>CCI: ${escapeHtml(config.banco_cci || "Sin CCI")}</p>
            </div>
          </div>
        ` : `
          <div class="aviso-paid-ok">
            <strong>Pago confirmado</strong>
            <p>Este cobro ya fue cancelado. No se muestran medios de pago porque ya no existe deuda activa.</p>
          </div>
        `}

        ${deudaAnterior > 0 ? `
          <div class="aviso-debt-note">
            <strong>Tienes deuda de periodos anteriores.</strong>
            <span>Se suma ${money(deudaAnterior)} al saldo del periodo actual.</span>
          </div>
        ` : ""}

        ${deudaAnteriorIgnorada ? `
          <div class="aviso-debt-note aviso-debt-note-cleared">
            <strong>Deuda anterior cancelada en este aviso.</strong>
            <span>Solo se mostrará la deuda del periodo actual.</span>
          </div>
        ` : ""}

        <div class="aviso-footer">
          <p>${escapeHtml(config.mensaje_base || "Hola, te comparto tu resumen del mes.")}</p>
        </div>
      </div>
    </section>
  `;
}

function renderEmpty() {
  return `
    <section class="subpanel aviso-preview-shell">
      <div class="info-callout">No hay cobros generados para este periodo.</div>
    </section>
  `;
}

function bindAvisosEvents(state) {
  document.querySelectorAll(".aviso-item").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCobroId = Number(button.dataset.cobroId);
      renderAvisos(document.getElementById("view"), state);
    });
  });

  document.getElementById("btnCopiarAviso")?.addEventListener("click", async () => {
    const row = getSelectedCobro(state);
    if (!row) return;
    const text = buildSummaryText(row, state.configCobranza, state);
    try {
      await navigator.clipboard.writeText(text);
      toast("Resumen copiado al portapapeles");
    } catch (_) {
      toast(text, 'info');
    }
  });

  document.getElementById("btnDescargarAviso")?.addEventListener("click", async () => {
    const row = getSelectedCobro(state);
    if (!row) return;
    try {
      const blob = await generateAvisoPng(row, state.configCobranza, state);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildAvisoFilename(row, state);
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast(error.message, 'error');
    }
  });

  document.getElementById("btnCompartirAviso")?.addEventListener("click", async () => {
    const row = getSelectedCobro(state);
    if (!row) return;

    const text = buildSummaryText(row, state.configCobranza, state);
    const consumo = Number(row?.consumo_kwh || 0);
    const avisoMinimoKwh = getAvisoMinimoKwh(state.configCobranza);
    const isLowConsumo = consumo < avisoMinimoKwh;

    try {
      if (!isLowConsumo) {
        const blob = await generateAvisoPng(row, state.configCobranza, state);
        const file = new File([blob], buildAvisoFilename(row, state), { type: "image/png" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `Cobro ${row.codigo_unidad}`,
            text,
            files: [file],
          });
          return;
        }
      }

      if (navigator.share) {
        await navigator.share({ title: `Cobro ${row.codigo_unidad}`, text });
        return;
      }

      await navigator.clipboard.writeText(text);
      toast("Tu navegador no soporta compartir archivos. Se copió el resumen.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        toast(error.message || "No se pudo compartir el aviso", 'error');
      }
    }
  });

  document.getElementById("btnToggleDeudaAnterior")?.addEventListener("click", () => {
    const row = getSelectedCobro(state);
    if (!row) return;

    const nextIgnored = !isDebtIgnored(row, state);
    setDebtIgnored(row, state, nextIgnored);
    toast(nextIgnored ? "Deuda anterior cancelada en el aviso" : "Deuda anterior restaurada en el aviso", "info");
    renderAvisos(document.getElementById("view"), state);
  });
}

function getSelectedCobro(state) {
  return (state.cobros || []).find((row) => row.id_cobro === selectedCobroId) || state.cobros?.[0] || null;
}

function getMontoLuzFinal(row) {
  return Number(row?.monto_luz || 0) + Number(row?.ajuste_minimo_luz || 0);
}

function getPagadoTotal(row) {
  return Number(row?.pagado_total || 0);
}

function getSaldoPendiente(row) {
  return Number(row?.saldo_pendiente ?? row?.total_cobrar ?? 0);
}

function getDeudaAnteriorReal(row, state) {
  const key = deudaAnteriorCacheKey(row, state);
  if (key && deudaAnteriorCache.has(key)) {
    return Number(deudaAnteriorCache.get(key) || 0);
  }
  return Number(row?.deuda_anterior || 0);
}

function getDeudaAnterior(row, state) {
  const deuda = getDeudaAnteriorReal(row, state);
  return isDebtIgnored(row, state) ? 0 : deuda;
}

function getSaldoTotalPendiente(row, state) {
  return getSaldoPendiente(row) + getDeudaAnterior(row, state);
}

function buildAvisoItemMeta(row, state) {
  const deudaAnterior = getDeudaAnterior(row, state);
  const deudaIgnorada = isDebtIgnored(row, state) && getDeudaAnteriorReal(row, state) > 0;
  if (deudaIgnorada) {
    return `Solo mes actual · ${row.fecha_vencimiento ?? "Sin vencimiento"}`;
  }
  if (deudaAnterior > 0) {
    return `Incluye deuda anterior · ${row.fecha_vencimiento ?? "Sin vencimiento"}`;
  }
  if (getPagadoTotal(row) > 0) {
    return `Saldo pendiente · ${row.fecha_vencimiento ?? "Sin vencimiento"}`;
  }
  return row.fecha_vencimiento ?? "Sin vencimiento";
}

function buildTotalBoxNote(row, state) {
  if (isCobroPagadoCompleto(row, state)) {
    return "Cobro cancelado completamente";
  }
  const deudaAnterior = getDeudaAnterior(row, state);
  const deudaIgnorada = isDebtIgnored(row, state) && getDeudaAnteriorReal(row, state) > 0;
  if (deudaIgnorada) {
    return `Solo mes ${money(getSaldoPendiente(row))}`;
  }
  if (deudaAnterior > 0) {
    return `Mes ${money(getSaldoPendiente(row))} + anteriores ${money(deudaAnterior)}`;
  }
  if (getPagadoTotal(row) > 0) {
    return `Ya se pago ${money(getPagadoTotal(row))}`;
  }
  return `Vence ${row.fecha_vencimiento ?? "por definir"}`;
}

function formatTenantDisplayName(row) {
  const nombres = splitWords(row?.nombres);
  const apellidos = splitWords(row?.apellidos);

  if (!nombres.length && !apellidos.length) {
    return toTitleCase(row?.inquilino || "");
  }

  const nombreFormateado = compactNamePart(nombres);
  const apellidoFormateado = compactNamePart(apellidos);

  return [nombreFormateado, apellidoFormateado].filter(Boolean).join(" ");
}

function compactNamePart(words) {
  if (!words.length) return "";
  const [first, ...rest] = words;
  return [toTitleCase(first), ...rest.map(initialWithDot)].join(" ");
}

function splitWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function initialWithDot(word) {
  const clean = String(word || "").trim();
  if (!clean) return "";
  return clean.charAt(0).toLocaleUpperCase("es-PE") + ".";
}

function toTitleCase(value) {
  return String(value || "")
    .toLocaleLowerCase("es-PE")
    .replace(/(^|\s|[-'])\p{L}/gu, (match) => match.toLocaleUpperCase("es-PE"));
}

function buildSummaryText(row, config, state) {
  const tenantName = formatTenantDisplayName(row);
  const pagado = getPagadoTotal(row);
  const saldoPeriodo = getSaldoPendiente(row);
  const deudaAnterior = getDeudaAnterior(row, state);
  const saldoTotal = getSaldoTotalPendiente(row, state);
  const isPaid = isCobroPagadoCompleto(row, state);
  const hasDeudaAnterior = deudaAnterior > 0;
  const periodo = state.periodos.find((item) => item.id_periodo === state.periodoId);
  const periodoTexto = periodo
    ? capitalize(new Date(periodo.anio, periodo.mes - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" }))
    : "Periodo actual";
  const partes = [
    config?.mensaje_base || "Hola, te comparto tu resumen del mes.",
    `Unidad ${row.codigo_unidad} · ${tenantName}`,
    `Periodo: ${periodoTexto}`,
    isPaid ? "Estado: PAGADO COMPLETO" : null,
    `Consumo: ${number(row.consumo_kwh ?? 0, 2)} kWh`,
    `Luz: ${money(getMontoLuzFinal(row))}`,
    `Agua: ${money(row.monto_agua)}`,
    pagado > 0 ? `Pagado del periodo: ${money(pagado)}` : null,
    `Pendiente del periodo: ${money(isPaid ? 0 : saldoPeriodo)}`,
    deudaAnterior > 0 ? `Deuda anterior: ${money(deudaAnterior)}` : null,
    `${isPaid ? "Pagado total" : (hasDeudaAnterior ? "Pendiente total" : "Pendiente del mes")}: ${money(isPaid ? Math.max(pagado, Number(row.total_cobrar || 0)) : (hasDeudaAnterior ? saldoTotal : saldoPeriodo))}`,
    row.fecha_vencimiento ? `Vence: ${row.fecha_vencimiento}` : null,
    !isPaid && config?.yape_numero ? `Yape: ${config.yape_numero} (${config.yape_titular || ""})` : null,
    !isPaid && config?.banco_nombre ? `Transferencia: ${config.banco_nombre} / ${config.banco_cuenta || config.banco_cci || ""}` : null,
  ].filter(Boolean);
  return partes.join("\n");
}

function buildAvisoFilename(row, state) {
  const periodo = state.periodos?.find((p) => p.id_periodo === state.periodoId);
  let mesAnio = "aviso";
  if (periodo) {
    const d = new Date(periodo.anio, periodo.mes - 1, 1);
    const mes = d.toLocaleDateString("es-PE", { month: "long" });
    mesAnio = mes.charAt(0).toUpperCase() + mes.slice(1) + "-" + periodo.anio;
  }

  // "Jeferson Felipe" → "JefersonF"  (primer palabra completa, siguientes reducidas a su inicial)
  const slugPart = (str) => {
    if (!str) return "";
    return str
      .trim()
      .split(/\s+/)
      .map((w, i) => {
        const clean = w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
        return i === 0 ? clean : clean.charAt(0).toUpperCase();
      })
      .join("");
  };

  const nombre = slugPart(row.nombres || "");
  const apellido = slugPart(row.apellidos || "");
  const inquilinoSlug = nombre || apellido
    ? [nombre, apellido].filter(Boolean).join("_")
    : slugPart(row.inquilino || "desconocido");

  return `${mesAnio}-${row.codigo_unidad}-${inquilinoSlug}.png`;
}

async function generateAvisoPng(row, config, state) {
  const consumo = Number(row?.consumo_kwh || 0);
  const avisoMinimoKwh = getAvisoMinimoKwh(config);
  const isLowConsumo = consumo < avisoMinimoKwh;
  const displayConsumo = isLowConsumo ? 0 : consumo;

  const tenantName = formatTenantDisplayName(row);
  const pagado = getPagadoTotal(row);
  const saldoPeriodo = getSaldoPendiente(row);
  const deudaAnterior = getDeudaAnterior(row, state);
  const saldoTotal = getSaldoTotalPendiente(row, state);
  const isPaid = isCobroPagadoCompleto(row, state);
  const hasDeudaAnterior = deudaAnterior > 0;
  const showBalanceStrip = hasDeudaAnterior;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = isPaid ? 1360 : (showBalanceStrip ? 1520 : 1380);
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, isPaid ? "#14532d" : "#0f172a");
  gradient.addColorStop(1, isPaid ? "#16a34a" : "#1d4ed8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.beginPath();
  ctx.arc(930, 180, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(150, 1160, 180, 0, Math.PI * 2);
  ctx.fill();

  roundRect(ctx, 70, 70, 940, 1240, 38, "#ffffff");

  ctx.fillStyle = "#64748b";
  ctx.font = "28px Segoe UI";
  ctx.fillText("Resumen de pago", 120, 150);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 52px Segoe UI";
  ctx.fillText(tenantName, 120, 220);

  ctx.fillStyle = "#475569";
  ctx.font = "28px Segoe UI";
  const periodo = state.periodos.find((item) => item.id_periodo === state.periodoId);
  const periodoTexto = periodo
    ? capitalize(new Date(periodo.anio, periodo.mes - 1, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" }))
    : "Periodo actual";
  ctx.fillText(`Unidad ${row.codigo_unidad} · ${periodoTexto}`, 120, 270);

  roundRect(ctx, 700, 120, 250, 190, 28, isPaid ? "#dcfce7" : "#eff6ff");
  ctx.fillStyle = isPaid ? "#15803d" : "#2563eb";
  ctx.font = "24px Segoe UI";
  ctx.fillText(isPaid ? "Pagado" : (hasDeudaAnterior ? "Pendiente total" : "Pendiente mes"), 728, 175);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 44px Segoe UI";
  ctx.fillText(formatMoneyText(isPaid ? Math.max(pagado, Number(row.total_cobrar || 0)) : (hasDeudaAnterior ? saldoTotal : saldoPeriodo)), 728, 230);
  ctx.fillStyle = "#64748b";
  ctx.font = "22px Segoe UI";
  wrapText(ctx, buildTotalBoxNote(row, state), 728, 265, 200, 24);

  if (showBalanceStrip) {
    roundRect(ctx, 120, 314, 800, 118, 24, "#eef2ff");
    let balanceX = 160;
    if (pagado > 0) {
      drawMiniMetric(ctx, "Pagado", formatMoneyText(pagado), balanceX, 360);
      balanceX += 220;
    }
    drawMiniMetric(ctx, "Pendiente mes", formatMoneyText(isPaid ? 0 : saldoPeriodo), balanceX, 360);
    if (deudaAnterior > 0) {
      drawMiniMetric(ctx, "Deuda anterior", formatMoneyText(deudaAnterior), balanceX + 250, 360);
    }
  }

  drawSectionTitle(ctx, "Detalle del cobro", 120, showBalanceStrip ? 480 : 360);
  let y = showBalanceStrip ? 540 : 420;
  y = drawLine(ctx, "Alquiler", formatMoneyText(row.monto_alquiler), y);
  y = drawLine(ctx, "Luz", formatMoneyText(getMontoLuzFinal(row)), y);
  y = drawLine(ctx, "Agua", formatMoneyText(row.monto_agua), y);
  if (Number(row.monto_gas || 0) > 0) {
    y = drawLine(ctx, "Gas", formatMoneyText(row.monto_gas), y);
  }
  if (Number(row.otros_conceptos || 0) > 0) {
    y = drawLine(ctx, "Otros conceptos", formatMoneyText(row.otros_conceptos), y);
  }
  if (pagado > 0) {
    y = drawLine(ctx, "Pagado acumulado", formatMoneyText(pagado), y);
  }
  y = drawLine(ctx, isPaid ? "Saldo del periodo" : "Saldo del periodo", formatMoneyText(isPaid ? 0 : saldoPeriodo), y);

  drawSectionTitle(ctx, "Consumo", 120, showBalanceStrip ? 830 : 710);
  roundRect(ctx, 120, showBalanceStrip ? 860 : 740, 260, 180, 28, "#f8fafc");
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 64px Segoe UI";
  ctx.fillText(number(displayConsumo, 2), 170, showBalanceStrip ? 960 : 840);
  ctx.fillStyle = "#64748b";
  ctx.font = "28px Segoe UI";
  ctx.fillText("kWh del periodo", 170, showBalanceStrip ? 1005 : 885);

  if (!isPaid) {
    drawSectionTitle(ctx, "Medios de pago", 460, showBalanceStrip ? 830 : 710);
    roundRect(ctx, 460, showBalanceStrip ? 860 : 740, 460, 180, 28, "#f8fafc");
    ctx.fillStyle = "#16a34a";
    ctx.font = "bold 30px Segoe UI";
    ctx.fillText("Yape", 500, showBalanceStrip ? 920 : 800);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 28px Segoe UI";
    wrapText(ctx, config?.yape_titular || "Pendiente configurar", 500, showBalanceStrip ? 955 : 835, 220, 28);
    ctx.fillStyle = "#475569";
    ctx.font = "26px Segoe UI";
    ctx.fillText(config?.yape_numero || "Sin numero", 500, showBalanceStrip ? 995 : 875);

    if (config?.yape_qr) {
      try {
        const img = await loadImage(config.yape_qr);
        ctx.drawImage(img, 770, showBalanceStrip ? 880 : 760, 120, 120);
      } catch (_) {
        drawQrFallback(ctx, 770, showBalanceStrip ? 880 : 760, 120, 120);
      }
    } else {
      drawQrFallback(ctx, 770, showBalanceStrip ? 880 : 760, 120, 120);
    }

    drawSectionTitle(ctx, "Transferencia", 120, showBalanceStrip ? 1130 : 1010);
    roundRect(ctx, 120, showBalanceStrip ? 1160 : 1040, 800, 170, 28, "#f8fafc");
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 30px Segoe UI";
    ctx.fillText(config?.banco_nombre || "Banco pendiente", 160, showBalanceStrip ? 1220 : 1100);
    ctx.fillStyle = "#475569";
    ctx.font = "26px Segoe UI";
    ctx.fillText(`Titular: ${config?.banco_titular || "Sin titular"}`, 160, showBalanceStrip ? 1265 : 1145);
    ctx.fillText(`Cuenta: ${config?.banco_cuenta || "Sin cuenta"}`, 160, showBalanceStrip ? 1305 : 1185);
    ctx.fillText(`CCI: ${config?.banco_cci || "Sin CCI"}`, 470, showBalanceStrip ? 1305 : 1185);

    ctx.fillStyle = "#64748b";
    ctx.font = "24px Segoe UI";
    wrapText(ctx, config?.mensaje_base || "Hola, te comparto tu resumen del mes.", 120, showBalanceStrip ? 1380 : 1260, 820, 32);
  } else {
    drawSectionTitle(ctx, "Estado del pago", 460, showBalanceStrip ? 830 : 710);
    roundRect(ctx, 460, showBalanceStrip ? 860 : 740, 460, 220, 28, "#f0fdf4");
    ctx.fillStyle = "#15803d";
    ctx.font = "bold 34px Segoe UI";
    ctx.fillText("PAGO CONFIRMADO", 500, showBalanceStrip ? 930 : 810);
    ctx.fillStyle = "#166534";
    ctx.font = "26px Segoe UI";
    ctx.fillText(`Total cancelado: ${formatMoneyText(Math.max(pagado, Number(row.total_cobrar || 0)))}`, 500, showBalanceStrip ? 980 : 860);
    ctx.fillText("No se muestran medios de pago", 500, showBalanceStrip ? 1020 : 900);
    ctx.fillText("porque no existe deuda activa.", 500, showBalanceStrip ? 1055 : 935);

    ctx.fillStyle = "#64748b";
    ctx.font = "24px Segoe UI";
    wrapText(ctx, "Gracias por mantener tus pagos al día.", 120, showBalanceStrip ? 1220 : 1110, 820, 32);
  }

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la imagen del aviso"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function isCobroPagadoCompleto(row, state) {
  const estado = String(row?.estado_pago || "").toUpperCase();
  if (estado === "PAGADO") return true;
  if (estado === "PENDIENTE" || estado === "PARCIAL" || estado === "ANULADO") return false;
  return getSaldoTotalPendiente(row, state) <= 0.009;
}

function drawSectionTitle(ctx, text, x, y) {
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 30px Segoe UI";
  ctx.fillText(text, x, y);
}

function drawMiniMetric(ctx, label, value, x, y) {
  ctx.fillStyle = "#64748b";
  ctx.font = "22px Segoe UI";
  ctx.fillText(label, x, y);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 30px Segoe UI";
  ctx.fillText(value, x, y + 38);
}

function drawLine(ctx, label, value, y) {
  ctx.fillStyle = "#475569";
  ctx.font = "26px Segoe UI";
  ctx.fillText(label, 120, y);
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 28px Segoe UI";
  ctx.fillText(value, 760, y);
  return y + 48;
}

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function drawQrFallback(ctx, x, y, width, height) {
  roundRect(ctx, x, y, width, height, 18, "#e2e8f0");
  ctx.fillStyle = "#64748b";
  ctx.font = "24px Segoe UI";
  ctx.fillText("QR", x + 38, y + 70);
  ctx.fillText("pendiente", x + 12, y + 102);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || "").split(" ");
  let line = "";
  let posY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, posY);
      line = word;
      posY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, posY);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar el QR"));
    img.src = src;
  });
}

function formatMoneyText(value) {
  return `S/ ${number(value ?? 0, 2)}`;
}

function formatInputNumber(value) {
  return Number(value ?? 0).toFixed(2);
}

function capitalize(text) {
  const value = String(text || "");
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
