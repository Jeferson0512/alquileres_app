import { STATE } from "./state.js";
import { API } from "./api.js";
import { money, number, toast } from "./utils.js";
import { renderDashboard } from "./modules/dashboard.js";
import { renderRecibo } from "./modules/recibo.js";
import { renderLecturas } from "./modules/lecturas.js";
import { renderLiquidacion } from "./modules/liquidacion.js";
import { renderCobros } from "./modules/cobros.js";
import { renderPeriodos } from "./modules/periodos.js";
import { renderInquilinos } from "./modules/inquilinos.js";
import { renderUnidades } from "./modules/unidades.js";
import { renderOcupaciones } from "./modules/ocupaciones.js";
import { renderTarifas } from "./modules/tarifas.js";
import { renderAvisos, openAvisosConfigModal } from "./modules/avisos.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function groupPagosForForceRefresh(pagos) {
  const groups = new Map();
  pagos.forEach((pago) => {
    const key = Number(pago.id_cobro);
    if (!groups.has(key)) {
      groups.set(key, {
        id_cobro: key,
        codigo_unidad: pago.codigo_unidad || "-",
        inquilino: pago.inquilino || "-",
        items: [],
      });
    }
    groups.get(key).items.push(pago);
  });
  return Array.from(groups.values()).sort((a, b) => String(a.codigo_unidad).localeCompare(String(b.codigo_unidad), "es"));
}

