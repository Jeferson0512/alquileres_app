import { API } from "../api.js";
import { openModal, closeModal, confirmModal } from "../app.js";
import { money, toast } from "../utils.js";

/* ── helpers ────────────────────────────────────────── */
const TIPOS = ["CUARTO","MINI_DPTO","DEPARTAMENTO","LOCAL","DEPOSITO","AREA_COMUN","MEDIDOR_GENERAL","OTRO"];

function badgeEstado(e) {
  return e === "ACTIVO"
    ? `<span class="badge">Activo</span>`
    : `<span class="badge inactive">Inactivo</span>`;
}

function tipoLabel(t) {
  return { CUARTO:"Cuarto", MINI_DPTO:"Mini Dpto", DEPARTAMENTO:"Departamento",
    LOCAL:"Local", DEPOSITO:"Depósito", AREA_COMUN:"Área Común",
    MEDIDOR_GENERAL:"Medidor General", OTRO:"Otro" }[t] ?? t;
}

function formHTML(data = {}) {
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Código unidad *</label>
        <input id="fu_codigo" value="${data.codigo_unidad ?? ""}" placeholder="Ej: 101" />
      </div>
      <div class="form-group">
        <label>Nombre unidad *</label>
        <input id="fu_nombre" value="${data.nombre_unidad ?? ""}" placeholder="Ej: Primer Piso" />
      </div>
      <div class="form-group">
        <label>Piso</label>
        <input id="fu_piso" type="number" value="${data.piso ?? 1}" min="0" />
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select id="fu_tipo">
          ${TIPOS.map(t =>
            `<option value="${t}" ${(data.tipo_unidad ?? "CUARTO") === t ? "selected" : ""}>${tipoLabel(t)}</option>`
          ).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>¿Tiene medidor?</label>
        <select id="fu_medidor">
          <option value="SI" ${(data.tiene_medidor ?? "SI") === "SI" ? "selected" : ""}>Sí</option>
          <option value="NO" ${(data.tiene_medidor ?? "SI") === "NO" ? "selected" : ""}>No</option>
        </select>
      </div>
      <div class="form-group">
        <label>Código medidor</label>
        <input id="fu_med_cod" value="${data.medidor_codigo ?? ""}" placeholder="Ej: MED-101" />
      </div>
      <div class="form-group">
        <label>Tarifa base (S/)</label>
        <input id="fu_tarifa" type="number" step="0.01" value="${data.tarifa_alquiler_base ?? 0}" />
      </div>
      <div class="form-group">
        <label>Estado</label>
        <select id="fu_estado">
          <option value="ACTIVO"   ${(data.estado ?? "ACTIVO") === "ACTIVO"   ? "selected" : ""}>Activo</option>
          <option value="INACTIVO" ${(data.estado ?? "ACTIVO") === "INACTIVO" ? "selected" : ""}>Inactivo</option>
        </select>
      </div>
      <div class="form-group full">
        <label>Observación</label>
        <input id="fu_obs" value="${data.observacion ?? ""}" placeholder="Opcional" />
      </div>
    </div>
  `;
}

function getFormPayload(idInmueble = 1) {
  return {
    id_inmueble:         idInmueble,
    codigo_unidad:       document.getElementById("fu_codigo")?.value.trim(),
    nombre_unidad:       document.getElementById("fu_nombre")?.value.trim(),
    piso:                parseInt(document.getElementById("fu_piso")?.value) || 0,
    tipo_unidad:         document.getElementById("fu_tipo")?.value,
    tiene_medidor:       document.getElementById("fu_medidor")?.value,
    medidor_codigo:      document.getElementById("fu_med_cod")?.value.trim() || null,
    tarifa_alquiler_base: parseFloat(document.getElementById("fu_tarifa")?.value) || 0,
    observacion:         document.getElementById("fu_obs")?.value.trim() || null,
    estado:              document.getElementById("fu_estado")?.value,
  };
}

/* ── estado local ───────────────────────────────────── */
let _all = [];
let _view = null;
let _state = null;

/* ── render ─────────────────────────────────────────── */
function redraw(list) {
  const tbody = document.getElementById("uniTbody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:28px">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td><strong>${r.codigo_unidad}</strong></td>
      <td>${r.nombre_unidad}</td>
      <td>Piso ${r.piso}</td>
      <td>${tipoLabel(r.tipo_unidad)}</td>
      <td>${money(r.tarifa_alquiler_base)}</td>
      <td>${badgeEstado(r.estado)}</td>
      <td>
        <button class="btn btn-sm btn-light" data-edit="${r.id_unidad}">Editar</button>
        <button class="btn btn-sm btn-danger" style="margin-left:6px" data-del="${r.id_unidad}">Desactivar</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => openEdit(parseInt(btn.dataset.edit)))
  );

  tbody.querySelectorAll("[data-del]").forEach(btn =>
    btn.addEventListener("click", () => confirmDel(parseInt(btn.dataset.del)))
  );
}

/* ── acciones CRUD ──────────────────────────────────── */
async function openNew() {
  openModal("Nueva unidad", formHTML(), async () => {
    const p = getFormPayload();
    if (!p.codigo_unidad || !p.nombre_unidad) { toast("Código y nombre son obligatorios", 'warning'); return; }
    try {
      await API.createUnidad(p);
      closeModal();
      await reload();
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function openEdit(id) {
  const row = _all.find(r => r.id_unidad === id);
  if (!row) return;
  openModal("Editar unidad", formHTML(row), async () => {
    const p = getFormPayload(row.id_inmueble);
    if (!p.codigo_unidad || !p.nombre_unidad) { toast("Código y nombre son obligatorios", 'warning'); return; }
    try {
      await API.updateUnidad(id, p);
      closeModal();
      await reload();
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function confirmDel(id) {
  const row = _all.find(r => r.id_unidad === id);
  if (!row) return;
  const ok = await confirmModal(`¿Desactivar la unidad ${row.codigo_unidad} - ${row.nombre_unidad}?`);
  if (!ok) return;
  try {
    await API.deleteUnidad(id);
    await reload();
  } catch (e) { toast(e.message, 'error'); }
}

async function reload() {
  const res = await API.listUnidades();
  _all = res.data;
  if (_state) _state.unidades = _all;
  redraw(_all);
}

/* ── búsqueda local ─────────────────────────────────── */
function search(q) {
  const lower = q.toLowerCase();
  redraw(_all.filter(r =>
    `${r.codigo_unidad} ${r.nombre_unidad}`.toLowerCase().includes(lower)
  ));
}

/* ── export ─────────────────────────────────────────── */
export function renderUnidades(view, state) {
  _view  = view;
  _state = state;
  _all   = state.unidades ?? [];

  view.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h3>Unidades</h3>
        <p>Gestión de todas las unidades del inmueble.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Piso</th>
              <th>Tipo</th>
              <th>Tarifa base</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="uniTbody"></tbody>
        </table>
      </div>
    </section>
  `;

  redraw(_all);

  /* hooks para app.js */
  window._unidadNueva  = openNew;
  window._unidadSearch = search;
}
