import Badge from '@/Components/Badge';
import IconButton from '@/Components/IconButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusTabs from '@/Components/StatusTabs';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmDialog from '@/lib/confirm';
import formatDate from '@/lib/date';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRightLeft, Ban, Layers, Pencil, Plus, UserX } from 'lucide-react';
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

// Mismo umbral "urgente" que ya usa AvisoService::vencimientosContrato() (≤7
// días) -- el mapa solo lo hace visible antes, en vez de esperar al aviso.
function diasParaVencer(fechaFin) {
    if (!fechaFin) return null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fin = new Date(`${String(fechaFin).slice(0, 10)}T00:00:00`);
    return Math.round((fin - hoy) / 86400000);
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
        <Modal show onClose={onClose} maxWidth="sm">
            <div className="p-5">
                <h3 className="mb-1 text-base font-semibold text-gray-800">Finalizar ocupación</h3>
                <p className="mb-4 text-sm text-gray-500">{ocupacion.unidad?.codigo_unidad} — {ocupacion.persona?.nombres} {ocupacion.persona?.apellidos}</p>

                <div className="mb-3">
                    <InputLabel htmlFor="fecha_fin_finalizar" value="Fecha de fin" />
                    <TextInput id="fecha_fin_finalizar" type="date" className="mt-1 block w-full" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
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
                        <InputLabel htmlFor="detalle_finalizar" value="Especifica el motivo *" />
                        <textarea
                            id="detalle_finalizar"
                            value={detalle}
                            onChange={(e) => setDetalle(e.target.value)}
                            rows={2}
                            placeholder="Ej. desalojo por incumplimiento de contrato"
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={submit} disabled={processing || detalleFaltante}>Confirmar</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

function OcupacionModal({ show, onClose, editando, data, setData, errors, processing, personaSeleccionada, personaYaTieneUsuario, unidades, inquilinos, cambiarUnidad, cambiarFechaInicio, submit }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">{editando === 'new' ? 'Nueva ocupación' : 'Editar ocupación'}</h2>

                {data.renovada_de_id && (
                    <div className="mt-3 rounded-lg bg-primary-light px-3 py-2 text-xs text-primary-dark">
                        Esta ocupación renueva el contrato anterior de esta unidad e inquilino. Ajustá los montos o fechas si cambiaron.
                    </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="id_unidad" value="Unidad *" />
                        <select id="id_unidad" value={data.id_unidad} onChange={(e) => cambiarUnidad(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary">
                            <option value="">-- elegir --</option>
                            {unidades.map((u) => <option key={u.id_unidad} value={u.id_unidad}>{u.codigo_unidad} · {u.nombre_unidad}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.id_unidad} />
                    </div>
                    <div>
                        <InputLabel htmlFor="id_persona" value="Inquilino *" />
                        <select id="id_persona" value={data.id_persona} onChange={(e) => setData('id_persona', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary">
                            <option value="">-- elegir --</option>
                            {inquilinos.map((p) => <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellidos}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.id_persona} />
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_inicio" value="Fecha inicio *" />
                        <TextInput id="fecha_inicio" type="date" className="mt-1 block w-full" value={data.fecha_inicio} onChange={(e) => cambiarFechaInicio(e.target.value)} />
                        <InputError className="mt-1" message={errors.fecha_inicio} />
                    </div>
                    <div>
                        <InputLabel htmlFor="fecha_fin" value="Fecha fin" />
                        <TextInput id="fecha_fin" type="date" className="mt-1 block w-full" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} />
                        {!errors.fecha_fin && <p className="mt-1 text-xs text-gray-400">Se sugiere 6 meses desde el inicio; podés ajustarla.</p>}
                        <InputError className="mt-1" message={errors.fecha_fin} />
                    </div>

                    <div>
                        <InputLabel htmlFor="monto_alquiler" value="Monto alquiler (S/)" />
                        <TextInput id="monto_alquiler" type="number" step="0.01" className="mt-1 block w-full" value={data.monto_alquiler} onChange={(e) => setData('monto_alquiler', e.target.value)} />
                    </div>
                    <div>
                        <InputLabel htmlFor="garantia" value="Garantía (S/)" />
                        <TextInput id="garantia" type="number" step="0.01" className="mt-1 block w-full" value={data.garantia} onChange={(e) => setData('garantia', e.target.value)} />
                    </div>

                    {editando !== 'new' && (
                        <div>
                            <InputLabel htmlFor="estado" value="Estado" />
                            <select id="estado" value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                <option value="ACTIVO">Activo</option>
                                <option value="FINALIZADO">Finalizado</option>
                                <option value="ANULADO">Anulado</option>
                            </select>
                            {data.estado === 'ACTIVO' && <InputError className="mt-1" message={errors.id_unidad} />}
                        </div>
                    )}
                </div>

                {data.id_persona && (
                    <div className="mt-4 rounded-lg border border-primary-light bg-primary-light/30 p-3">
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
                                            <InputLabel value="Email de acceso (de su ficha)" />
                                            {personaSeleccionada?.email ? (
                                                <p className="mt-1 rounded-md bg-white px-3 py-1.5 text-sm text-gray-700">{personaSeleccionada.email}</p>
                                            ) : (
                                                <p className="mt-1 text-xs text-danger">Sin email registrado — agrégaselo primero en Inquilinos.</p>
                                            )}
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="usuario_password" value="Contraseña inicial *" />
                                            <TextInput id="usuario_password" type="password" className="mt-1 block w-full" disabled={!personaSeleccionada?.email} value={data.usuario_password} onChange={(e) => setData('usuario_password', e.target.value)} />
                                            <InputError className="mt-1" message={errors.usuario_password} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing || (data.crear_usuario && !personaSeleccionada?.email)}>Guardar</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function TrasladoModal({ ocupacion, periodo, unidadesLibres, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        id_unidad_destino: '',
        fecha_traslado: periodo?.id_periodo ? new Date().toISOString().slice(0, 10) : '',
        lectura_corte_origen: '',
        lectura_corte_destino: '',
        monto_alquiler_destino: '',
        observacion: '',
        periodo_id: periodo?.id_periodo ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('ocupaciones.trasladar', ocupacion.id_ocupacion), { onSuccess: onClose });
    };

    return (
        <Modal show onClose={onClose} maxWidth="sm">
            <form onSubmit={submit} className="p-5">
                <h3 className="mb-1 text-base font-semibold text-gray-800">Trasladar a otra unidad</h3>
                <p className="mb-4 text-sm text-gray-500">
                    Desde: {ocupacion.unidad?.codigo_unidad} · {ocupacion.persona?.nombres} {ocupacion.persona?.apellidos}
                </p>

                {errors.general && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-danger">{errors.general}</p>}

                <div className="space-y-3">
                    <div>
                        <InputLabel htmlFor="id_unidad_destino" value="Hacia *" />
                        <select id="id_unidad_destino" value={data.id_unidad_destino} onChange={(e) => setData('id_unidad_destino', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary">
                            <option value="">-- elegir unidad --</option>
                            {unidadesLibres.map((u) => <option key={u.id_unidad} value={u.id_unidad}>{u.codigo_unidad} · {u.nombre_unidad}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.id_unidad_destino} />
                        {unidadesLibres.length === 0 && <p className="mt-1 text-xs text-warning">No hay unidades disponibles ahora mismo.</p>}
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_traslado" value="Fecha del traslado *" />
                        <TextInput id="fecha_traslado" type="date" min={periodo?.fecha_inicio} max={periodo?.fecha_fin} className="mt-1 block w-full" value={data.fecha_traslado} onChange={(e) => setData('fecha_traslado', e.target.value)} />
                        <InputError className="mt-1" message={errors.fecha_traslado} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-100 p-3">
                        <div>
                            <InputLabel htmlFor="lectura_corte_origen" value={`Lectura de ${ocupacion.unidad?.codigo_unidad ?? 'origen'} *`} />
                            <TextInput id="lectura_corte_origen" type="number" step="0.01" className="mt-1 block w-full" value={data.lectura_corte_origen} onChange={(e) => setData('lectura_corte_origen', e.target.value)} />
                            <InputError className="mt-1" message={errors.lectura_corte_origen} />
                        </div>
                        <div>
                            <InputLabel htmlFor="lectura_corte_destino" value="Lectura de la unidad nueva *" />
                            <TextInput id="lectura_corte_destino" type="number" step="0.01" className="mt-1 block w-full" value={data.lectura_corte_destino} onChange={(e) => setData('lectura_corte_destino', e.target.value)} />
                            <InputError className="mt-1" message={errors.lectura_corte_destino} />
                        </div>
                        <p className="col-span-2 text-xs text-gray-400">Lectura del medidor de cada unidad ese día — corte de salida y de entrada.</p>
                    </div>

                    <div>
                        <InputLabel htmlFor="monto_alquiler_destino" value="Alquiler en la unidad nueva (S/) *" />
                        <TextInput id="monto_alquiler_destino" type="number" step="0.01" className="mt-1 block w-full" value={data.monto_alquiler_destino} onChange={(e) => setData('monto_alquiler_destino', e.target.value)} />
                        <InputError className="mt-1" message={errors.monto_alquiler_destino} />
                        <p className="mt-1 text-xs text-gray-400">La garantía se traslada tal cual — no hace falta cargarla de nuevo.</p>
                    </div>

                    <div>
                        <InputLabel htmlFor="observacion_traslado" value="Observación" />
                        <TextInput id="observacion_traslado" className="mt-1 block w-full" value={data.observacion} onChange={(e) => setData('observacion', e.target.value)} />
                    </div>

                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-warning">
                        Este mes se generarán dos cobros (uno por cada unidad), cada uno prorrateado por los días que ocupó cada una.
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing || unidadesLibres.length === 0}>Confirmar traslado</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Index({ ocupaciones, unidades, inquilinos, estadoFiltro, renovarDesde, unidadesMapa, periodo }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [finalizando, setFinalizando] = useState(null);
    const [trasladando, setTrasladando] = useState(null);
    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (p) => auth.permissions.includes(p);
    const puedeTrasladar = puede('ocupaciones.crear') && puede('ocupaciones.finalizar') && periodo?.estado === 'ABIERTO';
    const unidadesLibres = unidadesMapa.filter((u) => !u.ocupacion_activa);

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

    const startNew = (idUnidadPreseleccionada) => {
        setEditing('new');
        reset();
        if (idUnidadPreseleccionada) cambiarUnidad(idUnidadPreseleccionada);
    };

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
        const onSuccess = () => setEditing(null);
        if (editing === 'new') {
            post(route('ocupaciones.store'), { onSuccess });
        } else {
            patch(route('ocupaciones.update', editing), { onSuccess });
        }
    };

    const onFinalizado = (ocupacionVieja, motivo, fechaFin) => {
        if (motivo !== 'RENOVACION') return;
        prefillRenovacion(ocupacionVieja, fechaFin);
    };

    const pisos = [...new Set(unidadesMapa.map((u) => u.piso))].sort((a, b) => a - b);
    const totalOcupadas = unidadesMapa.filter((u) => u.ocupacion_activa).length;

    return (
        <AdminLayout
            title="Mapa de unidades"
            description={`${unidadesMapa.length} unidades · ${pisos.length} pisos · ${totalOcupadas} ocupadas`}
            actions={puede('ocupaciones.crear') && (
                <button
                    type="button"
                    onClick={() => startNew()}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" /> Nueva ocupación
                </button>
            )}
        >
            <Head title="Ocupaciones" />

            <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-gray-200 bg-primary-light" />Ocupada</span>
                <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-dashed border-gray-300 bg-gray-50" />Disponible</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-warning" />Contrato vence &lt; 30 días</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-danger" />Vence ≤ 7 días — urgente</span>
            </div>

            <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                {pisos.map((piso) => (
                    <div key={piso}>
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                            <Layers className="h-3.5 w-3.5" /> Piso {piso}
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {unidadesMapa.filter((u) => u.piso === piso).map((u) => {
                                const ocup = u.ocupacion_activa;
                                const dias = ocup ? diasParaVencer(ocup.fecha_fin) : null;
                                const urgente = dias !== null && dias <= 7;
                                const proximaAVencer = dias !== null && dias > 7 && dias <= 30;
                                return (
                                    <button
                                        key={u.id_unidad}
                                        type="button"
                                        onClick={() => ocup
                                            ? setFinalizando({ ...ocup, unidad: { codigo_unidad: u.codigo_unidad } })
                                            : (puede('ocupaciones.crear') && startNew(u.id_unidad))}
                                        className={`rounded-lg border p-2.5 text-left transition-colors ${
                                            ocup
                                                ? `bg-primary-light/60 hover:bg-primary-light ${urgente ? 'border-danger ring-1 ring-danger' : proximaAVencer ? 'border-warning ring-1 ring-warning' : 'border-primary-light'}`
                                                : 'border-dashed border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary-light/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span className={`font-mono text-sm font-bold ${ocup ? 'text-gray-900' : 'text-gray-400'}`}>{u.codigo_unidad}</span>
                                            {urgente && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />}
                                            {proximaAVencer && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />}
                                        </div>
                                        {ocup ? (
                                            <>
                                                <div className="mt-1 truncate text-xs font-medium text-gray-700">{ocup.persona?.nombres} {ocup.persona?.apellidos}</div>
                                                <div className="text-[11px] text-gray-400">
                                                    {dias !== null ? (dias >= 0 ? `Vence en ${dias} días` : 'Vencido') : `Hasta ${formatDate(ocup.fecha_fin)}`}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mt-1 text-xs text-gray-400">Disponible</div>
                                                {puede('ocupaciones.crear') && (
                                                    <div className="flex items-center gap-0.5 text-[11px] font-medium text-primary"><Plus className="h-2.5 w-2.5" /> Ocupar</div>
                                                )}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {unidadesMapa.length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-400">Sin unidades activas todavía.</p>
                )}
            </div>

            <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-900">Detalle e historial</h2>
                <p className="text-sm text-gray-500">La tabla real, sin cambios de comportamiento.</p>
            </div>

            <div className="mb-4">
                <StatusTabs value={estadoFiltro} options={ESTADO_TABS} onChange={cambiarEstado} />
            </div>

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
                                        {puedeTrasladar && o.estado === 'ACTIVO' && (
                                            <IconButton icon={ArrowRightLeft} label="Trasladar a otra unidad" variant="primary" onClick={() => setTrasladando(o)} />
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
                        {ocupaciones.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                                    Sin ocupaciones en este filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination meta={ocupaciones} onPageChange={cambiarPagina} />
            </div>

            <OcupacionModal
                show={editing !== null}
                onClose={() => setEditing(null)}
                editando={editing}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                personaSeleccionada={personaSeleccionada}
                personaYaTieneUsuario={personaYaTieneUsuario}
                unidades={unidades}
                inquilinos={inquilinos}
                cambiarUnidad={cambiarUnidad}
                cambiarFechaInicio={cambiarFechaInicio}
                submit={submit}
            />

            {finalizando && (
                <FinalizarModal ocupacion={finalizando} onClose={() => setFinalizando(null)} onFinalizado={onFinalizado} />
            )}

            {trasladando && (
                <TrasladoModal ocupacion={trasladando} periodo={periodo} unidadesLibres={unidadesLibres} onClose={() => setTrasladando(null)} />
            )}
        </AdminLayout>
    );
}