function renderForceRefreshCobrosHtml(groups, totalPagos) {
  return `
    <div class="force-refresh-modal">
      <div class="info-callout force-refresh-callout danger">
        <strong>Operación avanzada y riesgosa.</strong><br>
        El sistema recalculará los montos del periodo, revertirá temporalmente todos los pagos registrados y volverá a registrar solo los pagos que NO marques para descarte.<br>
        Si cambió la estructura de unidades o conceptos, el sistema bloqueará la operación para no malograr historial.
      </div>

      <div class="force-refresh-summary" id="forceRefreshSummary">
        Se conservarán <strong>${totalPagos}</strong> pagos. Marcados para descarte: <strong>0</strong>.
      </div>

      <div class="force-refresh-list">
        ${groups.map((group) => `
          <section class="force-refresh-group">
            <div class="force-refresh-group-head">
              <div>
                <strong>${escapeHtml(group.codigo_unidad)}</strong>
                <div class="force-refresh-sub">${escapeHtml(group.inquilino)}</div>
              </div>
              <label class="force-refresh-toggle-all">
                <input type="checkbox" class="js-force-group" data-cobro="${group.id_cobro}" />
                Descartar todos sus pagos
              </label>
            </div>
            <div class="force-refresh-payments">
              ${group.items.map((pago) => `
                <label class="force-refresh-payment-row">
                  <input type="checkbox" class="js-force-pago" data-id="${pago.id_pago}" data-cobro="${group.id_cobro}" />
                  <div class="force-refresh-payment-main">
                    <div><strong>${money(pago.monto_pagado)}</strong> · ${escapeHtml(pago.fecha_pago || "-")}</div>
                    <div class="force-refresh-sub">${escapeHtml(pago.metodo_pago || "-")} · Op: ${escapeHtml(pago.numero_operacion || "-")}</div>
                  </div>
                </label>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </div>
  `;
}

function bindForceRefreshCobrosModal(totalPagos) {
  const checks = Array.from(document.querySelectorAll(".js-force-pago"));
  const groupChecks = Array.from(document.querySelectorAll(".js-force-group"));
  const $summary = document.getElementById("forceRefreshSummary");

  const updateSummary = () => {
    const descartados = checks.filter((check) => check.checked).length;
    const conservados = totalPagos - descartados;
    if ($summary) {
      $summary.innerHTML = `Se conservarán <strong>${conservados}</strong> pagos. Marcados para descarte: <strong>${descartados}</strong>.`;
    }
    groupChecks.forEach((groupCheck) => {
      const idCobro = Number(groupCheck.dataset.cobro);
      const related = checks.filter((check) => Number(check.dataset.cobro) === idCobro);
      groupCheck.checked = related.length > 0 && related.every((check) => check.checked);
    });
  };

  groupChecks.forEach((groupCheck) => {
    groupCheck.addEventListener("change", () => {
      const idCobro = Number(groupCheck.dataset.cobro);
      checks.forEach((check) => {
        if (Number(check.dataset.cobro) === idCobro) {
          check.checked = groupCheck.checked;
        }
      });
      updateSummary();
    });
  });

  checks.forEach((check) => check.addEventListener("change", updateSummary));
  updateSummary();
}

function getForceRefreshDiscardIds() {
  return Array.from(document.querySelectorAll(".js-force-pago:checked")).map((check) => Number(check.dataset.id)).filter((id) => id > 0);
}

async function openForceRefreshCobrosModal() {
  const pid = STATE.periodoId;
  const pagos = await API.listPagos({ id_periodo: pid });
  const historialPagos = Array.isArray(pagos.data) ? pagos.data : [];
  const pagosRegistrados = historialPagos.filter((row) => String(row.estado || "REGISTRADO").toUpperCase() === "REGISTRADO");

  if (historialPagos.length === 0) {
    toast("Este periodo no tiene pagos registrados. Usa la actualización normal.", "info");
    return;
  }

  if (pagosRegistrados.length === 0) {
    openModal(
      "Actualización forzada de cobros",
      `
        <div class="force-refresh-modal">
          <div class="info-callout force-refresh-callout danger">
            <strong>Este periodo tiene historial de pagos, pero todos están reversados.</strong><br>
            La generación normal sigue bloqueada para no romper la trazabilidad del periodo.<br>
            Si continúas, el sistema limpiará ese historial reversado y reconstruirá los cobros con la estructura actual del periodo.
          </div>
        </div>
      `,
      async () => {
        const ok = await confirmModal(
          "Se limpiará el historial reversado de este periodo y se reconstruirán los cobros actuales. ¿Deseas continuar?",
          { label: "Ejecutar actualización protegida", destructive: true }
        );
        if (!ok) return;

        try {
          const res = await API.forceRefreshCobros(pid, { descartar_pago_ids: [] });
          const [dash, cobros, prev] = await Promise.all([
            API.getDashboard(pid),
            API.getCobros(pid),
            API.previewLiquidacion(pid).catch(() => null),
          ]);
          const data = res.data || {};

          STATE.dashboard = dash.data;
          STATE.cobros = cobros.data;
          STATE.previewLiquidacion = prev;
          STATE.liquidacionAjustes = {};
          STATE.cobrosDesincronizados = false;
          STATE.pagosPeriodoRegistrados = historialPagos.length;
          closeModal();
          renderStats();
          render();
          toast(`Actualización protegida completada. Se reconstruyeron los cobros del periodo con la estructura actual.`, "success", 7000);
        } catch (error) {
          toast(error.message || "No se pudo ejecutar la actualización protegida", "error", 7000);
        }
      }
    );

    const $save = document.getElementById("modalSave");
    if ($save) {
      $save.textContent = "Ejecutar actualización protegida";
      $save.className = "btn btn-danger";
    }
    return;
  }

  const groups = groupPagosForForceRefresh(pagosRegistrados);
  openModal(
    "Actualización forzada de cobros",
    renderForceRefreshCobrosHtml(groups, pagosRegistrados.length),
    async () => {
      const descartarPagoIds = getForceRefreshDiscardIds();
      const ok = await confirmModal(
        `Se recalcularán los cobros del periodo. ${descartarPagoIds.length} pagos marcados no se volverán a registrar y ${pagosRegistrados.length - descartarPagoIds.length} se intentarán conservar. ¿Deseas continuar?`,
        { label: "Ejecutar actualización forzada", destructive: true }
      );
      if (!ok) return;

      try {
        const res = await API.forceRefreshCobros(pid, { descartar_pago_ids: descartarPagoIds });
        const [dash, cobros, prev] = await Promise.all([
          API.getDashboard(pid),
          API.getCobros(pid),
          API.previewLiquidacion(pid).catch(() => null),
        ]);
        const data = res.data || {};

        STATE.dashboard = dash.data;
        STATE.cobros = cobros.data;
        STATE.previewLiquidacion = prev;
        STATE.liquidacionAjustes = {};
        STATE.cobrosDesincronizados = false;
        STATE.pagosPeriodoRegistrados = Math.max(historialPagos.length, Number(data.pagos_reversados || 0));
        closeModal();
        renderStats();
        render();

        toast(
          `Actualización forzada completada. Revertidos: ${data.pagos_reversados || 0}. Conservados: ${data.pagos_reaplicados || 0}. Descartados: ${data.pagos_descartados || 0}.`,
          "success",
          7000
        );
      } catch (error) {
        toast(error.message || "No se pudo ejecutar la actualización forzada", "error", 7000);
      }
    }
  );

  const $save = document.getElementById("modalSave");
  if ($save) {
    $save.textContent = "Ejecutar actualización forzada";
    $save.className = "btn btn-danger";
  }

  bindForceRefreshCobrosModal(pagosRegistrados.length);
}

/* ── íconos SVG (string) ──────────────────────────────── */
const ICONS = {
  dashboard: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  inquilinos: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4"/><path d="M2 21c0-4 3.134-7 7-7h4c3.866 0 7 3 7 7"/><circle cx="19" cy="11" r="2"/><path d="M21 17h2"/></svg>`,
  unidades: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9.5 12 3l9 6.5V21H15v-6H9v6H3z"/></svg>`,
  recibo: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 10h8M8 14h5"/></svg>`,
  lecturas: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
  liquidacion: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  cobros: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  ocupaciones: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  tarifas: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>`,
  avisos: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>`,
  periodos: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

const MENU_ITEMS = [
  ["dashboard",   "Dashboard"],
  ["periodos",    "Periodos"],
  ["inquilinos",  "Inquilinos"],
  ["unidades",    "Unidades"],
  ["ocupaciones", "Ocupaciones"],
  ["recibo",      "Recibo de luz"],
  ["lecturas",    "Lecturas"],
  ["liquidacion", "Liquidación"],
  ["cobros",      "Cobros"],
  ["avisos",      "Avisos"],
  ["tarifas",     "Tarifas"],
];

/* secciones que tienen botón "Nuevo registro" */
const CRUD_SECTIONS = new Set(["periodos", "inquilinos", "unidades", "ocupaciones"]);

/* ── Confirm dialog ──────────────────────────────────── */
const $confirmOverlay = document.getElementById("confirmOverlay");
const $confirmMsg     = document.getElementById("confirmMsg");
const $confirmYes     = document.getElementById("confirmYes");
const $confirmNo      = document.getElementById("confirmNo");
let _confirmResolve   = null;

export function confirmModal(msg, { label = "Confirmar", destructive = true } = {}) {
  return new Promise(resolve => {
    _confirmResolve     = resolve;
    $confirmMsg.textContent = msg;
    $confirmYes.textContent = label;
    $confirmYes.className   = `btn ${destructive ? "btn-danger" : "btn-primary"}`;
    $confirmOverlay.classList.remove("hidden");
  });
}

$confirmNo.addEventListener("click", () => {
  $confirmOverlay.classList.add("hidden");
  _confirmResolve?.(false);
  _confirmResolve = null;
});

$confirmYes.addEventListener("click", () => {
  $confirmOverlay.classList.add("hidden");
  _confirmResolve?.(true);
  _confirmResolve = null;
});

/* ── Referencias DOM ──────────────────────────────────── */
const $menu            = document.getElementById("menu");
const $stats           = document.getElementById("stats");
const $view            = document.getElementById("view");
const $topbarOps       = document.getElementById("topbarOps");
const $sidebarPeriod   = document.getElementById("sidebarPeriod");
const $globalSearch    = document.getElementById("globalSearch");
const $btnNuevo        = document.getElementById("btnNuevoRegistro");
const $modalOverlay    = document.getElementById("modalOverlay");
const $modalTitle      = document.getElementById("modalTitle");
const $modalBody       = document.getElementById("modalBody");
const $modalSave       = document.getElementById("modalSave");
const $modalCancel     = document.getElementById("modalCancel");
const $modalClose      = document.getElementById("modalClose");

/* ── Modal global ─────────────────────────────────────── */
let _modalSubmit = null;

export function openModal(title, bodyHTML, onSave) {
  $modalTitle.textContent = title;
  $modalBody.innerHTML    = bodyHTML;
  $modalSave.textContent  = "Guardar";
  $modalCancel.textContent = "Cancelar";
  _modalSubmit            = onSave;
  $modalOverlay.classList.remove("hidden");
}

export function closeModal() {
  $modalOverlay.classList.add("hidden");
  $modalBody.innerHTML = "";
  _modalSubmit = null;
}

[$modalCancel, $modalClose].forEach(b => b.addEventListener("click", closeModal));
$modalOverlay.addEventListener("click", e => { if (e.target === $modalOverlay) closeModal(); });
$modalSave.addEventListener("click", () => { if (_modalSubmit) _modalSubmit(); });

/* ── Menú ─────────────────────────────────────────────── */
function renderMenu() {
  $menu.innerHTML = MENU_ITEMS.map(([key, label]) => `
    <button class="menu-item ${STATE.section === key ? "active" : ""}" data-section="${key}">
      ${ICONS[key] ?? ""}
      ${label}
    </button>
  `).join("");

  $menu.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", async () => {
      STATE.section = btn.dataset.section;
      await ensureSectionData();
      render();
    });
  });
}

