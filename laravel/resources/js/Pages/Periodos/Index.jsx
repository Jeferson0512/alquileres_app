import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function Badge({ estado }) {
    const styles = {
        ABIERTO: 'bg-primary-light text-primary-dark',
        CERRADO: 'bg-gray-100 text-gray-600',
        ANULADO: 'bg-red-50 text-danger',
    };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[estado] ?? 'bg-gray-100 text-gray-600'}`}>
            {estado}
        </span>
    );
}

export default function Index({ periodos }) {
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        anio: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        fecha_inicio: '',
        fecha_fin: '',
        observacion: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('periodos.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    return (
        <AdminLayout title="Periodos">
            <Head title="Periodos" />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}

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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {periodos.map((p) => (
                            <tr key={p.id_periodo}>
                                <td className="px-4 py-2 font-medium text-gray-800">{p.mes}/{p.anio}</td>
                                <td className="px-4 py-2 text-gray-500">{p.fecha_inicio}</td>
                                <td className="px-4 py-2 text-gray-500">{p.fecha_fin}</td>
                                <td className="px-4 py-2"><Badge estado={p.estado} /></td>
                                <td className="px-4 py-2 text-gray-500">{p.observacion ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
