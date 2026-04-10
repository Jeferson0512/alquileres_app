import { API } from "../api.js";
import { openModal, closeModal, confirmModal } from "../app.js";
import { toast } from "../utils.js";

/* ── helpers ────────────────────────────────────────── */
function badgeEstado(e) {
  return e === "ACTIVO"
    ? `<span class="badge">Activo</span>`
    : `<span class="badge inactive">Inactivo</span>`;
}

function formHTML(data = {}) {
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Nombres *</label>
        <input id="fi_nombres" value="${data.nombres ?? ""}" placeholder="Ej: Juan Carlos" />
      </div>
      <div class="form-group">
        <label>Apellidos *</label>
        <input id="fi_apellidos" value="${data.apellidos ?? ""}" placeholder="Ej: Pérez Ríos" />
      </div>
      <div class="form-group">
        <label>Tipo documento</label>
        <select id="fi_tipo_doc">
          ${["DNI","CE","Pasaporte",""].map(v =>
            `<option value="${v}" ${(data.tipo_documento ?? "") === v ? "selected" : ""}>${v || "— Sin documento —"}</option>`
          ).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Número documento</label>
        <input id="fi_num_doc" value="${data.numero_documento ?? ""}" placeholder="12345678" />
      </div>
      <div class="form-group">
        <label>Celular</label>
        <input id="fi_celular" value="${data.celular ?? ""}" placeholder="9XXXXXXXX" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input id="fi_email" type="email" value="${data.email ?? ""}" placeholder="correo@ejemplo.com" />
      </div>
      <div class="form-group full">
        <label>Dirección</label>
        <input id="fi_direccion" value="${data.direccion ?? ""}" placeholder="Av. Ejemplo 123" />
      </div>
      <div class="form-group full">
        <label>Observación</label>
        <input id="fi_obs" value="${data.observacion ?? ""}" placeholder="Opcional" />
      </div>
      <div class="form-group">
        <label>Estado</label>
        <select id="fi_estado">
          <option value="ACTIVO"   ${(data.estado ?? "ACTIVO") === "ACTIVO"   ? "selected" : ""}>Activo</option>
          <option value="INACTIVO" ${(data.estado ?? "ACTIVO") === "INACTIVO" ? "selected" : ""}>Inactivo</option>
        </select>
      </div>
    </div>
  `;
}

function getFormPayload() {
  return {
    nombres:          document.getElementById("fi_nombres")?.value.trim(),
    apellidos:        document.getElementById("fi_apellidos")?.value.trim(),
    tipo_documento:   document.getElementById("fi_tipo_doc")?.value || null,
    numero_documento: document.getElementById("fi_num_doc")?.value.trim() || null,
    celular:          document.getElementById("fi_celular")?.value.trim() || null,
    email:            document.getElementById("fi_email")?.value.trim() || null,
    direccion:        document.getElementById("fi_direccion")?.value.trim() || null,
    observacion:      document.getElementById("fi_obs")?.value.trim() || null,
    estado:           document.getElementById("fi_estado")?.value,
  };
}

/* ── estado local ───────────────────────────────────── */
let _all = [];
let _view = null;
let _state = null;

/* ── render ─────────────────────────────────────────── */
function redraw(list) {
  const tbody = document.getElementById("inqTbody");
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:28px">Sin resultados</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td><strong>${r.apellidos}, ${r.nombres}</strong></td>
      <td>${r.tipo_documento ?? "—"} ${r.numero_documento ?? ""}</td>
      <td>${r.celular ?? "—"}</td>
      <td>${r.email ?? "—"}</td>
      <td>${badgeEstado(r.estado)}</td>
      <td>
        <button class="btn btn-sm btn-light" data-edit="${r.id_persona}">Editar</button>
        <button class="btn btn-sm btn-danger" style="margin-left:6px" data-del="${r.id_persona}">Desactivar</button>
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
  openModal("Nuevo inquilino", formHTML(), async () => {
    const p = getFormPayload();
    if (!p.nombres || !p.apellidos) { toast("Nombres y apellidos son obligatorios", 'warning'); return; }
    try {
      await API.createInquilino(p);
      closeModal();
      await reload();
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function openEdit(id) {
  const row = _all.find(r => r.id_persona === id);
  if (!row) return;
  openModal("Editar inquilino", formHTML(row), async () => {
    const p = getFormPayload();
    if (!p.nombres || !p.apellidos) { toast("Nombres y apellidos son obligatorios", 'warning'); return; }
    try {
      await API.updateInquilino(id, p);
      closeModal();
      await reload();
    } catch (e) { toast(e.message, 'error'); }
  });
}

async function confirmDel(id) {
  const row = _all.find(r => r.id_persona === id);
  if (!row) return;
  const ok = await confirmModal(`¿Desactivar a ${row.nombres} ${row.apellidos}?`);
  if (!ok) return;
  try {
    await API.deleteInquilino(id);
    await reload();
  } catch (e) { toast(e.message, 'error'); }
}

async function reload() {
  const res = await API.listInquilinos();
  _all = res.data;
  if (_state) _state.inquilinos = _all;
  redraw(_all);
}

/* ── búsqueda local ─────────────────────────────────── */
function search(q) {
  const lower = q.toLowerCase();
  redraw(_all.filter(r =>
    `${r.nombres} ${r.apellidos} ${r.numero_documento ?? ""}`.toLowerCase().includes(lower)
  ));
}

/* ── export ─────────────────────────────────────────── */
export function renderInquilinos(view, state) {
  _view  = view;
  _state = state;
  _all   = state.inquilinos ?? [];

  view.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h3>Inquilinos</h3>
        <p>Gestión de todos los inquilinos registrados.</p>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Celular</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="inqTbody"></tbody>
        </table>
      </div>
    </section>
  `;

  redraw(_all);

  /* hooks para app.js */
  window._inquilinoNuevo  = openNew;
  window._inquilinoSearch = search;
}