/* ── Stats ────────────────────────────────────────────── */
function renderStats() {
  const totalOcupados = number(STATE.dashboard?.total_ocupados, 0);
  $stats.innerHTML = `
    <article class="card">
      <div class="card-body">
        <div class="card-body-text">
          <p class="card-title">Total alquiler mensual</p>
          <p class="card-value">${money(STATE.dashboard?.total_alquiler)}</p>
          <p class="card-desc">Suma de las ${totalOcupados} unidades ocupadas</p>
        </div>
        <div class="card-icon green">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9.5 12 3l9 6.5V21H15v-6H9v6H3z"/></svg>
        </div>
      </div>
    </article>
    <article class="card">
      <div class="card-body">
        <div class="card-body-text">
          <p class="card-title">Luz distribuida</p>
          <p class="card-value">${money(STATE.dashboard?.total_luz)}</p>
          <p class="card-desc">Resultado de la liquidación del recibo</p>
        </div>
        <div class="card-icon blue">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>
        </div>
      </div>
    </article>
    <article class="card">
      <div class="card-body">
        <div class="card-body-text">
          <p class="card-title">Consumo liquidado</p>
          <p class="card-value">${number(STATE.previewLiquidacion?.meta?.total_consumo ?? 0)} kWh</p>
          <p class="card-desc">Suma de consumos de unidades ocupadas</p>
        </div>
        <div class="card-icon orange">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>
    </article>
    <article class="card">
      <div class="card-body">
        <div class="card-body-text">
          <p class="card-title">Cobro teórico del mes</p>
          <p class="card-value">${money(STATE.dashboard?.total_cobrar)}</p>
          <p class="card-desc">Alquiler + agua fija + luz</p>
        </div>
        <div class="card-icon purple">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        </div>
      </div>
    </article>
  `;
}

