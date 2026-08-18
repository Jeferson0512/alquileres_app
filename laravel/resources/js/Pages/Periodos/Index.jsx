import Badge from '@/Components/Badge';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import MESES from '@/lib/meses';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Lock, Pencil, Plus, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

const ESTADO_VARIANTS = { ABIERTO: 'info', CERRADO: 'gray', ANULADO: 'danger' };

function addDias(fecha, dias) {
    const d = new Date(`${String(fecha).slice(0, 10)}T00:00:00`);
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
}
function fmt(fecha) {
    if (!fecha) return '—';
    return new Date(`${String(fecha).slice(0, 10)}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtLargo(fecha) {
    return new Date(`${String(fecha).slice(0, 10)}T00:00:00`).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function NuevoPeriodoModal({ show, onClose, ultimoPeriodo }) {
    const inicioSugerido = ultimoPeriodo ? addDias(ultimoPeriodo.fecha_fin, 1) : '';
    const fechaBase = inicioSugerido ? new Date(`${inicioSugerido}T00:00:00`) : new Date();

    const { data, setData, post, processing, errors, reset } = useForm({
        anio: fechaBase.getFullYear(),
        mes: fechaBase.getMonth() + 1,
        fecha_inicio: inicioSugerido,
        fecha_fin: '',
        observacion: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('periodos.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Nuevo periodo</h2>
                <p className="mt-1 text-sm text-gray-500">
                    {ultimoPeriodo
                        ? `Se crea a continuación de ${MESES[ultimoPeriodo.mes - 1]} ${ultimoPeriodo.anio}.`
                        : 'Este será el primer periodo registrado.'}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="anio" value="Año" />
                        <TextInput id="anio" type="number" className="mt-1 block w-full" value={data.anio} onChange={(e) => setData('anio', e.target.value)} />
                        <InputError className="mt-1" message={errors.anio} />
                    </div>
                    <div>
                        <InputLabel htmlFor="mes" value="Mes" />
                        <select
                            id="mes"
                            value={data.mes}
                            onChange={(e) => setData('mes', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        >
                            {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.mes} />
                    </div>
                </div>

                {inicioSugerido && (
                    <div className="mt-4 flex gap-2.5 rounded-lg bg-primary-light p-3 text-xs text-primary-dark">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>
                            Empieza el <strong className="font-mono">{fmtLargo(inicioSugerido)}</strong> — el día siguiente al fin de {MESES[ultimoPeriodo.mes - 1]} {ultimoPeriodo.anio}.
                            No se puede cambiar: así se garantiza que nunca queden huecos ni superposiciones entre periodos.
                        </p>
                    </div>
                )}
                <InputError className="mt-2" message={errors.fecha_inicio} />

                <div className="mt-4">
                    <InputLabel htmlFor="fecha_fin" value="Fin (opcional)" />
                    <TextInput id="fecha_fin" type="date" className="mt-1 block w-full" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} />
                    <p className="mt-1 text-xs text-gray-400">Si la dejás vacía, se calcula como un mes exacto desde el inicio (ej. 15 a 14).</p>
                    <InputError className="mt-1" message={errors.fecha_fin} />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="observacion" value="Observación (opcional)" />
                    <textarea
                        id="observacion"
                        rows={2}
                        value={data.observacion}
                        onChange={(e) => setData('observacion', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                    />
                </div>

                {ultimoPeriodo && ultimoPeriodo.estado === 'ABIERTO' && (
                    <div className="mt-4 flex gap-2.5 border-t border-gray-100 pt-4 text-xs text-gray-500">
                        <RefreshCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>
                            Al crear este periodo, <strong className="text-gray-700">{MESES[ultimoPeriodo.mes - 1]} {ultimoPeriodo.anio} se cierra automáticamente</strong> en
                            la misma operación — no hace falta un paso aparte.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>Crear periodo</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function EditarPeriodoModal({ periodo, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        fecha_fin: periodo ? periodo.fecha_fin.slice(0, 10) : '',
        observacion: periodo?.observacion ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('periodos.update', periodo.id_periodo), { onSuccess: onClose });
    };

    return (
        <Modal show={periodo !== null} onClose={onClose} maxWidth="md">
            {periodo && (
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Editar periodo · {MESES[periodo.mes - 1]} {periodo.anio}</h2>
                    <p className="mt-1 text-sm text-gray-500">Solo se puede ajustar el fin y la observación.</p>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-surface p-2.5">
                            <p className="text-xs text-gray-400">Inicio</p>
                            <p className="font-mono text-sm font-semibold text-gray-700">{fmt(periodo.fecha_inicio)}</p>
                        </div>
                        <div className="rounded-lg bg-surface p-2.5">
                            <p className="text-xs text-gray-400">Estado</p>
                            <p className="text-sm font-semibold text-gray-700">{periodo.estado}</p>
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2.5 rounded-lg bg-primary-light p-3 text-xs text-primary-dark">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>Año, mes e inicio quedan fijos una vez creado el periodo — cambiarlos podría abrir un hueco o una superposición con el periodo vecino.</p>
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="edit_fecha_fin" value="Fin" />
                        <TextInput id="edit_fecha_fin" type="date" className="mt-1 block w-full" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} />
                        <InputError className="mt-1" message={errors.fecha_fin} />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="edit_observacion" value="Observación" />
                        <textarea
                            id="edit_observacion"
                            rows={2}
                            value={data.observacion}
                            onChange={(e) => setData('observacion', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar cambios</PrimaryButton>
                    </div>
                </form>
            )}
        </Modal>
    );
}

export default function Index({ periodos }) {
    const { auth } = usePage().props;
    const puedeEditar = auth.permissions.includes('periodos.cerrar');
    const [nuevoAbierto, setNuevoAbierto] = useState(false);
    const [editando, setEditando] = useState(null);

    // "Último periodo" con el mismo criterio que PeriodoService::crear() --
    // el de fecha_fin más reciente entre los no anulados, no simplemente
    // el primero de la lista (que ordena por año/mes, no por fecha_fin).
    const ultimoPeriodo = periodos
        .filter((p) => p.estado !== 'ANULADO')
        .reduce((max, p) => (!max || p.fecha_fin > max.fecha_fin ? p : max), null);

    return (
        <AdminLayout
            title="Periodos"
            description="Ciclos de facturación mensuales, en orden — cada uno empieza justo donde termina el anterior."
            actions={puedeEditar && (
                <button
                    type="button"
                    onClick={() => setNuevoAbierto(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" /> Nuevo periodo
                </button>
            )}
        >
            <Head title="Periodos" />

            <div className="relative">
                {periodos.map((p, i) => {
                    const isLast = i === periodos.length - 1;
                    const isOpen = p.estado === 'ABIERTO';
                    const isAnulado = p.estado === 'ANULADO';
                    return (
                        <div key={p.id_periodo} className="relative pb-5 pl-9 last:pb-0">
                            {!isLast && <span className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-gray-200" />}
                            <span
                                className={`absolute left-0 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white ${
                                    isOpen ? 'border-primary' : isAnulado ? 'border-danger bg-danger-tint' : 'border-gray-300'
                                }`}
                            >
                                {isOpen && <span className="h-2 w-2 rounded-full bg-primary" />}
                            </span>

                            <div className={`rounded-lg border bg-white p-4 shadow-sm ${isOpen ? 'border-primary' : 'border-gray-200'} ${isAnulado ? 'opacity-70' : ''}`}>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{MESES[p.mes - 1]} {p.anio}</p>
                                        <p className="font-mono text-xs text-gray-400">{fmt(p.fecha_inicio)} → {fmt(p.fecha_fin)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={ESTADO_VARIANTS[p.estado] ?? 'gray'}>{p.estado}</Badge>
                                        {puedeEditar && !isAnulado && (
                                            <button
                                                type="button"
                                                title="Editar fin y observación"
                                                aria-label="Editar"
                                                onClick={() => setEditando(p)}
                                                className="inline-flex rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {p.observacion && <p className="mt-2 text-xs text-gray-500">{p.observacion}</p>}
                            </div>
                        </div>
                    );
                })}

                {periodos.length === 0 && (
                    <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">Sin periodos registrados todavía.</p>
                )}
            </div>

            <NuevoPeriodoModal show={nuevoAbierto} onClose={() => setNuevoAbierto(false)} ultimoPeriodo={ultimoPeriodo} />
            {/* key fuerza un remount con cada periodo distinto -- si no, useForm()
                se queda con el estado inicial (vacío) del primer render, de
                cuando `editando` todavía era null. */}
            <EditarPeriodoModal key={editando?.id_periodo ?? 'none'} periodo={editando} onClose={() => setEditando(null)} />
        </AdminLayout>
    );
}
