import { money, number, toast } from "../utils.js";

const GUIDE_MODE_KEY = "lecturas.guide.mode.v1";

function loadGuideMode() {
  try {
    const mode = localStorage.getItem(GUIDE_MODE_KEY);
    return mode === "SUPERVISOR" ? "SUPERVISOR" : "USUARIO";
  } catch (_) {
    return "USUARIO";
  }
}

function saveGuideMode(mode) {
  try {
    localStorage.setItem(GUIDE_MODE_KEY, mode);
  } catch (_) {
    // No-op
  }
}

function getGuideData(state, mode) {
  const meta = state.previewLiquidacion?.meta || {};
  const infoRecibo = state.recibo || {};
  const totalConsumo = Number(meta.total_consumo || 0);
  const precioKwh = Number(meta.precio_kwh ?? infoRecibo.precio_kwh ?? 0);
  const diferencia = Number(meta.diferencia_comun || 0);
  const criterio = meta.criterio_gasto_comun || "PROPORCIONAL_PORCENTAJE";

  if (mode === "SUPERVISOR") {
    return {
      title: "Flujo completo de cálculo (Supervisor)",
      lines: [
        `1) Consumo por unidad: lectura_actual - lectura_anterior (no negativo).`,
        `2) Participación: consumo_unidad / suma_consumos (${number(totalConsumo)} kWh).`,
        `3) Subtotal consumo: consumo_unidad × precio_kwh (${number(precioKwh, 4)}).`,
        `4) IGV consumo: subtotal × 18%.`,
        `5) Monto consumo redondeado: ceil((subtotal+igv)*10)/10.`,
        `6) Diferencia común: total_recibo - suma_montos_consumo_redondeados (${money(diferencia)}).`,
        `7) Gasto común: diferencia × participación (${criterio}).`,
        `8) Total luz: monto_consumo + gasto_comun + ajuste_manual.`,
        `9) Total cobrar: alquiler + servicios + total_luz.`,
      ],
    };
  }

  return {
    title: "Explicación simple de tu cálculo",
    lines: [
      `Tu consumo sale de la diferencia entre lectura actual y anterior.`,
      `Tu participación depende de cuánto consumiste frente al total del edificio.`,
      `Tu monto por consumo incluye IGV y se redondea hacia arriba al siguiente S/ 0.10.`,
      `El gasto común se reparte en proporción a tu participación.`,
      `Total luz = consumo + gasto común del periodo.`,
      `Total a pagar = alquiler + servicios + luz del periodo.`,
    ],
  };
}

async function downloadGuidePng(state, mode) {
  const guide = getGuideData(state, mode);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 760;
  const ctx = canvas.getContext("2d");

  const grad = ctx.createLinearGradient(0, 0, 1200, 760);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1d4ed8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 760);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px Segoe UI";
  ctx.fillText(mode === "SUPERVISOR" ? "Detalle de Liquidación" : "Resumen de Cálculo de Luz", 70, 90);

  ctx.font = "28px Segoe UI";
  ctx.fillStyle = "#dbeafe";
  if (mode === "SUPERVISOR") {
    ctx.fillText(guide.title, 70, 145);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "26px Segoe UI";
  let y = mode === "SUPERVISOR" ? 210 : 165;
  guide.lines.forEach((line) => {
    const wrapped = wrapTextForCanvas(ctx, line, 1040);
    wrapped.forEach((w) => {
      ctx.fillText(`• ${w}`, 85, y);
      y += 42;
    });
    y += 10;
  });

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error("No se pudo generar PNG"));
      resolve(b);
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = mode === "SUPERVISOR" ? "lecturas-detalle-supervisor.png" : "lecturas-resumen-usuario.png";
  a.click();
  URL.revokeObjectURL(url);
}

function wrapTextForCanvas(ctx, text, maxWidth) {
  const words = String(text || "").split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function renderLecturas(view, state, onSave, canEdit = true) {
  const guideMode = loadGuideMode();
  const guide = getGuideData(state, guideMode);

  view.innerHTML = `
    <section class="panel">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
        <div>
          <h3>Registro rápido de lecturas</h3>
          <p class="sub">Edita lecturas actuales, revisa la herencia del mes anterior y guarda cambios en la base de datos.</p>
        </div>
        ${canEdit ? `<button class="btn btn-primary" id="btnSaveLecturas">Guardar lecturas</button>` : ""}
      </div>

      <div class="info-callout" style="margin-bottom:16px;">
        La auditoria compara la lectura anterior registrada contra la lectura actual del periodo inmediatamente anterior.
      </div>

      <div class="info-callout" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
          <strong>Cómo se calcula la luz</strong>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <select id="lecturasGuideMode" class="table-input" style="width:auto;min-width:180px;">
              <option value="USUARIO" ${guideMode === "USUARIO" ? "selected" : ""}>Vista usuario</option>
              <option value="SUPERVISOR" ${guideMode === "SUPERVISOR" ? "selected" : ""}>Vista supervisor</option>
            </select>
            <button class="btn btn-light btn-sm" id="btnLecturasGuidePng">Descargar PNG</button>
          </div>
        </div>
        <div style="margin-top:10px;display:grid;gap:6px;">
          <div style="font-weight:700;">${guide.title}</div>
          ${guide.lines.map((line) => `<div style="color:#475569;">• ${line}</div>`).join("")}
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Inquilino</th>
              <th>Anterior heredada</th>
              <th>Auditoria</th>
              <th>Anterior</th>
              <th>Actual</th>
              <th>Consumo</th>
              <th>Alquiler</th>
            </tr>
          </thead>
          <tbody>
            ${state.lecturas.map(row => `
              <tr class="${row.auditoria_lectura_anterior === 'REVISAR' ? 'lectura-row-review' : ''}">
                <td><strong>${row.codigo_unidad}</strong></td>
                <td>${row.inquilino || '-'}</td>
                <td>${row.lectura_referencia_anterior == null ? '-' : number(row.lectura_referencia_anterior)}</td>
                <td>${auditBadge(row.auditoria_lectura_anterior)}</td>
                <td>${number(row.lectura_anterior)}</td>
                <td>
                  ${canEdit
                    ? `<input class="table-input js-lectura" data-id="${row.id_lectura}" value="${row.lectura_actual}" />`
                    : number(row.lectura_actual)
                  }
                </td>
                <td>${number(row.consumo)} kWh</td>
                <td>${money(row.monto_alquiler)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  if (canEdit) {
    document.getElementById("btnSaveLecturas")?.addEventListener("click", () => {
      const items = [...document.querySelectorAll(".js-lectura")].map((input) => ({
        id_lectura: Number(input.dataset.id),
        lectura_actual: Number(input.value || 0),
      }));
      onSave(items);
    });
  }

  document.getElementById("lecturasGuideMode")?.addEventListener("change", (e) => {
    const mode = String(e.target.value || "USUARIO").toUpperCase() === "SUPERVISOR" ? "SUPERVISOR" : "USUARIO";
    saveGuideMode(mode);
    renderLecturas(view, state, onSave, canEdit);
  });

  document.getElementById("btnLecturasGuidePng")?.addEventListener("click", async () => {
    try {
      const mode = loadGuideMode();
      await downloadGuidePng(state, mode);
      toast("Se descargó el resumen en PNG", "success");
    } catch (error) {
      toast(error.message || "No se pudo generar el PNG", "error");
    }
  });
}

function auditBadge(status) {
  if (status === "OK") return `<span class="badge paid">OK</span>`;
  if (status === "REVISAR") return `<span class="badge cancelled">Revisar</span>`;
  return `<span class="badge inactive">Sin historico</span>`;
}