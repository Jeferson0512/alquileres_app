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

            <div className="overflow-x-auto rounded-[13px] border border-border bg-surface shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surface-2">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Fecha</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Contacto</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Unidad</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Mensaje</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {consultas.map((c) => (
                            <tr key={c.id}>
                                <td className="whitespace-nowrap px-4 py-2.5 text-muted">{new Date(c.created_at).toLocaleDateString('es-PE')}</td>
                                <td className="px-4 py-2.5 font-semibold text-ink">{c.name}</td>
                                <td className="px-4 py-2.5 text-muted">
                                    {c.email && <div>{c.email}</div>}
                                    {c.phone && <div>{c.phone}</div>}
                                </td>
                                <td className="px-4 py-2.5 text-muted">{c.unidad ? `${c.unidad.codigo_unidad} — ${c.unidad.nombre_unidad}` : '—'}</td>
                                <td className="max-w-xs px-4 py-2.5 text-muted">{c.message}</td>
                                <td className="px-4 py-2.5">
                                    {puedeGestionar ? (
                                        <select value={c.status} onChange={(e) => cambiarEstado(c, e.target.value)} className="rounded-md border-border bg-surface text-xs text-ink">
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
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-2">Todavía no hay consultas.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
