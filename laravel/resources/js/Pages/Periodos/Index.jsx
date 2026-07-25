import Badge from '@/Components/Badge';
import AdminLayout from '@/Layouts/AdminLayout';
import fmtDate from '@/lib/date';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { Fragment, useState } from 'react';

const ESTADO_VARIANTS = { ABIERTO: 'info', CERRADO: 'gray', ANULADO: 'danger' };

function EstadoBadge({ estado }) {
    return <Badge variant={ESTADO_VARIANTS[estado] ?? 'gray'}>{estado}</Badge>;
}

export default function Index({ periodos }) {
    const { auth } = usePage().props;
    const puedeEditar = auth.permissions.includes('periodos.cerrar');
    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        anio: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        fecha_inicio: '',
        fecha_fin: '',
        observacion: '',
    });

    const editForm = useForm({ fecha_fin: '', observacion: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('periodos.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const startEdit = (p) => {
        setEditando(p.id_periodo);
        editForm.setData({ fecha_fin: p.fecha_fin ? p.fecha_fin.slice(0, 10) : '', observacion: p.observacion ?? '' });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        editForm.patch(route('periodos.update', editando), {
            onSuccess: () => setEditando(null),
        });
    };

    return (
        <AdminLayout title="Periodos">
            <Head title="Periodos" />

            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Ciclos de facturación mensuales. El nuevo periodo debe empezar justo el día siguiente al cierre del último.</p>
                <button
                    type="button"
                    onClick={() => setShowForm((v) => !v)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                    {showForm ? 'Cancelar' : 'Nuevo periodo'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Año</label>
                        <input type="number" value={data.anio} onChange={(e) => setData('anio', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.anio && <p className="mt-1 text-xs text-danger">{errors.anio}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Mes</label>
                        <input type="number" min="1" max="12" value={data.mes} onChange={(e) => setData('mes', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.mes && <p className="mt-1 text-xs text-danger">{errors.mes}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha inicio (opcional)</label>
                        <input type="date" value={data.fecha_inicio} onChange={(e) => setData('fecha_inicio', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.fecha_inicio && <p className="mt-1 text-xs text-danger">{errors.fecha_inicio}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha fin (opcional)</label>
                        <input type="date" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.fecha_fin && <p className="mt-1 text-xs text-danger">{errors.fecha_fin}</p>}
                        <p className="mt-1 text-xs text-gray-400">Si la dejas vacía, se calcula como un mes exacto desde el inicio (ej. 15 a 14).</p>
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                        <label className="block text-xs font-medium text-gray-500">Observación</label>
                        <input type="text" value={data.observacion} onChange={(e) => setData('observacion', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div className="col-span-2 sm:col-span-4">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Periodo</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inicio</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Fin</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Observación</th>
                            {puedeEditar && <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {periodos.map((p) => (
                            <Fragment key={p.id_periodo}>
                                <tr>
                                    <td className="px-4 py-2 font-medium text-gray-800">{p.mes}/{p.anio}</td>
                                    <td className="px-4 py-2 text-gray-500">{fmtDate(p.fecha_inicio)}</td>
                                    <td className="px-4 py-2 text-gray-500">{fmtDate(p.fecha_fin)}</td>
                                    <td className="px-4 py-2"><EstadoBadge estado={p.estado} /></td>
                                    <td className="px-4 py-2 text-gray-500">{p.observacion ?? '-'}</td>
                                    {puedeEditar && (
                                        <td className="px-4 py-2 text-right">
                                            <button
                                                type="button"
                                                title="Editar fecha de fin y observación"
                                                aria-label="Editar"
                                                onClick={() => startEdit(p)}
                                                className="inline-flex rounded-md p-1.5 text-primary hover:bg-gray-100 hover:text-primary-dark"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                                {editando === p.id_periodo && (
                                    <tr>
                                        <td colSpan={6} className="bg-surface px-4 py-3">
                                            <form onSubmit={submitEdit} className="flex flex-wrap items-end gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500">Fecha fin</label>
                                                    <input
                                                        type="date"
                                                        value={editForm.data.fecha_fin}
                                                        onChange={(e) => editForm.setData('fecha_fin', e.target.value)}
                                                        className="mt-1 rounded-md border-gray-300 text-sm"
                                                    />
                                                    {editForm.errors.fecha_fin && <p className="mt-1 text-xs text-danger">{editForm.errors.fecha_fin}</p>}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-gray-500">Observación</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.data.observacion}
                                                        onChange={(e) => editForm.setData('observacion', e.target.value)}
                                                        className="mt-1 w-full rounded-md border-gray-300 text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button type="submit" disabled={editForm.processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                                                        Guardar
                                                    </button>
                                                    <button type="button" onClick={() => setEditando(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </form>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
