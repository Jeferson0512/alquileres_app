import { API } from "../api.js";
import { openModal, closeModal, confirmModal } from "../app.js";
import { money, toast } from "../utils.js";

/* ── helpers visuales ───────────────────────────────── */
function badgeOcupacion(estado) {
  const map = {
    ACTIVO:     `<span class="badge">Activo</span>`,
    FINALIZADO: `<span class="badge inactive">Finalizado</span>`,
    ANULADO:    `<span class="badge cancelled">Anulado</span>`,
  };
  return map[estado] ?? estado;
}

function fmt(fecha) {
  if (!fecha) return "—";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

/* ── estado local ───────────────────────────────────── */
let _all    = [];
let _filter = "ACTIVO"; // ACTIVO | FINALIZADO | ANULADO | todos
let _view   = null;
let _state  = null;

/* ── render de filas ─────────────────────────────────── */
function redraw(list) {
  const tbody = document.getElementById("ocuTbody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:28px">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td><strong>${r.codigo_unidad}</strong></td>
      <td>${r.nombre_unidad}</td>
      <td>${r.inquilino}</td>
      <td>${money(r.monto_alquiler)}</td>
      <td>${fmt(r.fecha_inicio)}</td>
      <td>${r.fecha_fin ? fmt(r.fecha_fin) : `<span style="color:var(--muted)">Vigente</span>`}</td>
      <td>${badgeOcupacion(r.estado)}</td>
      <td>
        <button class="btn btn-sm btn-light" data-edit="${r.id_ocupacion}">Editar</button>
        ${r.estado === "ACTIVO" ? `
          <button class="btn btn-sm btn-danger" style="margin-left:6px" data-fin="${r.id_ocupacion}">Finalizar</button>
        ` : ""}
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => openEdit(parseInt(btn.dataset.edit)))
  );
  tbody.querySelectorAll("[data-fin]").forEach(btn =>
    btn.addEventListener("click", () => confirmarFinalizar(parseInt(btn.dataset.fin)))
  );
}

/* ── construir form con selects cargados de la API ──── */
async function buildFormHTML(data = {}) {
  const [resUni, resInq] = await Promise.all([
    API.listUnidades(),
    API.listInquilinos(),
  ]);

  const unidades = resUni.data.filter(u => u.estado === "ACTIVO");
  const personas = resInq.data.filter(p => p.estado === "ACTIVO");

  return `
    <div class="form-grid">

      <div class="form-group">
        <label>Unidad *</label>
        <select id="fo_unidad">
          <option value="">— Seleccionar —</option>
          ${unidades.map(u =>
            `<option value="${u.id_unidad}" ${(data.id_unidad ?? "") == u.id_unidad ? "selected" : ""}>
              ${u.codigo_unidad} — ${u.nombre_unidad}
            </option>`
          ).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Inquilino *</label>
        <select id="fo_persona">
          <option value="">— Seleccionar —</option>
          ${personas.map(p =>
            `<option value="${p.id_persona}" ${(data.id_persona ?? "") == p.id_persona ? "selected" : ""}>
              ${p.nombres} ${p.apellidos}
            </option>`
          ).join("")}
        </select>
      </div>

      <div class="form-group">
        <label>Fecha inicio *</label>
        <input id="fo_fecha_ini" type="date" value="${data.fecha_inicio ?? ""}" />
      </div>

      <div class="form-group">
        <label>Fecha fin</label>
        <input id="fo_fecha_fin" type="date" value="${data.fecha_fin ?? ""}" />
        <small style="color:var(--muted);font-size:11px">Dejar vacío si sigue vigente</small>
      </div>

      <div class="form-group">
        <label>Monto alquiler (S/) *</label>
        <input id="fo_alquiler" type="number" step="0.01" min="0" value="${data.monto_alquiler ?? ""}" placeholder="0.00" />
      </div>

      <div class="form-group">
        <label>Garantía (S/)</label>
        <input id="fo_garantia" type="number" step="0.01" min="0" value="${data.garantia ?? 0}" placeholder="0.00" />
      </div>

      <div class="form-group">
        <label>Estado</label>
        <select id="fo_estado">
          <option value="ACTIVO"     ${(data.estado ?? "ACTIVO") === "ACTIVO"     ? "selected" : ""}>Activo</option>
          <option value="FINALIZADO" ${(data.estado ?? "ACTIVO") === "FINALIZADO" ? "selected" : ""}>Finalizado</option>
          <option value="ANULADO"    ${(data.estado ?? "ACTIVO") === "ANULADO"    ? "selected" : ""}>Anulado</option>
        </select>
      </div>

      <div class="form-group full">
        <label>Observación</label>
        <input id="fo_obs" value="${data.observacion ?? ""}" placeholder="Opcional" />
      </div>

    </div>
  `;
}

