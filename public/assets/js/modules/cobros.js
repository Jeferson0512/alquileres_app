import { API } from "../api.js";
import { money, toast } from "../utils.js";
import { openModal, closeModal, confirmModal } from "../app.js";

let _view = null;
let _state = null;
let _expandedCobroId = null;
const _detalleCache = new Map();
const _detalleLoading = new Set();
const _pagosCache = new Map();
const _pagosLoading = new Set();
const _auditoriaCache = new Map();
let _filtroTexto = "";
let _filtroEstado = "TODOS";
let _reversaApiDisponible = true;
let _auditoriaApiDisponible = true;
function metodoRequiereOperacion(metodoPago) {
  return String(metodoPago || "EFECTIVO").toUpperCase() !== "EFECTIVO";
}

export function renderCobros(view, state) {
  _view = view;
  _state = state;

  const allRows = state.cobros || [];
  const rows = allRows.filter((row) => matchCobroFiltro(row));

  view.innerHTML = `
    <section class="panel">
      <h3>Cobros generados</h3>
      <p class="sub">Resultado final grabado en la base de datos, incluyendo ajustes de cobro sin alterar la liquidación.</p>

      <div class="cobros-toolbar">
        <input id="cobrosSearch" class="table-input" type="text" placeholder="Buscar por unidad o inquilino" value="${escapeAttr(_filtroTexto)}" />
        <select id="cobrosEstado" class="table-input">
          ${renderEstadoOptions()}
        </select>
        <button class="btn btn-light btn-sm" id="btnRecargarCobros">Recargar</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Inquilino</th>
              <th>Alquiler</th>
              <th>Luz</th>
              <th>Ajuste luz</th>
              <th>Agua</th>
              <th>Otros</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => {
              const detalle = _detalleCache.get(row.id_cobro) || null;
              const pagos = _pagosCache.get(row.id_cobro) || [];
              const expanded = _expandedCobroId === row.id_cobro;
              const loadingDetalle = _detalleLoading.has(row.id_cobro);
              const loadingPagos = _pagosLoading.has(row.id_cobro);
              const estadoCobro = String(row.estado_pago || "").toUpperCase();
              const puedeRegistrarPago = estadoCobro !== "PAGADO" && estadoCobro !== "ANULADO";

              return `
                <tr>
                  <td><strong>${row.codigo_unidad}</strong></td>
                  <td>${row.inquilino}</td>
                  <td>${money(row.monto_alquiler)}</td>
                  <td>${money(row.monto_luz)}</td>
                  <td>${money(row.ajuste_minimo_luz)}</td>
                  <td>${money(row.monto_agua)}</td>
                  <td>${money(row.otros_conceptos)}</td>
                  <td><strong>${money(row.total_cobrar)}</strong></td>
                  <td>${badgeCobroEstado(row.estado_pago)}</td>
                  <td>
                    <div class="cobro-row-actions">
                      <button class="btn btn-light btn-sm" data-detail="${row.id_cobro}">
                        ${expanded ? "Ocultar" : "Detalle"}
                      </button>
                      ${puedeRegistrarPago ? `<button class="btn btn-primary btn-sm" data-pay="${row.id_cobro}">Registrar pago</button>` : ""}
                      ${String(row.estado_pago || "").toUpperCase() === "PAGADO" ? `<button class="btn btn-light btn-sm" data-summary="${row.id_cobro}">Resumen</button>` : ""}
                    </div>
                  </td>
                </tr>
                ${expanded ? `
                  <tr>
                    <td colspan="10">
                      ${renderExpandedCobro(row, detalle, pagos, loadingDetalle, loadingPagos)}
                    </td>
                  </tr>
                ` : ""}
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      ${rows.length === 0 ? `<div class="info-callout" style="margin-top:12px;">No hay cobros que coincidan con el filtro.</div>` : ""}
    </section>
  `;

  bindToolbarEvents();

  view.querySelectorAll("[data-detail]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idCobro = Number(btn.dataset.detail);
      void toggleDetalle(idCobro);
    });
  });

  view.querySelectorAll("[data-pay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idCobro = Number(btn.dataset.pay);
      const row = (_state?.cobros || []).find((x) => Number(x.id_cobro) === idCobro);
      if (!row) return;
      void openPagoModal(row);
    });
  });

  view.querySelectorAll("[data-summary]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idCobro = Number(btn.dataset.summary);
      const row = (_state?.cobros || []).find((x) => Number(x.id_cobro) === idCobro);
      if (!row) return;
      void openResumenPagado(row);
    });
  });

  view.querySelectorAll("[data-reverse]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idPago = Number(btn.dataset.reverse);
      const idCobro = Number(btn.dataset.cobro);
      if (!idPago || !idCobro) return;
      void reversePagoFlow(idPago, idCobro);
    });
  });

  view.querySelectorAll("[data-audit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idPago = Number(btn.dataset.audit);
      if (!idPago) return;
      void openAuditoriaModal(idPago);
    });
  });

  view.querySelectorAll("[data-refresh-pagos]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idCobro = Number(btn.dataset.refreshPagos);
      if (!idCobro) return;
      void ensureExpandedData(idCobro, true);
    });
  });
}

function renderExpandedCobro(row, detalle, pagos, loadingDetalle, loadingPagos) {
  return `
    <div class="cobro-expand-grid">
      <div>
        <h4 style="margin: 0 0 8px;">Detalle por concepto</h4>
        ${loadingDetalle ? `<div class="info-callout">Cargando detalle...</div>` : renderDetalleCobro(detalle)}
      </div>
      <div>
        <div class="cobro-expand-head">
          <h4 style="margin:0;">Historial de pagos</h4>
          <button class="btn btn-light btn-sm" data-refresh-pagos="${row.id_cobro}">Actualizar</button>
        </div>
        ${loadingPagos ? `<div class="info-callout">Cargando pagos...</div>` : renderPagosCobro(pagos, row.id_cobro)}
      </div>
    </div>
  `;
}

async function openPagoModal(row) {
  const estadoCobro = String(row?.estado_pago || "").toUpperCase();
  if (estadoCobro === "PAGADO" || estadoCobro === "ANULADO") {
    toast("Este cobro ya no admite nuevos pagos", "warning");
    return;
  }

  const saldo = Number(row?.saldo_pendiente ?? row?.total_cobrar ?? 0);
  const hoy = new Date().toISOString().slice(0, 10);
  let detalle = _detalleCache.get(Number(row.id_cobro)) || null;

  if (!detalle) {
    try {
      const res = await API.getCobroDetalle(Number(row.id_cobro));
      detalle = res.data || null;
      _detalleCache.set(Number(row.id_cobro), detalle);
    } catch (_) {
      detalle = null;
    }
  }

  const conceptos = Array.isArray(detalle?.conceptos)
    ? detalle.conceptos.filter((item) => Number(item.saldo_pendiente || 0) > 0 && item.permite_pago_directo !== false)
    : [];
  const soportaPagoPorConcepto = conceptos.length > 0 && detalle?.compat_mode !== true;

  openModal(
    `Registrar pago · ${row.codigo_unidad}`,
    renderPagoModalHtml(row, saldo, hoy, conceptos, soportaPagoPorConcepto),
    async () => {
      const fechaPago = document.getElementById("pagoFecha")?.value || "";
      const montoPagado = Number(document.getElementById("pagoMonto")?.value || 0);
      const metodoPago = document.getElementById("pagoMetodo")?.value || "EFECTIVO";
      const numeroOperacion = (document.getElementById("pagoOperacion")?.value || "").trim();
      const observacion = (document.getElementById("pagoObs")?.value || "").trim();
      const modoAplicacion = soportaPagoPorConcepto
        ? (document.querySelector('input[name="pagoModoAplicacion"]:checked')?.value || "AUTOMATICA")
        : "AUTOMATICA";

      if (!fechaPago || montoPagado <= 0) {
        toast("Fecha y monto son obligatorios", "warning");
        return;
      }

      const requiereOperacion = metodoRequiereOperacion(metodoPago);
      if (requiereOperacion && !numeroOperacion) {
        toast("Para este método de pago, el número de operación es obligatorio", "warning");
        return;
      }

      const payload = {
        id_cobro: Number(row.id_cobro),
        fecha_pago: fechaPago,
        monto_pagado: Number(montoPagado.toFixed(2)),
        metodo_pago: metodoPago,
        numero_operacion: numeroOperacion || null,
        observacion: observacion || null,
        modo_aplicacion: modoAplicacion,
        registrado_por: "ADMIN_UI",
      };

      if (soportaPagoPorConcepto && modoAplicacion === "MANUAL") {
        const aplicaciones = collectManualAplicaciones();
        const totalManual = aplicaciones.reduce((sum, item) => sum + Number(item.monto_aplicado || 0), 0);
        if (aplicaciones.length === 0) {
          toast("Selecciona al menos un servicio/concepto para el pago manual", "warning");
          return;
        }
        if (round2(totalManual) !== round2(montoPagado)) {
          toast("La suma de conceptos debe ser igual al monto pagado", "warning");
          return;
        }
        payload.aplicaciones = aplicaciones;
      }

      try {
        await API.createPago(payload);

        await refreshCobrosAfterChange(Number(row.id_cobro));

        closeModal();
        renderCobros(_view, _state);
        toast(
          soportaPagoPorConcepto && modoAplicacion === "MANUAL"
            ? "Pago por concepto registrado correctamente"
            : "Pago registrado correctamente",
          "success"
        );
      } catch (error) {
        toast(error.message || "No se pudo registrar el pago", "error");
      }
    }
  );

  if (soportaPagoPorConcepto) {
    bindPagoModalEvents(conceptos);
  }

  bindMetodoPagoOperacionHint();
}

async function toggleDetalle(idCobro) {
  if (_expandedCobroId === idCobro) {
    _expandedCobroId = null;
    renderCobros(_view, _state);
    return;
  }

  _expandedCobroId = idCobro;
  renderCobros(_view, _state);

  await ensureExpandedData(idCobro, false);
}

async function ensureExpandedData(idCobro, forceReload) {
  const tasks = [];

  if (forceReload || !_detalleCache.has(idCobro)) {
    tasks.push(loadCobroDetalle(idCobro));
  }

  if (forceReload || !_pagosCache.has(idCobro)) {
    tasks.push(loadPagosCobro(idCobro));
  }

  if (tasks.length === 0) {
    return;
  }

  await Promise.all(tasks);

  if (_expandedCobroId === idCobro) {
    renderCobros(_view, _state);
  }
}

async function loadCobroDetalle(idCobro) {
  if (_detalleLoading.has(idCobro)) return;
  _detalleLoading.add(idCobro);
  renderCobros(_view, _state);

  try {
    const res = await API.getCobroDetalle(idCobro);
    _detalleCache.set(idCobro, res.data || null);
    if (res?.data?.compat_mode === true) {
      _reversaApiDisponible = false;
      _auditoriaApiDisponible = false;
    }
  } catch (error) {
    _detalleCache.set(idCobro, { conceptos: [] });
    toast(error.message || "No se pudo cargar el detalle del cobro", "error");
  } finally {
    _detalleLoading.delete(idCobro);
  }
}

async function loadPagosCobro(idCobro) {
  if (_pagosLoading.has(idCobro)) return;
  _pagosLoading.add(idCobro);
  renderCobros(_view, _state);

  try {
    const res = await API.listPagos({ id_cobro: idCobro });
    _pagosCache.set(idCobro, Array.isArray(res.data) ? res.data : []);
  } catch (error) {
    _pagosCache.set(idCobro, []);
    toast(error.message || "No se pudo cargar el historial de pagos", "error");
  } finally {
    _pagosLoading.delete(idCobro);
  }
}

function renderDetalleCobro(detalle) {
  if (!detalle || !Array.isArray(detalle.conceptos) || !detalle.conceptos.length) {
    return `<div class="info-callout">No hay conceptos detallados para este cobro.</div>`;
  }

  return `
    <div class="table-wrap" style="margin-top: 8px;">
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Programado</th>
            <th>Pagado</th>
            <th>Pendiente</th>
          </tr>
        </thead>
        <tbody>
          ${detalle.conceptos.map((c) => `
            <tr>
              <td>${c.nombre}</td>
              <td>${money(c.monto_programado)}</td>
              <td>${money(c.monto_pagado)}</td>
              <td><strong>${money(c.saldo_pendiente)}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPagosCobro(pagos, idCobro) {
  if (!pagos || pagos.length === 0) {
    return `<div class="info-callout">Aún no hay pagos registrados para este cobro.</div>`;
  }

  return `
    <div class="table-wrap" style="margin-top: 8px;">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${pagos.map((p) => {
            const estado = String(p.estado || "REGISTRADO");
            const puedeAnular = _reversaApiDisponible && estado === "REGISTRADO" && p.id_pago;
            const puedeVerAudit = _auditoriaApiDisponible && p.id_pago;

            return `
              <tr>
                <td>${escapeHtml(p.fecha_pago || "")}</td>
                <td>
                  <strong>${money(p.monto_pagado)}</strong>
                  ${renderPagoAplicaciones(p.aplicaciones)}
                </td>
                <td>${escapeHtml(p.metodo_pago || "-")}</td>
                <td>${badgePagoEstado(estado)}</td>
                <td>
                  <div class="cobro-row-actions">
                    ${puedeAnular ? `<button class="btn btn-danger btn-sm" data-reverse="${p.id_pago}" data-cobro="${idCobro}">Anular pago</button>` : ""}
                    ${puedeVerAudit ? `<button class="btn btn-light btn-sm" data-audit="${p.id_pago}">Auditoría</button>` : ""}
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPagoAplicaciones(aplicaciones) {
  if (!Array.isArray(aplicaciones) || aplicaciones.length === 0) {
    return "";
  }

  return `
    <div class="cobro-aplicaciones-list">
      ${aplicaciones.map((item) => `<span>${escapeHtml(item.nombre || item.codigo || "Concepto")}: ${money(item.monto_aplicado)}</span>`).join("")}
    </div>
  `;
}

function renderPagoModalHtml(row, saldo, hoy, conceptos, soportaPagoPorConcepto) {
  return `
    <div class="form-grid">
      <div class="full info-callout">
        <strong>Inquilino:</strong> ${row.inquilino}<br>
        <strong>Total cobro:</strong> ${money(row.total_cobrar)}<br>
        <strong>Pendiente:</strong> ${money(saldo)}
      </div>

      <div class="form-group">
        <label>Fecha pago *</label>
        <input id="pagoFecha" type="date" value="${hoy}" />
      </div>

      <div class="form-group">
        <label>Monto pagado *</label>
        <input id="pagoMonto" type="number" min="0.01" step="0.01" value="${Math.max(saldo, 0).toFixed(2)}" />
      </div>

      <div class="form-group">
        <label>Método</label>
        <select id="pagoMetodo">
          <option value="EFECTIVO">Efectivo</option>
          <option value="YAPE">Yape</option>
          <option value="PLIN">Plin</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      <div class="form-group">
        <label id="pagoOperacionLabel">N° operación (opcional en efectivo)</label>
        <input id="pagoOperacion" type="text" placeholder="Ej: YP-123456" maxlength="40" />
      </div>

      ${soportaPagoPorConcepto ? `
        <div class="form-group full">
          <label>Modo de pago</label>
          <div class="cobro-modo-pago">
            <label><input type="radio" name="pagoModoAplicacion" value="AUTOMATICA" checked /> Pagar completo / aplicar automático</label>
            <label><input type="radio" name="pagoModoAplicacion" value="MANUAL" /> Pagar solo ciertos servicios</label>
          </div>
          <small class="qr-help">El pago manual registra exactamente qué conceptos pagó el inquilino. Sí afecta la base, pero correctamente: guarda el detalle en pagos_detalle, no rompe nada.</small>
        </div>

        <div class="form-group full cobro-manual-box hidden" id="pagoManualBox">
          <label>Selecciona conceptos a pagar</label>
          <div class="cobro-concepto-grid">
            ${conceptos.map((concepto) => `
              <label class="cobro-concepto-item">
                <input type="checkbox" class="pago-concepto-check" data-id="${concepto.id_cobro_detalle}" />
                <div>
                  <strong>${escapeHtml(concepto.nombre || concepto.codigo)}</strong>
                  <span>Saldo: ${money(concepto.saldo_pendiente)}</span>
                </div>
                <input
                  type="number"
                  class="pago-concepto-monto"
                  data-id="${concepto.id_cobro_detalle}"
                  data-max="${Number(concepto.saldo_pendiente || 0).toFixed(2)}"
                  min="0"
                  step="0.01"
                  value="${Number(concepto.saldo_pendiente || 0).toFixed(2)}"
                  disabled
                />
              </label>
            `).join("")}
          </div>
          <div class="info-callout" id="pagoManualTotal">Seleccionado: ${money(0)}</div>
        </div>
      ` : `
        <div class="form-group full">
          <div class="info-callout">Este cobro está en modo compatible. Por ahora el registro será como pago total o parcial general, sin detallar servicios.</div>
        </div>
      `}

      <div class="form-group full">
        <label>Observación</label>
        <textarea id="pagoObs" rows="3" placeholder="Opcional"></textarea>
      </div>
    </div>
  `;
}

function bindPagoModalEvents(conceptos) {
  const radios = Array.from(document.querySelectorAll('input[name="pagoModoAplicacion"]'));
  const $box = document.getElementById("pagoManualBox");
  const $monto = document.getElementById("pagoMonto");
  const checks = Array.from(document.querySelectorAll(".pago-concepto-check"));
  const inputs = Array.from(document.querySelectorAll(".pago-concepto-monto"));

  const syncMode = () => {
    const manual = document.querySelector('input[name="pagoModoAplicacion"]:checked')?.value === "MANUAL";
    $box?.classList.toggle("hidden", !manual);
    if ($monto) {
      $monto.readOnly = manual;
      $monto.classList.toggle("input-readonly", manual);
    }
    if (!manual) {
      updateManualTotals();
      return;
    }
    const totalPendiente = conceptos.reduce((sum, item) => sum + Number(item.saldo_pendiente || 0), 0);
    if ($monto && round2(Number($monto.value || 0)) === 0) {
      $monto.value = totalPendiente.toFixed(2);
    }
    updateManualTotals();
  };

  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const input = document.querySelector(`.pago-concepto-monto[data-id="${check.dataset.id}"]`);
      if (!input) return;
      input.disabled = !check.checked;
      if (check.checked && Number(input.value || 0) <= 0) {
        input.value = Number(input.dataset.max || 0).toFixed(2);
      }
      updateManualTotals();
    });
  });

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const max = Number(input.dataset.max || 0);
      const value = Number(input.value || 0);
      if (value > max) input.value = max.toFixed(2);
      if (value < 0) input.value = "0.00";
      updateManualTotals();
    });
  });

  radios.forEach((radio) => radio.addEventListener("change", syncMode));
  syncMode();
}

function updateManualTotals() {
  const apps = collectManualAplicaciones();
  const total = apps.reduce((sum, item) => sum + Number(item.monto_aplicado || 0), 0);
  const $total = document.getElementById("pagoManualTotal");
  const $monto = document.getElementById("pagoMonto");
  if ($total) {
    $total.textContent = `Seleccionado: ${money(total)}`;
  }
  if ($monto && document.querySelector('input[name="pagoModoAplicacion"]:checked')?.value === "MANUAL") {
    $monto.value = total > 0 ? total.toFixed(2) : "0.00";
  }
}

function collectManualAplicaciones() {
  return Array.from(document.querySelectorAll(".pago-concepto-check:checked")).map((check) => {
    const input = document.querySelector(`.pago-concepto-monto[data-id="${check.dataset.id}"]`);
    return {
      id_cobro_detalle: Number(check.dataset.id),
      monto_aplicado: round2(Number(input?.value || 0)),
    };
  }).filter((item) => item.id_cobro_detalle > 0 && item.monto_aplicado > 0);
}

async function openResumenPagado(row) {
  const idCobro = Number(row.id_cobro);
  await ensureExpandedData(idCobro, true);
  const detalle = _detalleCache.get(idCobro) || null;
  const pagos = _pagosCache.get(idCobro) || [];

  openModal(
    `Resumen de pago · ${row.codigo_unidad}`,
    renderResumenPagadoHtml(row, detalle, pagos),
    () => closeModal()
  );

  const $save = document.getElementById("modalSave");
  if ($save) {
    $save.textContent = "Cerrar";
  }

  bindResumenModalActions(idCobro);
}

function bindResumenModalActions(idCobro) {
  const $body = document.getElementById("modalBody");
  if (!$body) return;

  $body.querySelectorAll("[data-reverse]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idPago = Number(btn.dataset.reverse);
      const idCobroBtn = Number(btn.dataset.cobro || idCobro);
      if (!idPago || !idCobroBtn) return;
      await reversePagoFlow(idPago, idCobroBtn);
      await openResumenPagado((_state?.cobros || []).find((x) => Number(x.id_cobro) === idCobroBtn) || { id_cobro: idCobroBtn, codigo_unidad: "" });
    });
  });

  $body.querySelectorAll("[data-audit]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idPago = Number(btn.dataset.audit);
      if (!idPago) return;
      await openAuditoriaModal(idPago);
    });
  });
}

function renderResumenPagadoHtml(row, detalle, pagos) {
  const totalPagado = pagos.reduce((sum, item) => {
    const estado = String(item.estado || "REGISTRADO").toUpperCase();
    return estado === "REGISTRADO" ? sum + Number(item.monto_pagado || 0) : sum;
  }, 0);
  const ultimoPago = pagos[0]?.fecha_pago || "-";

  return `
    <div class="cobro-paid-summary">
      <div class="info-callout">
        <strong>Unidad:</strong> ${escapeHtml(row.codigo_unidad)}<br>
        <strong>Inquilino:</strong> ${escapeHtml(row.inquilino)}<br>
        <strong>Estado:</strong> PAGADO<br>
        <strong>Total cobro:</strong> ${money(row.total_cobrar)}<br>
        <strong>Total pagado:</strong> ${money(totalPagado)}<br>
        <strong>Último pago:</strong> ${escapeHtml(ultimoPago)}
      </div>

      <h4 style="margin: 14px 0 8px;">Conceptos cubiertos</h4>
      ${renderDetalleCobro(detalle)}

      <h4 style="margin: 14px 0 8px;">Pagos registrados</h4>
      ${renderPagosCobro(pagos, Number(row.id_cobro))}
    </div>
  `;
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

async function reversePagoFlow(idPago, idCobro) {
  if (!_reversaApiDisponible) {
    toast("Anulación no disponible en modo compatible", "warning");
    return;
  }

  const ok = await confirmModal("¿Seguro que deseas anular este pago?", {
    label: "Anular pago",
    destructive: true,
  });
  if (!ok) return;

  const payload = {
    motivo_reversa: "Anulación desde Cobros UI",
    reversado_por: "ADMIN_UI",
    fecha_reversa: new Date().toISOString().slice(0, 10),
  };

  try {
    await API.reversePago(idPago, payload);
    await refreshCobrosAfterChange(idCobro);
    toast("Pago anulado correctamente", "success");
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.toLowerCase().includes("no esta desplegado") || msg.toLowerCase().includes("schema")) {
      _reversaApiDisponible = false;
      toast("Anulación no disponible hasta desplegar el esquema por concepto", "warning");
    } else {
      toast(msg || "No se pudo anular el pago", "error");
    }
  }
}

async function openAuditoriaModal(idPago) {
  if (!_auditoriaApiDisponible) {
    toast("Auditoría no disponible en modo compatible", "warning");
    return;
  }

  let logs = _auditoriaCache.get(idPago);
  if (!logs) {
    try {
      const res = await API.getPagoAuditoria(idPago);
      logs = Array.isArray(res.data) ? res.data : [];
      _auditoriaCache.set(idPago, logs);
    } catch (error) {
      const msg = String(error?.message || "");
      if (msg.toLowerCase().includes("no esta desplegado") || msg.toLowerCase().includes("schema")) {
        _auditoriaApiDisponible = false;
        toast("Auditoría no disponible hasta desplegar el esquema por concepto", "warning");
      } else {
        toast(msg || "No se pudo cargar la auditoría", "error");
      }
      return;
    }
  }

  openModal(
    `Auditoría de pago #${idPago}`,
    renderAuditoriaHtml(logs),
    () => closeModal()
  );

  const $save = document.getElementById("modalSave");
  if ($save) {
    $save.textContent = "Cerrar";
  }
}

function renderAuditoriaHtml(logs) {
  if (!logs?.length) {
    return `<div class="info-callout">No hay registros de auditoría para este pago.</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Acción</th>
            <th>Actor</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map((l) => `
            <tr>
              <td>${escapeHtml(l.created_at || "")}</td>
              <td>${badgeAuditAction(l.accion)}</td>
              <td>${escapeHtml(l.actor || "-")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function refreshCobrosAfterChange(idCobro) {
  const [cobrosRes, dashRes, pagosRes] = await Promise.all([
    API.getCobros(_state.periodoId),
    API.getDashboard(_state.periodoId),
    API.listPagos({ id_cobro: idCobro }),
  ]);

  _state.cobros = cobrosRes.data || [];
  _state.dashboard = dashRes.data || null;
  _pagosCache.set(idCobro, pagosRes.data || []);
  _detalleCache.delete(idCobro);
  _expandedCobroId = idCobro;

  await ensureExpandedData(idCobro, true);
}

async function refreshCobrosGrid() {
  try {
    const [cobrosRes, dashRes] = await Promise.all([
      API.getCobros(_state.periodoId),
      API.getDashboard(_state.periodoId),
    ]);
    _state.cobros = cobrosRes.data || [];
    _state.dashboard = dashRes.data || null;
    renderCobros(_view, _state);
  } catch (error) {
    toast(error.message || "No se pudo recargar cobros", "error");
  }
}

function bindToolbarEvents() {
  const $search = document.getElementById("cobrosSearch");
  const $estado = document.getElementById("cobrosEstado");
  const $reload = document.getElementById("btnRecargarCobros");

  $search?.addEventListener("input", (e) => {
    _filtroTexto = String(e.target.value || "");
    renderCobros(_view, _state);
  });

  $estado?.addEventListener("change", (e) => {
    _filtroEstado = String(e.target.value || "TODOS");
    renderCobros(_view, _state);
  });

  $reload?.addEventListener("click", () => {
    void refreshCobrosGrid();
  });
}

function renderEstadoOptions() {
  const estados = ["TODOS", "PENDIENTE", "PARCIAL", "PAGADO", "ANULADO"];
  return estados.map((e) => `<option value="${e}" ${_filtroEstado === e ? "selected" : ""}>${e}</option>`).join("");
}

function matchCobroFiltro(row) {
  const texto = _filtroTexto.trim().toLowerCase();
  const estado = String(row.estado_pago || "").toUpperCase();
  const estadoOk = _filtroEstado === "TODOS" || estado === _filtroEstado;

  if (!estadoOk) return false;
  if (!texto) return true;

  const haystack = `${row.codigo_unidad || ""} ${row.nombre_unidad || ""} ${row.inquilino || ""}`.toLowerCase();
  return haystack.includes(texto);
}

function badgeCobroEstado(estado) {
  const e = String(estado || "PENDIENTE").toUpperCase();
  if (e === "PAGADO") return `<span class="badge paid">PAGADO</span>`;
  if (e === "PARCIAL") return `<span class="badge partial">PARCIAL</span>`;
  if (e === "ANULADO") return `<span class="badge cancelled">ANULADO</span>`;
  return `<span class="badge pending">PENDIENTE</span>`;
}

function badgePagoEstado(estado) {
  const e = String(estado || "REGISTRADO").toUpperCase();
  if (e === "REVERSADO") return `<span class="badge cancelled">REVERSADO</span>`;
  if (e === "ANULADO") return `<span class="badge cancelled">ANULADO</span>`;
  return `<span class="badge paid">REGISTRADO</span>`;
}

function badgeAuditAction(accion) {
  const a = String(accion || "").toUpperCase();
  if (a === "REVERSADO") return `<span class="badge cancelled">REVERSADO</span>`;
  if (a === "ACTUALIZADO") return `<span class="badge partial">ACTUALIZADO</span>`;
  if (a === "APLICADO") return `<span class="badge paid">APLICADO</span>`;
  return `<span class="badge">${escapeHtml(a || "CREADO")}</span>`;
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

function bindMetodoPagoOperacionHint() {
  const $metodo = document.getElementById("pagoMetodo");
  const $label = document.getElementById("pagoOperacionLabel");
  const $op = document.getElementById("pagoOperacion");
  if (!$metodo || !$label || !$op) return;

  const sync = () => {
    const requiere = metodoRequiereOperacion($metodo.value);
    $label.textContent = requiere ? "N° operación *" : "N° operación (opcional)";
    $op.placeholder = requiere ? "Obligatorio" : "Opcional";
  };

  $metodo.addEventListener("change", sync);
  sync();
}