import Badge from '@/Components/Badge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ tarifas }) {
    const { auth } = usePage().props;
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

            <p className="mb-4 text-sm text-muted">Montos de agua, gas, mantenimiento y demás servicios por unidad. Cada cambio queda auditado.</p>

            <div className="overflow-x-auto rounded-[13px] border border-border bg-surface shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surface-2">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Servicio</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Descripción</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Monto</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Activo</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {tarifas.map((t) => (
                            <tr key={t.id_tarifa}>
                                <td className="px-4 py-2.5 font-semibold text-ink">{t.servicio}</td>
                                <td className="px-4 py-2.5 text-muted">
                                    {editing === t.id_tarifa ? (
                                        <input value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} className="w-full rounded-md border-border bg-surface text-sm text-ink" />
                                    ) : (t.descripcion ?? '-')}
                                </td>
                                <td className="px-4 py-2.5 text-right font-mono text-muted">
                                    {editing === t.id_tarifa ? (
                                        <input type="number" step="0.01" value={data.monto} onChange={(e) => setData('monto', e.target.value)} className="w-28 rounded-md border-border bg-surface text-right font-mono text-sm text-ink" />
                                    ) : `S/ ${Number(t.monto).toFixed(2)}`}
                                </td>
                                <td className="px-4 py-2.5">
                                    {editing === t.id_tarifa ? (
                                        <input type="checkbox" checked={data.activo} onChange={(e) => setData('activo', e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                    ) : (
                                        <Badge variant={t.activo ? 'info' : 'gray'}>{t.activo ? 'Sí' : 'No'}</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    {editing === t.id_tarifa ? (
                                        <form onSubmit={submit} className="inline-flex gap-2">
                                            <button type="submit" disabled={processing} className="text-sm font-medium text-primary hover:text-primary-dark">Guardar</button>
                                            <button type="button" onClick={() => setEditing(null)} className="text-sm font-medium text-muted">Cancelar</button>
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
