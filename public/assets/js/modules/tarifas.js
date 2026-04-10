import { API } from "../api.js";
import { toast } from "../utils.js";

const SERVICIOS_LABEL = {
  AGUA: "Agua",
  GAS: "Gas",
  MANTENIMIENTO: "Mantenimiento",
};

/**
 * Renderiza el módulo de configuración de tarifas de servicios.
 * @param {HTMLElement} $view - contenedor principal
 */
export async function renderTarifas($view) {
  $view.innerHTML = `
    <section class="panel">
      <div class="panel-head" style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;">
        <h3>Tarifas de servicios</h3>
        <p class="sub">Configure los montos fijos mensuales que se suman al cobro.</p>
      </div>
      <div id="tarifasContent">
        <p class="sub">Cargando tarifas...</p>
      </div>
    </section>
  `;

  try {
    const res = await API.listTarifas();
    renderCards(res.data);
  } catch (e) {
    document.getElementById("tarifasContent").innerHTML =
      `<p class="text-danger">Error al cargar tarifas: ${e.message}</p>`;
  }
}

function renderCards(tarifas) {
  const $c = document.getElementById("tarifasContent");
  if (!tarifas.length) {
    $c.innerHTML = `<p class="sub">No hay tarifas configuradas.</p>`;
    return;
  }

  $c.innerHTML = `
    <div class="table-wrap tarifas-wrap">
      <table>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Descripcion</th>
            <th>Monto (S/)</th>
            <th>Estado</th>
            <th>Accion</th>
          </tr>
        </thead>
        <tbody>
          ${tarifas.map((t) => {
            const label = SERVICIOS_LABEL[t.servicio] || t.servicio;
            return `
              <tr class="${t.activo ? '' : 'tarifa-row-muted'}" data-id="${t.id_tarifa}">
                <td><strong>${label}</strong></td>
                <td>
                  <input type="text" class="table-input input-desc" value="${t.descripcion ?? ""}" maxlength="200" />
                </td>
                <td>
                  <input type="number" class="table-input input-monto" value="${parseFloat(t.monto).toFixed(2)}" min="0" step="0.01" />
                </td>
                <td>
                  <label class="tarifa-check">
                    <input type="checkbox" class="chk-activo" ${t.activo ? "checked" : ""} />
                    <span class="badge ${t.activo ? "active" : "cancelled"}">${t.activo ? "Activo" : "Inactivo"}</span>
                  </label>
                </td>
                <td>
                  <button class="btn btn-dark btn-guardar-tarifa" data-id="${t.id_tarifa}">Guardar</button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
    <div class="info-callout">
      Los montos configurados aqui se aplican cuando se generan los cobros. Si cambias una tarifa, vuelve a generar liquidacion y cobros del periodo abierto.
    </div>
  `;

  $c.querySelectorAll(".btn-guardar-tarifa").forEach(btn => {
    btn.addEventListener("click", () => guardarTarifa(btn.closest("tr")));
  });
}

async function guardarTarifa($card) {
  const id       = $card.dataset.id;
  const monto    = parseFloat($card.querySelector(".input-monto").value);
  const desc     = $card.querySelector(".input-desc").value.trim();
  const activo   = $card.querySelector(".chk-activo").checked ? 1 : 0;

  if (isNaN(monto) || monto < 0) {
    toast("El monto debe ser un número positivo", 'warning');
    return;
  }

  const btn = $card.querySelector(".btn-guardar-tarifa");
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Guardando…";

  try {
    await API.updateTarifa(id, { monto, descripcion: desc, activo });

    // Actualizar badge de estado en UI
    const rowBadge = $card.querySelector(".badge");
    rowBadge.className = `badge ${activo ? "active" : "cancelled"}`;
    rowBadge.textContent = activo ? "Activo" : "Inactivo";
    $card.classList.toggle("tarifa-row-muted", !activo);

    btn.textContent = "Guardado";
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1500);
  } catch (e) {
    toast("Error al guardar: " + e.message, 'error');
    btn.textContent = original;
    btn.disabled = false;
  }
}
