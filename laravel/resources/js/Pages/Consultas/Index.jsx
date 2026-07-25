import Badge from '@/Components/Badge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';

const ESTADO_VARIANTS = { NUEVO: 'info', CONTACTADO: 'success', DESCARTADO: 'gray' };

function EstadoBadge({ estado }) {
    return <Badge variant={ESTADO_VARIANTS[estado] ?? 'gray'}>{estado}</Badge>;
}

export default function Index({ consultas }) {
    const { auth } = usePage().props;
    const puedeGestionar = auth.permissions.includes('consultas.gestionar');

    const cambiarEstado = (consulta, status) => {
        router.patch(route('consultas.update', consulta.id), { status }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Consultas">
            <Head title="Consultas" />

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Fecha</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Nombre</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Contacto</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Mensaje</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {consultas.map((c) => (
                            <tr key={c.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-500">{new Date(c.created_at).toLocaleDateString('es-PE')}</td>
                                <td className="px-4 py-2 font-medium text-gray-800">{c.name}</td>
                                <td className="px-4 py-2 text-gray-500">
                                    {c.email && <div>{c.email}</div>}
                                    {c.phone && <div>{c.phone}</div>}
                                </td>
                                <td className="px-4 py-2 text-gray-500">{c.unidad ? `${c.unidad.codigo_unidad} — ${c.unidad.nombre_unidad}` : '—'}</td>
                                <td className="max-w-xs px-4 py-2 text-gray-600">{c.message}</td>
                                <td className="px-4 py-2">
                                    {puedeGestionar ? (
                                        <select value={c.status} onChange={(e) => cambiarEstado(c, e.target.value)} className="rounded-md border-gray-300 text-xs">
                                            <option value="NUEVO">Nuevo</option>
                                            <option value="CONTACTADO">Contactado</option>
                                            <option value="DESCARTADO">Descartado</option>
                                        </select>
                                    ) : (
                                        <EstadoBadge estado={c.status} />
                                    )}
                                </td>
                            </tr>
                        ))}
                        {consultas.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Todavía no hay consultas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
