import { money, number } from "../utils.js";

export function renderLiquidacion(view, state) {
  const payload = state.previewLiquidacion;
  if (!payload || !payload.data) {
    view.innerHTML = `
      <section class="panel">
        <h3>Previsualización de liquidación</h3>
        <p class="sub">Aún no hay datos para mostrar.</p>
      </section>
    `;
    return;
  }

  const ajustesState = state.liquidacionAjustes || (state.liquidacionAjustes = {});
  const isCurrentPeriod = !state.periodos?.length || state.periodoId === state.periodos[0]?.id_periodo;

  payload.data.forEach((row) => {
    const idUnidad = Number(row.id_unidad || 0);
    if (!idUnidad || !row.participa_liquidacion) return;
    if (ajustesState[idUnidad] === undefined) {
      ajustesState[idUnidad] = Number(row.ajuste || 0);
    }
  });

  const totalAjustes = payload.data.reduce((sum, row) => {
    const idUnidad = Number(row.id_unidad || 0);
    if (!idUnidad || !row.participa_liquidacion) return sum;
    return sum + Number(ajustesState[idUnidad] || 0);
  }, 0);

  view.innerHTML = `
    <section class="panel">
      <h3>Previsualización de liquidación</h3>
      <p class="sub">Distribución del recibo con fórmula proporcional por consumo y gasto común según participación.</p>

      <div class="info-callout" style="margin-bottom:18px;">
        Fórmula aplicada: consumo × precio_kwh → subtotal, IGV 18%, redondeo al siguiente S/ 0.10, y la diferencia vs total del recibo se reparte por % de participación.
      </div>

      <div class="stats" style="grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:18px;">
        <article class="card"><div class="card-body"><p class="card-title">Consumo liquidado</p><p class="card-value">${number(payload.meta.total_consumo)} kWh</p></div></article>
        <article class="card"><div class="card-body"><p class="card-title">Precio kWh</p><p class="card-value">${number(payload.meta.precio_kwh, 4)}</p></div></article>
        <article class="card"><div class="card-body"><p class="card-title">Monto consumo (redondeado)</p><p class="card-value">${money(payload.meta.monto_consumo_total)}</p></div></article>
        <article class="card"><div class="card-body"><p class="card-title">Diferencia a distribuir</p><p class="card-value">${money(payload.meta.diferencia_comun)}</p></div></article>
      </div>

      <div class="info-callout" style="margin-bottom:12px;">
        <strong>Ajustes manuales cargados:</strong> ${money(totalAjustes)}
        ${isCurrentPeriod ? "· Puedes editar la columna Ajuste manual antes de generar." : "· Periodo histórico: solo lectura."}
      </div>

      <div class="mini-stats" style="margin-bottom:18px;">
        <div class="mini-card">
          <span>Unidades mostradas</span>
          <strong>${number(payload.meta.total_unidades, 0)}</strong>
        </div>
        <div class="mini-card">
          <span>Unidades liquidadas</span>
          <strong>${number(payload.meta.total_unidades_liquidadas, 0)}</strong>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Inquilino</th>
              <th>Consumo</th>
              <th>% Participación</th>
              <th>Subtotal consumo</th>
              <th>IGV consumo</th>
              <th>Monto consumo (redondeado)</th>
              <th>Gasto común (%)</th>
              <th>Ajuste manual</th>
              <th>Total luz</th>
              <th>Total cobrar</th>
            </tr>
          </thead>
          <tbody>
            ${payload.data.map((row) => {
              const idUnidad = Number(row.id_unidad || 0);
              const ajuste = row.participa_liquidacion ? Number(ajustesState[idUnidad] || 0) : 0;
              const totalLuz = Number(row.total_luz_base || row.total_pagar_luz || 0) + ajuste;
              const servicios = Number(row.agua || 0) + Number(row.gas || 0) + Number(row.mantenimiento || 0);
              const totalCobrar = Number(row.monto_alquiler || 0) + servicios + totalLuz;

              return `
              <tr class="${row.participa_liquidacion ? '' : 'liquidacion-row-muted'}">
                <td><strong>${row.codigo_unidad}</strong></td>
                <td><span class="badge ${row.participa_liquidacion ? 'active' : 'cancelled'}">${row.participa_liquidacion ? 'Ocupada' : 'Vacía'}</span></td>
                <td>${row.inquilino}</td>
                <td>${number(row.consumo_kwh)} kWh</td>
                <td>${number(row.porcentaje_participacion * 100, 2)}%</td>
                <td>${money(row.subtotal_consumo)}</td>
                <td>${money(row.igv_consumo)}</td>
                <td>${money(row.monto_consumo)}</td>
                <td>${money(row.gasto_comun)}</td>
                <td>
                  ${row.participa_liquidacion
                    ? (isCurrentPeriod
                      ? `<input class="table-input js-liq-ajuste" data-unidad="${idUnidad}" data-base="${Number(row.total_luz_base || row.total_pagar_luz || 0)}" data-alquiler="${Number(row.monto_alquiler || 0)}" data-servicios="${servicios}" value="${Number(ajuste).toFixed(2)}" />`
                      : `${money(ajuste)}`)
                    : "-"
                  }
                </td>
                <td><strong data-total-luz>${money(totalLuz)}</strong></td>
                <td><strong data-total-cobrar>${money(totalCobrar)}</strong></td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  if (isCurrentPeriod) {
    view.querySelectorAll('.js-liq-ajuste').forEach((input) => {
      input.addEventListener('input', () => {
        const idUnidad = Number(input.dataset.unidad || 0);
        if (!idUnidad) return;

        const ajuste = Number(input.value || 0);
        state.liquidacionAjustes[idUnidad] = Number.isFinite(ajuste) ? ajuste : 0;

        const tr = input.closest('tr');
        if (!tr) return;

        const base = Number(input.dataset.base || 0);
        const alquiler = Number(input.dataset.alquiler || 0);
        const servicios = Number(input.dataset.servicios || 0);
        const totalLuz = base + state.liquidacionAjustes[idUnidad];
        const totalCobrar = alquiler + servicios + totalLuz;

        const totalLuzEl = tr.querySelector('[data-total-luz]');
        const totalCobrarEl = tr.querySelector('[data-total-cobrar]');
        if (totalLuzEl) totalLuzEl.textContent = money(totalLuz);
        if (totalCobrarEl) totalCobrarEl.textContent = money(totalCobrar);
      });
    });
  }
}