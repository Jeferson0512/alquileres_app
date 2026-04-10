import { money, number } from "../utils.js";

export function renderDashboard(view, state) {
  const recibo  = state.recibo  ?? {};
  const preview = state.previewLiquidacion ?? {};
  const filas   = preview.data ?? [];
  const meta    = preview.meta ?? {};

  /* Composición del recibo */
  const compItems = [
    ["Consumo de energía",    recibo.consumo_energia],
    ["Cargo fijo",            recibo.cargo_fijo],
    ["Mant. y reposición",    recibo.mant_reposicion],
    ["Alumbrado público",     recibo.alumbrado_publico],
    ["IGV",                   recibo.igv],
    ["Electrificación rural", recibo.electrificacion_rural],
  ];

  const compHTML = compItems.map(([label, val]) => `
    <div class="comp-row">
      <span>${label}</span>
      <strong>${money(val)}</strong>
    </div>
  `).join("") + `
    <div class="comp-row">
      <span>Total a pagar</span>
      <strong>${money(recibo.total_recibo)}</strong>
    </div>
  `;

  /* Filas de unidades */
  const unitsHTML = filas.length === 0
    ? `<p style="color:var(--muted); font-size:13px; margin:16px 0">Sin datos. Genera la liquidación primero.</p>`
    : filas.map(row => {
        const pct = (((row.porcentaje_participacion ?? 0) * 100)).toFixed(1);
        return `
          <div class="unit-row">
            <div class="unit-row-top">
              <span class="unit-code">Unidad ${row.codigo_unidad}</span>
              <span class="unit-tag">${row.inquilino?.split(" ")[0] ?? "—"}</span>
              <span style="font-size:12px; color:var(--muted); margin-left:auto">${row.nombre_unidad}</span>
            </div>
            <div class="unit-row-nums">
              <div class="un-col">
                <p class="un-label">Consumo</p>
                <p class="un-val">${number(row.consumo_kwh)} kWh</p>
              </div>
              <div class="un-col">
                <p class="un-label">Luz</p>
                <p class="un-val">${money(row.total_pagar_luz)}</p>
              </div>
              <div class="un-col">
                <p class="un-label">Alquiler</p>
                <p class="un-val">${money(row.monto_alquiler)}</p>
              </div>
              <div class="un-col">
                <p class="un-label">Total</p>
                <p class="un-val" style="color:var(--text); font-weight:700">${money(row.total_cobrar)}</p>
              </div>
            </div>
            <div class="progress-bar-wrap">
              <span>Participación</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
              <span>${pct}%</span>
            </div>
          </div>
        `;
      }).join("");

  view.innerHTML = `
    <div class="dash-grid">
      <!-- Panel izquierdo: resumen operativo -->
      <section class="panel">
        <div class="panel-head">
          <h3>Resumen operativo</h3>
          <p>Vista rápida del recibo y del reparto mensual.</p>
        </div>

        <div class="mini-stats">
          <div class="mini-stat">
            <p class="ms-label">Suministro</p>
            <p class="ms-value">${recibo.numero_suministro ?? "—"}</p>
          </div>
          <div class="mini-stat">
            <p class="ms-label">Consumo general</p>
            <p class="ms-value">${number(recibo.consumo_kwh_general)} kWh</p>
          </div>
          <div class="mini-stat">
            <p class="ms-label">Consumo energía</p>
            <p class="ms-value">${money(recibo.consumo_energia)}</p>
          </div>
          <div class="mini-stat">
            <p class="ms-label">Total recibo</p>
            <p class="ms-value">${money(recibo.total_recibo)}</p>
          </div>
        </div>

        ${unitsHTML}
      </section>

      <!-- Panel derecho: composición recibo + regla -->
      <div style="display:flex; flex-direction:column; gap:16px">
        <section class="panel">
          <div class="panel-head">
            <h3>Composición del recibo</h3>
          </div>
          <div class="comp-list">
            ${compHTML}
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h3>Regla de cálculo</h3>
          </div>
          <div class="rule-list">
            <div class="rule-item">
              <div class="rule-dot"></div>
              <span>El consumo de energía se reparte según kWh consumidos por unidad.</span>
            </div>
            <div class="rule-item">
              <div class="rule-dot"></div>
              <span>Los cargos comunes se distribuyen de forma equitativa entre las ${filas.length} unidades ocupadas.</span>
            </div>
            <div class="rule-item">
              <div class="rule-dot"></div>
              <span>El cobro final del mes suma alquiler + luz + agua fija.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}