/* ── Helper: ¿estamos en el periodo más reciente? ────── */
function isCurrentPeriod() {
  return !STATE.periodos.length || STATE.periodoId === STATE.periodos[0].id_periodo;
}

/* ── Nombre legible de un periodo ─────────────────────── */
function periodoLabel(p) {
  const d = new Date(p.anio, p.mes - 1, 1);
  const label = d.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* ── Periodo sidebar ──────────────────────────────────── */
function renderSidebarPeriod() {
  if (!STATE.periodos.length) { $sidebarPeriod.innerHTML = ""; return; }

  const isHistoric = !isCurrentPeriod();
  const r = STATE.recibo;

  const options = STATE.periodos.map(p => `
    <option value="${p.id_periodo}" ${p.id_periodo === STATE.periodoId ? "selected" : ""}>
      ${periodoLabel(p)}
    </option>
  `).join("");

  $sidebarPeriod.innerHTML = `
    <p class="sp-label">Periodo activo</p>
    <select class="sp-select" id="periodoSelect">${options}</select>
    ${r?.fecha_vencimiento ? `<p class="sp-due">Vence ${r.fecha_vencimiento}</p>` : ""}
    ${isHistoric ? `
      <div class="sp-historic">
        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        Periodo histórico
      </div>
    ` : ""}
  `;

  document.getElementById("periodoSelect")?.addEventListener("change", async (e) => {
    STATE.periodoId = parseInt(e.target.value);
    STATE.cobros = [];
    STATE.pagosPeriodoRegistrados = 0;
    STATE.previewLiquidacion = null;
    STATE.liquidacionAjustes = {};
    STATE.cobrosDesincronizados = false;
    try {
      await reloadPeriodData();
      await ensureSectionData();
      render();
    } catch (err) { toast(err.message, 'error'); }
  });
}

/* ── Topbar contextual ────────────────────────────────── */
function renderTopbarOps() {
  $btnNuevo.style.display = CRUD_SECTIONS.has(STATE.section) ? "inline-flex" : "none";

  const historic = !isCurrentPeriod();
  let html = "";

  /* Banner modo histórico (solo en secciones de datos) */
  if (historic && !CRUD_SECTIONS.has(STATE.section)) {
    html += `
      <div class="historic-banner">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        Visualizando periodo histórico &mdash; solo lectura
      </div>
    `;
  }

  if (STATE.section === "liquidacion" || STATE.section === "cobros" || STATE.section === "avisos" || STATE.section === "lecturas") {
    html += `<div class="topbar-ops">`;
    if (STATE.section === "lecturas" && !historic) {
      html += `<button id="btnSyncLecturas" class="btn btn-light">Actualizar lecturas por ocupaciones</button>`;
    }
    if (STATE.section === "liquidacion" && !historic) {
      html += `
        <button id="btnPreviewLiquidacion" class="btn btn-light">Previsualizar liquidación</button>
        <button id="btnGenerarLiquidacion" class="btn btn-dark">Generar liquidación</button>
      `;
    }
    if ((STATE.section === "cobros" || STATE.section === "avisos") && !historic) {
      const hasCobros = Array.isArray(STATE.cobros) && STATE.cobros.length > 0;
      const hasPagosRegistrados = Number(STATE.pagosPeriodoRegistrados || 0) > 0;
      if (STATE.section === "avisos") {
        html += `<button id="btnConfigCobranza" class="btn btn-light">Configurar cobranza</button>`;
      }
      if (STATE.section === "cobros") {
        html += `<button id="btnActualizarCobrosDesdeLiquidacion" class="btn btn-light">Actualizar desde liquidación actual</button>`;
      }
      if (hasCobros) {
        html += `<button id="btnActualizarCobros" class="btn btn-light">Actualizar cobros desde luz</button>`;
        if (hasPagosRegistrados) {
          html += `<button id="btnForzarActualizarCobros" class="btn btn-danger">Forzar actualización con pagos</button>`;
        }
      } else {
        html += `<button id="btnGenerarCobros" class="btn btn-primary">Generar cobros</button>`;
      }
    }
    html += `</div>`;
  }

  $topbarOps.innerHTML = html;
  if (!historic) bindTopbarOpsEvents();
}

function bindTopbarOpsEvents() {
  document.getElementById("btnConfigCobranza")?.addEventListener("click", () => {
    openAvisosConfigModal(STATE);
  });

  document.getElementById("btnSyncLecturas")?.addEventListener("click", async () => {
    try {
      const pid = STATE.periodoId;
      const res = await API.syncLecturas(pid);
      const lecturas = await API.getLecturas(pid);
      STATE.lecturas = lecturas.data;
      render();
      const { insertados = 0, actualizados = 0 } = res.data || {};
      toast(`Lecturas actualizadas: ${actualizados} sincronizadas, ${insertados} nuevas.`);
    } catch (e) { toast(e.message, 'error'); }
  });

  document.getElementById("btnPreviewLiquidacion")?.addEventListener("click", async () => {
    try {
      STATE.section = "liquidacion";
      STATE.previewLiquidacion = await API.previewLiquidacion(STATE.periodoId);
      render();
      toast("Previsualización actualizada con la última lógica de reparto", "info");
    } catch (e) { toast(e.message, 'error'); }
  });

  document.getElementById("btnGenerarLiquidacion")?.addEventListener("click", async () => {
    try {
      const pid = STATE.periodoId;
      const ajustesPayload = Object.entries(STATE.liquidacionAjustes || {})
        .map(([idUnidad, ajuste]) => ({
          id_unidad: Number(idUnidad),
          ajuste: Number(ajuste || 0),
        }))
        .filter((item) => item.id_unidad > 0 && Number.isFinite(item.ajuste));

      await API.generateLiquidacion(pid, { ajustes: ajustesPayload });
      const [dash, prev] = await Promise.all([API.getDashboard(pid), API.previewLiquidacion(pid)]);
      STATE.dashboard = dash.data;
      STATE.previewLiquidacion = prev;
      STATE.cobrosDesincronizados = true;
      renderStats();
      toast("Liquidación generada correctamente");
    } catch (e) { toast(e.message, 'error'); }
  });

  document.getElementById("btnGenerarCobros")?.addEventListener("click", async () => {
    try {
      const pid = STATE.periodoId;
      const ajustes = await getLiquidacionAjustesPayload();
      if (ajustes.length > 0) {
        await API.generateLiquidacion(pid, { ajustes });
      }
      await API.generateCobros(pid);
      const [dash, cobros, prev] = await Promise.all([
        API.getDashboard(pid),
        API.getCobros(pid),
        API.previewLiquidacion(pid).catch(() => null),
      ]);
      STATE.dashboard = dash.data;
      STATE.cobros = cobros.data;
      STATE.previewLiquidacion = prev;
      STATE.pagosPeriodoRegistrados = 0;
      STATE.cobrosDesincronizados = false;
      renderStats();
      render();
      toast("Cobros generados correctamente");
    } catch (e) {
      const pid = STATE.periodoId;
      const message = String(e?.message || "");
      if (message.includes("No se pueden regenerar los cobros de este periodo porque ya tiene pagos registrados")) {
        try {
          const [cobros, pagos] = await Promise.all([
            API.getCobros(pid).catch(() => ({ data: [] })),
            API.listPagos({ id_periodo: pid }).catch(() => ({ data: [] })),
          ]);
          const historialPagos = Array.isArray(pagos.data) ? pagos.data : [];

          STATE.cobros = Array.isArray(cobros.data) ? cobros.data : [];
          STATE.pagosPeriodoRegistrados = historialPagos.length;
          renderTopbarOps();

          if (STATE.cobros.length > 0 && historialPagos.length > 0) {
            toast("Este periodo ya tenía cobros y pagos registrados. La pantalla se actualizó para mostrar el botón rojo de actualización forzada arriba.", "warning", 9000);
          } else if (historialPagos.length > 0) {
            toast("La base tiene pagos registrados para este periodo, pero no se encontraron cobros visibles para recrearlos. Hay una inconsistencia y este caso requiere revisión manual.", "error", 10000);
          } else {
            toast(message || "No se pudieron generar los cobros", "error");
          }
          return;
        } catch (_) {
          toast(message || "No se pudieron generar los cobros", "error", 9000);
          return;
        }
      }

      toast(message || "No se pudieron generar los cobros", 'error');
    }
  });

  document.getElementById("btnActualizarCobros")?.addEventListener("click", async () => {
    try {
      const pid = STATE.periodoId;
      const pagos = await API.listPagos({ id_periodo: pid });
      const historialPagos = Array.isArray(pagos.data) ? pagos.data : [];
      STATE.pagosPeriodoRegistrados = historialPagos.length;
      if (historialPagos.length > 0) {
        renderTopbarOps();
        toast("Este periodo ya tiene pagos registrados. Usa el botón rojo de actualización forzada que aparece arriba en esta pantalla.", "warning", 8000);
        return;
      }

      const ok = await confirmModal(
        "Se recalculará la liquidación de luz y luego se regenerarán los cobros del periodo. ¿Deseas continuar?",
        { label: "Actualizar cobros", destructive: false }
      );
      if (!ok) return;

      const ajustes = await getLiquidacionAjustesPayload();
      await API.generateLiquidacion(pid, { ajustes });
      await API.generateCobros(pid);

      const [dash, cobros, prev] = await Promise.all([
        API.getDashboard(pid),
        API.getCobros(pid),
        API.previewLiquidacion(pid).catch(() => null),
      ]);

      STATE.dashboard = dash.data;
      STATE.cobros = cobros.data;
      STATE.previewLiquidacion = prev;
      STATE.pagosPeriodoRegistrados = 0;
      STATE.cobrosDesincronizados = false;
      renderStats();
      render();
      toast("Cobros actualizados con la última data de luz", "success");
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  document.getElementById("btnActualizarCobrosDesdeLiquidacion")?.addEventListener("click", async () => {
    try {
      const pid = STATE.periodoId;
      const ajustes = await getLiquidacionAjustesPayload();
      if (!STATE.previewLiquidacion || !STATE.previewLiquidacion.data) {
        toast("No hay liquidación previa disponible para aplicar", "warning");
        return;
      }

      const ok = await confirmModal(
        "Se regenerarán los cobros usando la liquidación actual y los ajustes manuales que hayas ingresado. ¿Deseas continuar?",
        { label: "Actualizar desde liquidación", destructive: false }
      );
      if (!ok) return;

      const pagos = await API.listPagos({ id_periodo: pid });
      const historialPagos = Array.isArray(pagos.data) ? pagos.data : [];
      if (historialPagos.length > 0) {
        renderTopbarOps();
        toast("Este periodo ya tiene pagos registrados. Usa el botón rojo de actualización forzada que aparece arriba en esta pantalla.", "warning", 8000);
        return;
      }

      await API.generateLiquidacion(pid, { ajustes });
      await API.generateCobros(pid);

      const [dash, cobros, prev] = await Promise.all([
        API.getDashboard(pid),
        API.getCobros(pid),
        API.previewLiquidacion(pid).catch(() => null),
      ]);

      STATE.dashboard = dash.data;
      STATE.cobros = cobros.data;
      STATE.previewLiquidacion = prev;
      STATE.pagosPeriodoRegistrados = 0;
      STATE.cobrosDesincronizados = false;
      renderStats();
      render();
      toast("Cobros actualizados con la liquidación actual", "success");
    } catch (e) {
      toast(e.message, 'error');
    }
  });

  document.getElementById("btnForzarActualizarCobros")?.addEventListener("click", async () => {
    try {
      await openForceRefreshCobrosModal();
    } catch (e) {
      toast(e.message, "error", 7000);
    }
  });
}

/* ── Botón "Nuevo registro" ───────────────────────────── */
$btnNuevo.addEventListener("click", () => {
  if (STATE.section === "periodos") window._periodoNuevo?.();
  if (STATE.section === "inquilinos") window._inquilinoNuevo?.();
  if (STATE.section === "unidades")  window._unidadNueva?.();
  if (STATE.section === "ocupaciones") window._ocupacionNueva?.();
});

/* ── Búsqueda global ──────────────────────────────────── */
let _searchTimer = null;
$globalSearch.addEventListener("input", () => {
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    if (STATE.section === "inquilinos") window._inquilinoSearch?.($globalSearch.value);
    if (STATE.section === "unidades")  window._unidadSearch?.($globalSearch.value);
    if (STATE.section === "ocupaciones") window._ocupacionSearch?.($globalSearch.value);
  }, 260);
});

/* ── Render principal ─────────────────────────────────── */
function render() {
  renderMenu();
  renderStats();
  renderSidebarPeriod();
  renderTopbarOps();

  /* limpiar buscador al cambiar de sección */
  if (!CRUD_SECTIONS.has(STATE.section)) $globalSearch.value = "";

  switch (STATE.section) {
    default:
      STATE.section = "dashboard";
      // fall through
    case "dashboard":
      renderDashboard($view, STATE);
      break;
    case "inquilinos":
      renderInquilinos($view, STATE);
      break;
    case "unidades":
      renderUnidades($view, STATE);
      break;
    case "ocupaciones":
      renderOcupaciones($view, STATE);
      break;
    case "recibo":
      renderRecibo($view, STATE, handleSaveRecibo, isCurrentPeriod(), handleCopyReciboAnterior);
      break;
    case "lecturas":
      renderLecturas($view, STATE, handleSaveLecturas, isCurrentPeriod());
      break;
    case "periodos":
      renderPeriodos($view, STATE);
      break;
    case "liquidacion":
      renderLiquidacion($view, STATE);
      break;
    case "cobros":
      renderCobros($view, STATE);
      break;
    case "avisos":
      renderAvisos($view, STATE);
      break;
    case "tarifas":
      renderTarifas($view);
      break;
  }
}

/* ── Carga de datos ───────────────────────────────────── */
/* ── Recarga todos los datos dependientes del periodo ─── */
async function reloadPeriodData() {
  const periodoId = STATE.periodoId;
  const [dashboard, recibo, lecturas, preview] = await Promise.all([
    API.getDashboard(periodoId),
    API.getRecibo(periodoId),
    API.getLecturas(periodoId),
    API.previewLiquidacion(periodoId).catch(() => null),
  ]);

  STATE.dashboard          = dashboard.data;
  STATE.recibo             = recibo.data;
  STATE.lecturas           = lecturas.data;
  STATE.previewLiquidacion = preview;
}

async function loadBase() {
  const periodos = await API.listPeriodos();
  STATE.periodos  = periodos.data;
  STATE.periodoId = periodos.data[0]?.id_periodo ?? null;

  await reloadPeriodData();
}

async function ensureSectionData() {
  const periodoId = STATE.periodoId;
  if (STATE.section === "liquidacion") {
    STATE.previewLiquidacion = await API.previewLiquidacion(periodoId).catch(() => null);
  }
  if (STATE.section === "cobros" || STATE.section === "avisos") {
    const [cobros, pagos] = await Promise.all([
      API.getCobros(periodoId),
      API.listPagos({ id_periodo: periodoId }).catch(() => ({ data: [] })),
    ]);
    STATE.cobros = cobros.data;
    STATE.pagosPeriodoRegistrados = Array.isArray(pagos.data) ? pagos.data.length : 0;
  }
  if (STATE.section === "avisos") {
    const config = await API.getConfigCobranza();
    STATE.configCobranza = config.data;
  }
  if (STATE.section === "inquilinos") {
    const inq = await API.listInquilinos();
    STATE.inquilinos = inq.data;
  }
  if (STATE.section === "unidades") {
    const uni = await API.listUnidades();
    STATE.unidades = uni.data;
  }
  if (STATE.section === "ocupaciones") {
    const ocu = await API.listOcupaciones("ACTIVO");
    STATE.ocupaciones = ocu.data;
  }
}

/* ── Lecturas ─────────────────────────────────────────── */
async function handleSaveLecturas(items) {
  try {
    await API.saveLecturas(items, STATE.periodoId);
    toast("Lecturas guardadas correctamente");
    const lecturas = await API.getLecturas(STATE.periodoId);
    STATE.lecturas = lecturas.data;
    render();
  } catch (e) { toast(e.message, 'error'); }
}

/* ── Recibo ───────────────────────────────────────────── */
async function handleSaveRecibo(payload) {
  try {
    await API.saveRecibo(payload, STATE.periodoId);
    const recibo = await API.getRecibo(STATE.periodoId);
    STATE.recibo = recibo.data;
    render();
    toast("Recibo guardado correctamente");
  } catch (e) { toast(e.message, 'error'); }
}

async function getLiquidacionAjustesPayload() {
  const ajustes = STATE.liquidacionAjustes || {};
  return Object.entries(ajustes)
    .filter(([idUnidad, ajuste]) => Number(idUnidad) > 0 && Number.isFinite(Number(ajuste)))
    .map(([idUnidad, ajuste]) => ({ id_unidad: Number(idUnidad), ajuste: Number(ajuste) }));
}

async function handleCopyReciboAnterior() {
  try {
    const idx = STATE.periodos.findIndex(p => p.id_periodo === STATE.periodoId);
    const anterior = idx >= 0 ? STATE.periodos[idx + 1] : null;

    if (!anterior) {
      toast("No existe un periodo anterior para copiar", 'warning');
      return;
    }

    const resp = await API.getRecibo(anterior.id_periodo);
    const r = resp.data;
    if (!r || !r.id_recibo_luz) {
      toast("El periodo anterior no tiene recibo registrado", 'warning');
      return;
    }

    await API.saveRecibo({
      id_inmueble: r.id_inmueble,
      numero_suministro: r.numero_suministro,
      fecha_emision: r.fecha_emision,
      fecha_vencimiento: r.fecha_vencimiento,
      lectura_anterior_general: parseFloat(r.lectura_anterior_general) || 0,
      lectura_actual_general: parseFloat(r.lectura_actual_general) || 0,
      precio_kwh: parseFloat(r.precio_kwh) || 0,
      consumo_energia: parseFloat(r.consumo_energia) || 0,
      cargo_fijo: parseFloat(r.cargo_fijo) || 0,
      mant_reposicion: parseFloat(r.mant_reposicion) || 0,
      alumbrado_publico: parseFloat(r.alumbrado_publico) || 0,
      subtotal: parseFloat(r.subtotal) || 0,
      igv: parseFloat(r.igv) || 0,
      electrificacion_rural: parseFloat(r.electrificacion_rural) || 0,
      ajuste_redondeo_anterior: parseFloat(r.ajuste_redondeo_anterior) || 0,
      ajuste_redondeo_actual: parseFloat(r.ajuste_redondeo_actual) || 0,
      total_recibo: parseFloat(r.total_recibo) || 0,
      observacion: r.observacion,
      estado: "ACTIVO",
    }, STATE.periodoId);

    const recibo = await API.getRecibo(STATE.periodoId);
    STATE.recibo = recibo.data;
    render();
    toast("Recibo copiado desde el periodo anterior");
  } catch (e) { toast(e.message, 'error'); }
}

async function handleCreatePeriodo(payload) {
  try {
    const res = await API.createPeriodo(payload);
    const periodos = await API.listPeriodos();
    STATE.periodos = periodos.data;
    STATE.periodoId = Number(res.data?.id_periodo || STATE.periodoId || STATE.periodos[0]?.id_periodo || null);
    await reloadPeriodData();
    await ensureSectionData();
    render();
    toast("Periodo creado correctamente", "success");
    return res.data;
  } catch (e) {
    toast(e.message, "error");
    throw e;
  }
}

async function handleUpdatePeriodo(id, payload) {
  try {
    await API.updatePeriodo(id, payload);
    const periodos = await API.listPeriodos();
    STATE.periodos = periodos.data;
    await render();
    toast("Periodo actualizado correctamente", "success");
  } catch (e) {
    toast(e.message, "error");
    throw e;
  }
}

function openPeriodoModal() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const firstDay = `${year}-${month}-01`;
  const lastDayDate = new Date(year, today.getMonth() + 1, 0);
  const lastDay = `${year}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(lastDayDate.getDate()).padStart(2, "0")}`;

  openModal(
    "Crear periodo",
    `
      <div class="form-grid">
        <div class="form-group">
          <label>Año</label>
          <input id="periodoAnio" type="number" min="2000" step="1" value="${year}" />
        </div>
        <div class="form-group">
          <label>Mes</label>
          <select id="periodoMes">
            ${Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              return `<option value="${m}" ${m === today.getMonth() + 1 ? "selected" : ""}>${String(m).padStart(2, "0")}</option>`;
            }).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Fecha inicio</label>
          <input id="periodoInicio" type="date" value="${firstDay}" />
        </div>
        <div class="form-group">
          <label>Fecha fin</label>
          <input id="periodoFin" type="date" value="${lastDay}" />
        </div>
        <div class="form-group">
          <label>Estado</label>
          <select id="periodoEstado">
            <option value="ABIERTO" selected>ABIERTO</option>
            <option value="CERRADO">CERRADO</option>
          </select>
        </div>
        <div class="form-group full">
          <label>Observación</label>
          <input id="periodoObservacion" type="text" placeholder="Opcional" />
        </div>
      </div>
    `,
    async () => {
      const anio = Number(document.getElementById("periodoAnio")?.value || 0);
      const mes = Number(document.getElementById("periodoMes")?.value || 0);
      const fechaInicio = document.getElementById("periodoInicio")?.value || "";
      const fechaFin = document.getElementById("periodoFin")?.value || "";
      const estado = document.getElementById("periodoEstado")?.value || "ABIERTO";
      const observacion = document.getElementById("periodoObservacion")?.value || null;

      if (anio < 2000 || mes < 1 || mes > 12) {
        toast("Seleccione un año y mes válidos", "error");
        return;
      }
      if (!fechaInicio || !fechaFin) {
        toast("Debe indicar fecha de inicio y fin", "error");
        return;
      }
      if (fechaInicio > fechaFin) {
        toast("La fecha de inicio no puede ser mayor a la fecha de fin", "error");
        return;
      }

      await handleCreatePeriodo({
        anio,
        mes,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado,
        observacion,
      });
      closeModal();
    }
  );
}

window._periodoNuevo = openPeriodoModal;
window._periodoToggleState = async (id, estado) => {
  const ok = await confirmModal(`¿Deseas cambiar el estado del periodo #${id} a ${estado}?`, { label: `Cambiar a ${estado}`, destructive: false });
  if (!ok) return;

  try {
    await handleUpdatePeriodo(id, { estado });
    await reloadPeriodData();
    await ensureSectionData();
    render();
  } catch (e) {
    // ya maneja toast internamente
  }
};

/* ── Bootstrap ────────────────────────────────────────── */
async function bootstrap() {
  try {
    await loadBase();
    render();
  } catch (e) {
    $view.innerHTML = `<section class="panel"><div class="panel-head"><h3>Error</h3><p>${e.message}</p></div></section>`;
  }
}

bootstrap();