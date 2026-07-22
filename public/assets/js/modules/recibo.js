import { money, number } from "../utils.js";

function decimal(v, n = 2) {
  return Number(v ?? 0).toFixed(n);
}

export function renderRecibo(view, state, onSave, canEdit = true, onCopyPrev = null) {
  const r = state.recibo ?? {};

  view.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h3>Recibo general de luz</h3>
        <p>Registro del recibo del mes seleccionado. El número de recibo se genera automáticamente.</p>
      </div>

      <div class="form-grid" style="margin-bottom:14px;">
        <div class="form-group">
          <label>Número de recibo</label>
          <input id="rr_numero_recibo" value="${r.numero_recibo ?? ""}" readonly />
        </div>
        <div class="form-group">
          <label>Número de suministro</label>
          <input id="rr_numero_suministro" value="${r.numero_suministro ?? ""}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Fecha emisión</label>
          <input id="rr_fecha_emision" type="date" value="${r.fecha_emision ?? ""}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Fecha vencimiento</label>
          <input id="rr_fecha_vencimiento" type="date" value="${r.fecha_vencimiento ?? ""}" ${canEdit ? "" : "readonly"} />
        </div>

        <div class="form-group">
          <label>Lectura anterior general</label>
          <input id="rr_lectura_anterior" type="number" step="0.01" value="${decimal(r.lectura_anterior_general)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Lectura actual general</label>
          <input id="rr_lectura_actual" type="number" step="0.01" value="${decimal(r.lectura_actual_general)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Consumo general (kWh)</label>
          <input id="rr_consumo_general" type="number" step="0.01" value="${decimal(r.consumo_kwh_general)}" readonly />
        </div>
        <div class="form-group">
          <label>Precio kWh</label>
          <input id="rr_precio_kwh" type="number" step="0.0001" value="${decimal(r.precio_kwh, 4)}" ${canEdit ? "" : "readonly"} />
        </div>

        <div class="form-group">
          <label>Consumo energía</label>
          <input id="rr_consumo_energia" type="number" step="0.01" value="${decimal(r.consumo_energia)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Cargo fijo</label>
          <input id="rr_cargo_fijo" type="number" step="0.01" value="${decimal(r.cargo_fijo)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Mant. reposición</label>
          <input id="rr_mant_reposicion" type="number" step="0.01" value="${decimal(r.mant_reposicion)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Alumbrado público</label>
          <input id="rr_alumbrado_publico" type="number" step="0.01" value="${decimal(r.alumbrado_publico)}" ${canEdit ? "" : "readonly"} />
        </div>

        <div class="form-group">
          <label>Subtotal</label>
          <input id="rr_subtotal" type="number" step="0.01" value="${decimal(r.subtotal)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>IGV</label>
          <input id="rr_igv" type="number" step="0.01" value="${decimal(r.igv)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Electrificación rural</label>
          <input id="rr_electrificacion" type="number" step="0.01" value="${decimal(r.electrificacion_rural)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Ajuste redondeo anterior</label>
          <input id="rr_ajuste_ant" type="number" step="0.01" value="${decimal(r.ajuste_redondeo_anterior)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Ajuste redondeo actual</label>
          <input id="rr_ajuste_act" type="number" step="0.01" value="${decimal(r.ajuste_redondeo_actual)}" ${canEdit ? "" : "readonly"} />
        </div>
        <div class="form-group">
          <label>Total recibo</label>
          <input id="rr_total" type="number" step="0.01" value="${decimal(r.total_recibo)}" ${canEdit ? "" : "readonly"} />
        </div>

        <div class="form-group full">
          <label>Observación</label>
          <input id="rr_obs" value="${r.observacion ?? ""}" ${canEdit ? "" : "readonly"} />
        </div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${canEdit ? `<button class="btn btn-light" id="btnCopyPrevRecibo">Copiar desde mes anterior</button>` : ""}
        ${canEdit ? `<button class="btn btn-primary" id="btnSaveRecibo">Guardar recibo del mes</button>` : ""}
      </div>

      <div class="table-wrap" style="margin-top:18px;">
        <table>
          <tbody>
            <tr><th>Suministro</th><td>${r.numero_suministro ?? "-"}</td></tr>
            <tr><th>Lectura anterior general</th><td>${number(r.lectura_anterior_general)}</td></tr>
            <tr><th>Lectura actual general</th><td>${number(r.lectura_actual_general)}</td></tr>
            <tr><th>Consumo general</th><td>${number(r.consumo_kwh_general)} kWh</td></tr>
            <tr><th>Consumo energía</th><td>${money(r.consumo_energia)}</td></tr>
            <tr><th>IGV</th><td>${money(r.igv)}</td></tr>
            <tr><th>Total recibo</th><td><strong>${money(r.total_recibo)}</strong></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

  const calcConsumo = () => {
    const ant = parseFloat(document.getElementById("rr_lectura_anterior")?.value) || 0;
    const act = parseFloat(document.getElementById("rr_lectura_actual")?.value) || 0;
    const kwh = Math.max(act - ant, 0);
    const input = document.getElementById("rr_consumo_general");
    if (input) input.value = kwh.toFixed(2);
  };

  document.getElementById("rr_lectura_anterior")?.addEventListener("input", calcConsumo);
  document.getElementById("rr_lectura_actual")?.addEventListener("input", calcConsumo);

  const autoCalcular = () => {
    const lecturaAnterior = parseFloat(document.getElementById("rr_lectura_anterior")?.value) || 0;
    const lecturaActual = parseFloat(document.getElementById("rr_lectura_actual")?.value) || 0;
    const precioKwh = parseFloat(document.getElementById("rr_precio_kwh")?.value) || 0;
    const cargoFijo = parseFloat(document.getElementById("rr_cargo_fijo")?.value) || 0;
    const mant = parseFloat(document.getElementById("rr_mant_reposicion")?.value) || 0;
    const alumbrado = parseFloat(document.getElementById("rr_alumbrado_publico")?.value) || 0;
    const elec = parseFloat(document.getElementById("rr_electrificacion")?.value) || 0;
    const ajusteAnt = parseFloat(document.getElementById("rr_ajuste_ant")?.value) || 0;
    const ajusteAct = parseFloat(document.getElementById("rr_ajuste_act")?.value) || 0;

    const consumoKwh = Math.max(lecturaActual - lecturaAnterior, 0);
    const consumoEnergia = consumoKwh * precioKwh;
    const subtotal = consumoEnergia + cargoFijo + mant + alumbrado;
    const igv = subtotal * 0.18;
    const total = subtotal + igv + elec + ajusteAnt + ajusteAct;

    const setVal = (id, value, decimals = 2) => {
      const el = document.getElementById(id);
      if (el) el.value = Number(value).toFixed(decimals);
    };

    setVal("rr_consumo_general", consumoKwh);
    setVal("rr_consumo_energia", consumoEnergia);
    setVal("rr_subtotal", subtotal);
    setVal("rr_igv", igv);
    setVal("rr_total", total);
  };

  [
    "rr_lectura_anterior",
    "rr_lectura_actual",
    "rr_precio_kwh",
    "rr_cargo_fijo",
    "rr_mant_reposicion",
    "rr_alumbrado_publico",
    "rr_electrificacion",
    "rr_ajuste_ant",
    "rr_ajuste_act",
  ].forEach(id => document.getElementById(id)?.addEventListener("input", autoCalcular));

  if (canEdit) {
    document.getElementById("btnCopyPrevRecibo")?.addEventListener("click", () => {
      if (onCopyPrev) onCopyPrev();
    });
  }

  if (canEdit) {
    document.getElementById("btnSaveRecibo")?.addEventListener("click", () => {
      onSave({
        numero_suministro: document.getElementById("rr_numero_suministro")?.value?.trim() || null,
        fecha_emision: document.getElementById("rr_fecha_emision")?.value || null,
        fecha_vencimiento: document.getElementById("rr_fecha_vencimiento")?.value || null,
        lectura_anterior_general: parseFloat(document.getElementById("rr_lectura_anterior")?.value) || 0,
        lectura_actual_general: parseFloat(document.getElementById("rr_lectura_actual")?.value) || 0,
        precio_kwh: parseFloat(document.getElementById("rr_precio_kwh")?.value) || 0,
        consumo_energia: parseFloat(document.getElementById("rr_consumo_energia")?.value) || 0,
        cargo_fijo: parseFloat(document.getElementById("rr_cargo_fijo")?.value) || 0,
        mant_reposicion: parseFloat(document.getElementById("rr_mant_reposicion")?.value) || 0,
        alumbrado_publico: parseFloat(document.getElementById("rr_alumbrado_publico")?.value) || 0,
        subtotal: parseFloat(document.getElementById("rr_subtotal")?.value) || 0,
        igv: parseFloat(document.getElementById("rr_igv")?.value) || 0,
        electrificacion_rural: parseFloat(document.getElementById("rr_electrificacion")?.value) || 0,
        ajuste_redondeo_anterior: parseFloat(document.getElementById("rr_ajuste_ant")?.value) || 0,
        ajuste_redondeo_actual: parseFloat(document.getElementById("rr_ajuste_act")?.value) || 0,
        total_recibo: parseFloat(document.getElementById("rr_total")?.value) || 0,
        observacion: document.getElementById("rr_obs")?.value?.trim() || null,
        estado: "ACTIVO",
      });
    });
  }
}