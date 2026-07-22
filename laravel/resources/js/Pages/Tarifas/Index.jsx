import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ tarifas }) {
    const { flash, auth } = usePage().props;
    const [editing, setEditing] = useState(null);
    const { data, setData, patch, processing, errors } = useForm({ descripcion: '', monto: 0, activo: true });

    const puede = auth.permissions.includes('tarifas.editar');

    const startEdit = (t) => {
        setEditing(t.id_tarifa);
        setData({ descripcion: t.descripcion ?? '', monto: t.monto, activo: !!t.activo });
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('tarifas.update', editing), { onSuccess: () => setEditing(null) });
    };

    return (
        <AdminLayout title="Tarifas">
            <Head title="Tarifas" />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}

            <p className="mb-4 text-sm text-gray-500">Montos de agua, gas, mantenimiento y demás servicios por unidad. Cada cambio queda auditado.</p>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Servicio</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Descripción</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Monto</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Activo</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tarifas.map((t) => (
                            <tr key={t.id_tarifa}>
                                <td className="px-4 py-2 font-medium text-gray-800">{t.servicio}</td>
                                <td className="px-4 py-2 text-gray-500">
                                    {editing === t.id_tarifa ? (
                                        <input value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} className="w-full rounded-md border-gray-300 text-sm" />
                                    ) : (t.descripcion ?? '-')}
                                </td>
                                <td className="px-4 py-2 text-right text-gray-500">
                                    {editing === t.id_tarifa ? (
                                        <input type="number" step="0.01" value={data.monto} onChange={(e) => setData('monto', e.target.value)} className="w-28 rounded-md border-gray-300 text-right text-sm" />
                                    ) : `S/ ${Number(t.monto).toFixed(2)}`}
                                </td>
                                <td className="px-4 py-2">
                                    {editing === t.id_tarifa ? (
                                        <input type="checkbox" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} />
                                    ) : (
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.activo ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-600'}`}>
                                            {t.activo ? 'Sí' : 'No'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {editing === t.id_tarifa ? (
                                        <form onSubmit={submit} className="inline-flex gap-2">
                                            <button type="submit" disabled={processing} className="text-sm font-medium text-primary hover:text-primary-dark">Guardar</button>
                                            <button type="button" onClick={() => setEditing(null)} className="text-sm font-medium text-gray-500">Cancelar</button>
                                        </form>
                                    ) : puede && (
                                        <button onClick={() => startEdit(t)} className="text-sm font-medium text-primary hover:text-primary-dark">Editar</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
