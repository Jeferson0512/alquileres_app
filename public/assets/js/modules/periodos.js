import { number } from "../utils.js";

function periodoLabel(periodo) {
  const d = new Date(periodo.anio, periodo.mes - 1, 1);
  return d.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}

export function renderPeriodos(view, state) {
  const rows = (state.periodos || []).map((periodo) => {
    const fechaInicio = periodo.fecha_inicio || "-";
    const fechaFin = periodo.fecha_fin || "-";
    const observacion = periodo.observacion ? periodo.observacion : "-";
    const actionLabel = periodo.estado === "ABIERTO" ? "Cerrar" : "Abrir";

    return `
      <tr>
        <td>${periodo.id_periodo}</td>
        <td>${periodoLabel(periodo)}</td>
        <td>${fechaInicio}</td>
        <td>${fechaFin}</td>
        <td>${periodo.estado}</td>
        <td>${observacion}</td>
        <td>
          <button class="btn btn-light btn-xs js-toggle-periodo" data-id="${periodo.id_periodo}" data-estado="${periodo.estado}">${actionLabel}</button>
        </td>
      </tr>
    `;
  }).join("");

  view.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h3>Períodos</h3>
        <p class="sub">Registra periodos nuevos y cierra los periodos que ya terminaron.</p>
      </div>
      <div class="info-callout" style="margin-bottom:16px;">
        Crea periodos con fecha de inicio y fin para que el sistema pueda sincronizar lecturas correctamente.
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Periodo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Observación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="7" style="text-align:center;padding:20px;">No hay periodos registrados.</td></tr>`}
          </tbody>
        </table>
      </div>
    </section>
  `;

  view.querySelectorAll(".js-toggle-periodo").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id || 0);
      const estado = button.dataset.estado === "ABIERTO" ? "CERRADO" : "ABIERTO";
      window._periodoToggleState?.(id, estado);
    });
  });
}
