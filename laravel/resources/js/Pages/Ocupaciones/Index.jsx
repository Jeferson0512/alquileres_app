import Badge from '@/Components/Badge';
import IconButton from '@/Components/IconButton';
import Pagination from '@/Components/Pagination';
import StatusTabs from '@/Components/StatusTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmDialog from '@/lib/confirm';
import formatDate from '@/lib/date';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Ban, Pencil, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';

const ESTADO_TABS = [
    { value: 'ACTIVO', label: 'Activas' },
    { value: 'FINALIZADO', label: 'Finalizadas' },
    { value: 'ANULADO', label: 'Anuladas' },
    { value: 'TODOS', label: 'Todas' },
];

const emptyForm = {
    id_unidad: '', id_persona: '', fecha_inicio: '', fecha_fin: '',
    monto_alquiler: 0, garantia: 0, estado: 'ACTIVO', observacion: '',
    crear_usuario: false, usuario_password: '', renovada_de_id: null,
};

function EstadoOcupacionBadge({ ocupacion }) {
    if (ocupacion.estado === 'ACTIVO') return <Badge variant="success">Activo</Badge>;
    if (ocupacion.estado === 'FINALIZADO' && ocupacion.motivo_fin === 'RENOVACION') {
        return <Badge variant="info">Renovado</Badge>;
    }
    if (ocupacion.estado === 'FINALIZADO') return <Badge variant="danger">Finalizado</Badge>;
    return <Badge variant="danger">Anulado</Badge>;
}