function getFormPayload() {
  return {
    id_unidad:      parseInt(document.getElementById("fo_unidad")?.value) || 0,
    id_persona:     parseInt(document.getElementById("fo_persona")?.value) || 0,
    fecha_inicio:   document.getElementById("fo_fecha_ini")?.value || "",
    fecha_fin:      document.getElementById("fo_fecha_fin")?.value || null,
    monto_alquiler: parseFloat(document.getElementById("fo_alquiler")?.value) || 0,
    garantia:       parseFloat(document.getElementById("fo_garantia")?.value) || 0,
    estado:         document.getElementById("fo_estado")?.value || "ACTIVO",
    observacion:    document.getElementById("fo_obs")?.value.trim() || null,
  };
}

/* ── acciones CRUD ──────────────────────────────────── */
async function openNew() {
  const html = await buildFormHTML();
  openModal("Nueva ocupación", html, async () => {
    const p = getFormPayload();
    if (!p.id_unidad || !p.id_persona || !p.fecha_inicio) {
      toast("Unidad, inquilino y fecha de inicio son obligatorios", 'warning');
      return;
    }
    if (!p.monto_alquiler) {
      toast("El monto de alquiler es obligatorio", 'warning');
      return;
    }
    try {
      await API.createOcupacion(p);
      closeModal();
      await reload();
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function openEdit(id) {
  const row = _all.find(r => r.id_ocupacion === id);
  if (!row) return;

  const html = await buildFormHTML(row);
  openModal("Editar ocupación", html, async () => {
    const p = getFormPayload();
    if (!p.id_unidad || !p.id_persona || !p.fecha_inicio) {
      toast("Unidad, inquilino y fecha de inicio son obligatorios", 'warning');
      return;
    }
    try {
      await API.updateOcupacion(id, p);
      closeModal();
      await reload();
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function confirmarFinalizar(id) {
  const row = _all.find(r => r.id_ocupacion === id);
  if (!row) return;

  const hoy = new Date().toISOString().slice(0, 10);
  const ok = await confirmModal(
    `¿Finalizar la ocupación de ${row.inquilino} en ${row.codigo_unidad}?\nSe registrará como fecha fin: ${hoy}.`,
    { label: 'Finalizar' }
  );
  if (!ok) return;

  try {
    await API.updateOcupacion(id, {
      id_unidad:      row.id_unidad,
      id_persona:     row.id_persona,
      fecha_inicio:   row.fecha_inicio,
      fecha_fin:      hoy,
      monto_alquiler: row.monto_alquiler,
      garantia:       row.garantia,
      estado:         "FINALIZADO",
      observacion:    row.observacion,
    });
    await reload();
  } catch (e) { toast(e.message, 'error'); }
}

async function reload() {
  const res = await API.listOcupaciones(_filter === "todos" ? "" : _filter);
  _all = res.data;
  if (_state) _state.ocupaciones = _all;
  redraw(_all);
}

/* ── búsqueda local ─────────────────────────────────── */
function search(q) {
  const lower = q.toLowerCase();
  redraw(_all.filter(r =>
    `${r.codigo_unidad} ${r.nombre_unidad} ${r.inquilino}`.toLowerCase().includes(lower)
  ));
}

/* ── render principal ───────────────────────────────── */
export function renderOcupaciones(view, state) {
  _view  = view;
  _state = state;
  _all   = state.ocupaciones ?? [];

  view.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h3>Ocupaciones</h3>
        <p>Asignación de inquilinos a unidades del inmueble.</p>
      </div>

      <div class="ocu-filters">
        <button class="ocu-tab ${_filter === "ACTIVO"     ? "active" : ""}" data-f="ACTIVO">Activos</button>
        <button class="ocu-tab ${_filter === "FINALIZADO" ? "active" : ""}" data-f="FINALIZADO">Finalizados</button>
        <button class="ocu-tab ${_filter === "ANULADO"    ? "active" : ""}" data-f="ANULADO">Anulados</button>
        <button class="ocu-tab ${_filter === "todos"      ? "active" : ""}" data-f="todos">Todos</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Unidad</th>
              <th>Inquilino</th>
              <th>Alquiler</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="ocuTbody">
            <tr><td colspan="8" style="text-align:center;color:var(--muted);padding:28px">Cargando…</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  `;

  /* tabs de filtro */
  view.querySelectorAll(".ocu-tab").forEach(btn => {
    btn.addEventListener("click", async () => {
      _filter = btn.dataset.f;
      view.querySelectorAll(".ocu-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      await reload();
    });
  });

  /* hooks globales */
  window._ocupacionNueva  = openNew;
  window._ocupacionSearch = search;

  /* carga inicial */
  reload();
}