function FinalizarModal({ ocupacion, onClose, onFinalizado }) {
    const [motivo, setMotivo] = useState('MUDANZA');
    const [detalle, setDetalle] = useState('');
    const [fechaFin, setFechaFin] = useState(ocupacion.fecha_fin ?? new Date().toISOString().slice(0, 10));
    const [processing, setProcessing] = useState(false);

    const detalleFaltante = motivo === 'OTRO' && !detalle.trim();

    const submit = () => {
        if (detalleFaltante) return;
        setProcessing(true);
        router.delete(route('ocupaciones.destroy', ocupacion.id_ocupacion), {
            data: { motivo_fin: motivo, motivo_fin_detalle: motivo === 'OTRO' ? detalle.trim() : null, fecha_fin: fechaFin },
            onSuccess: () => {
                onClose();
                onFinalizado(ocupacion, motivo, fechaFin);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-1 text-base font-semibold text-gray-800">Finalizar ocupación</h3>
                <p className="mb-4 text-sm text-gray-500">{ocupacion.unidad?.codigo_unidad} — {ocupacion.persona?.nombres} {ocupacion.persona?.apellidos}</p>

                <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500">Fecha de fin</label>
                    <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                </div>

                <div className="mb-1 space-y-2">
                    <label className="block text-xs font-medium text-gray-500">Motivo</label>
                    {[
                        { value: 'RENOVACION', label: 'Renovación de contrato', desc: 'El inquilino sigue viviendo ahí, solo cambian los términos — se abre una notificación para crear el nuevo contrato.' },
                        { value: 'MUDANZA', label: 'Mudanza / fin de contrato', desc: 'Este es el cierre real: el inquilino se retira de la unidad y no continúa.' },
                        { value: 'OTRO', label: 'Otro motivo', desc: 'Para casos que no son ni renovación ni mudanza (ej. desalojo). Debes especificar por qué.' },
                    ].map((opt) => (
                        <label key={opt.value} className="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 p-2 has-[:checked]:border-primary has-[:checked]:bg-primary-light/30">
                            <input type="radio" name="motivo_fin" value={opt.value} checked={motivo === opt.value} onChange={() => setMotivo(opt.value)} className="mt-0.5" />
                            <span>
                                <span className="block text-sm font-medium text-gray-700">{opt.label}</span>
                                {opt.desc && <span className="block text-xs text-gray-400">{opt.desc}</span>}
                            </span>
                        </label>
                    ))}
                </div>

                {motivo === 'OTRO' && (
                    <div className="mb-4 mt-2">
                        <label className="block text-xs font-medium text-gray-500">Especifica el motivo *</label>
                        <textarea
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            rows={2}
                            placeholder="Ej. desalojo por incumplimiento de contrato"
                            className="mt-1 w-full rounded-md border-gray-300 text-sm"
                        />
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <button onClick={submit} disabled={processing || detalleFaltante} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                        Confirmar
                    </button>
                    <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ ocupaciones, unidades, inquilinos, estadoFiltro, renovarDesde }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [finalizando, setFinalizando] = useState(null);
    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (p) => auth.permissions.includes(p);

    const prefillRenovacion = (ocupacionVieja, fechaFinUsada) => {
        const base = fechaFinUsada ?? ocupacionVieja.fecha_fin;
        const nuevaFechaInicio = new Date(`${base}T00:00:00`);
        nuevaFechaInicio.setDate(nuevaFechaInicio.getDate() + 1);

        setEditing('new');
        setData({
            ...emptyForm,
            id_unidad: ocupacionVieja.id_unidad,
            id_persona: ocupacionVieja.id_persona,
            monto_alquiler: ocupacionVieja.monto_alquiler,
            garantia: ocupacionVieja.garantia,
            fecha_inicio: nuevaFechaInicio.toISOString().slice(0, 10),
            renovada_de_id: ocupacionVieja.id_ocupacion,
        });
    };

    // Si llego desde el clic en la notificacion de "renovacion pendiente"
    // (?renovar_de=), retoma el pre-llenado aunque hayan pasado dias.
    useEffect(() => {
        if (renovarDesde) prefillRenovacion(renovarDesde);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renovarDesde]);

    const cambiarEstado = (estado) => {
        router.get(route('ocupaciones.index'), { estado }, { preserveState: true, replace: true });
    };

    const cambiarPagina = (page) => {
        router.get(route('ocupaciones.index'), { estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });
    };

    const personaSeleccionada = inquilinos.find((p) => String(p.id_persona) === String(data.id_persona));
    const personaYaTieneUsuario = personaSeleccionada?.user_exists ?? false;

    const startEdit = (o) => {
        setEditing(o.id_ocupacion);
        setData({ ...emptyForm, ...o, fecha_fin: o.fecha_fin ?? '' });
    };

    const startNew = () => { setEditing('new'); reset(); };

    // Convencion del negocio: todo contrato nuevo dura 6 meses exactos --
    // se sugiere la fecha de fin automaticamente, pero se puede editar.
    const sumarSeisMeses = (fechaInicioStr) => {
        if (!fechaInicioStr) return '';
        const d = new Date(`${fechaInicioStr}T00:00:00`);
        d.setMonth(d.getMonth() + 6);
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
    };

    const cambiarFechaInicio = (value) => {
        setData((current) => ({ ...current, fecha_inicio: value, fecha_fin: sumarSeisMeses(value) }));
    };

    const cambiarUnidad = (idUnidad) => {
        const unidad = unidades.find((u) => String(u.id_unidad) === String(idUnidad));
        setData((current) => ({
            ...current,
            id_unidad: idUnidad,
            monto_alquiler: unidad ? unidad.tarifa_alquiler_base : current.monto_alquiler,
            garantia: unidad ? unidad.tarifa_alquiler_base : current.garantia,
        }));
    };

    const anular = async (o) => {
        const ok = await confirmDialog({
            title: '¿Anular ocupación?',
            text: `${o.unidad?.codigo_unidad} — ${o.persona?.nombres} ${o.persona?.apellidos}. Úsalo solo si se registró por error.`,
            confirmText: 'Anular',
        });
        if (ok) router.patch(route('ocupaciones.anular', o.id_ocupacion));
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            post(route('ocupaciones.store'), { onSuccess: () => setEditing(null) });
        } else {
            patch(route('ocupaciones.update', editing), { onSuccess: () => setEditing(null) });
        }
    };

    const onFinalizado = (ocupacionVieja, motivo, fechaFin) => {
        if (motivo !== 'RENOVACION') return;
        prefillRenovacion(ocupacionVieja, fechaFin);
    };

    return (
        <AdminLayout title="Ocupaciones">
            <Head title="Ocupaciones" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <StatusTabs value={estadoFiltro} options={ESTADO_TABS} onChange={cambiarEstado} />
                {puede('ocupaciones.crear') && (
                    <button onClick={startNew} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Nueva ocupación
                    </button>
                )}
            </div>

            {editing && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
                    {data.renovada_de_id && (
                        <div className="col-span-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-primary sm:col-span-4">
                            Esta ocupación renueva el contrato anterior de esta unidad e inquilino. Ajusta los montos o fechas si cambiaron.
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Unidad *</label>
                        <select value={data.id_unidad} onChange={(e) => cambiarUnidad(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="">-- elegir --</option>
                            {unidades.map((u) => <option key={u.id_unidad} value={u.id_unidad}>{u.codigo_unidad} · {u.nombre_unidad}</option>)}
                        </select>
                        {errors.id_unidad && <p className="mt-1 text-xs text-danger">{errors.id_unidad}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Inquilino *</label>
                        <select value={data.id_persona} onChange={(e) => setData('id_persona', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="">-- elegir --</option>
                            {inquilinos.map((p) => <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellidos}</option>)}
                        </select>
                        {errors.id_persona && <p className="mt-1 text-xs text-danger">{errors.id_persona}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha inicio *</label>
                        <input type="date" value={data.fecha_inicio} onChange={(e) => cambiarFechaInicio(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.fecha_inicio && <p className="mt-1 text-xs text-danger">{errors.fecha_inicio}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha fin</label>
                        <input type="date" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        <p className="mt-1 text-xs text-gray-400">Se sugiere 6 meses desde el inicio; puedes ajustarla.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Monto alquiler (S/)</label>
                        <input type="number" step="0.01" value={data.monto_alquiler} onChange={(e) => setData('monto_alquiler', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Garantía (S/)</label>
                        <input type="number" step="0.01" value={data.garantia} onChange={(e) => setData('garantia', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    {editing !== 'new' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Estado</label>
                            <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                                <option value="ACTIVO">Activo</option>
                                <option value="FINALIZADO">Finalizado</option>
                                <option value="ANULADO">Anulado</option>
                            </select>
                            {errors.id_unidad && data.estado === 'ACTIVO' && <p className="mt-1 text-xs text-danger">{errors.id_unidad}</p>}
                        </div>
                    )}
                    {data.id_persona && (
                        <div className="col-span-2 rounded-lg border border-primary-light bg-primary-light/30 p-3 sm:col-span-4">
                            {personaYaTieneUsuario ? (
                                <p className="text-xs text-gray-600">Este inquilino ya tiene una cuenta de acceso al portal.</p>
                            ) : (
                                <>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={data.crear_usuario}
                                            onChange={(e) => setData('crear_usuario', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        Crear también su acceso al portal
                                    </label>
                                    {data.crear_usuario && (
                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Email de acceso (de su ficha)</label>
                                                {personaSeleccionada?.email ? (
                                                    <p className="mt-1 rounded-md bg-white px-3 py-1.5 text-sm text-gray-700">{personaSeleccionada.email}</p>
                                                ) : (
                                                    <p className="mt-1 text-xs text-danger">Sin email registrado — agrégaselo primero en Inquilinos.</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Contraseña inicial *</label>
                                                <input type="password" value={data.usuario_password} onChange={(e) => setData('usuario_password', e.target.value)} disabled={!personaSeleccionada?.email} className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-100" />
                                                {errors.usuario_password && <p className="mt-1 text-xs text-danger">{errors.usuario_password}</p>}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="col-span-2 flex gap-2 sm:col-span-4">
                        <button
                            type="submit"
                            disabled={processing || (data.crear_usuario && !personaSeleccionada?.email)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                        >
                            Guardar
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inquilino</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inicio</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Fin</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Alquiler</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ocupaciones.data.map((o) => (
                            <tr key={o.id_ocupacion}>
                                <td className="px-4 py-2 font-medium text-gray-800">{o.unidad?.codigo_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{o.persona?.nombres} {o.persona?.apellidos}</td>
                                <td className="px-4 py-2 text-gray-500">{formatDate(o.fecha_inicio)}</td>
                                <td className="px-4 py-2 text-gray-500">{formatDate(o.fecha_fin)}</td>
                                <td className="px-4 py-2 text-right text-gray-500">S/ {Number(o.monto_alquiler).toFixed(2)}</td>
                                <td className="px-4 py-2" title={o.motivo_fin === 'OTRO' ? o.motivo_fin_detalle : undefined}>
                                    <EstadoOcupacionBadge ocupacion={o} />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {puede('ocupaciones.crear') && (
                                            <IconButton icon={Pencil} label="Editar" variant="primary" onClick={() => startEdit(o)} />
                                        )}
                                        {puede('ocupaciones.finalizar') && o.estado === 'ACTIVO' && (
                                            <IconButton icon={UserX} label="Finalizar ocupación" variant="danger" onClick={() => setFinalizando(o)} />
                                        )}
                                        {puede('ocupaciones.finalizar') && o.estado === 'ACTIVO' && (
                                            <IconButton icon={Ban} label="Anular (se creó por error)" variant="danger" onClick={() => anular(o)} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination meta={ocupaciones} onPageChange={cambiarPagina} />
            </div>

            {finalizando && (
                <FinalizarModal ocupacion={finalizando} onClose={() => setFinalizando(null)} onFinalizado={onFinalizado} />
            )}
        </AdminLayout>
    );
}
