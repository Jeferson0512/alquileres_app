import PortalLayout from '@/Layouts/PortalLayout';
import { Head } from '@inertiajs/react';

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function EstadoBadge({ estado }) {
    const styles = {
        PENDIENTE: 'bg-amber-50 text-warning',
        PARCIAL: 'bg-blue-50 text-primary',
        PAGADO: 'bg-green-50 text-success',
        ANULADO: 'bg-gray-100 text-gray-500',
    };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[estado] ?? ''}`}>{estado}</span>;
}

export default function Index({ persona, ocupacion, cobros, vencimiento }) {
    return (
        <PortalLayout title={`Hola, ${persona.nombres}`}>
            <Head title="Mi cuenta" />

            {vencimiento && (
                <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${vencimiento.nivel === 'URGENTE' ? 'bg-red-50 text-danger' : 'bg-amber-50 text-warning'}`}>
                    <strong>{vencimiento.nivel === 'URGENTE' ? 'Urgente' : 'Próximo a vencer'}:</strong> {vencimiento.mensaje}
                </div>
            )}

            {ocupacion && (
                <section className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-2 text-sm font-semibold text-gray-800">Mi unidad</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-gray-400">Unidad</p>
                            <p className="font-medium text-gray-800">{ocupacion.unidad?.codigo_unidad} · {ocupacion.unidad?.nombre_unidad}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Alquiler vigente</p>
                            <p className="font-medium text-gray-800">{money(ocupacion.monto_alquiler)}</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-800">Mi historial de cobros</h2>
                {cobros.length === 0 ? (
                    <p className="py-4 text-sm text-gray-400">Todavía no tienes cobros generados.</p>
                ) : (
                    <div className="space-y-3">
                        {cobros.map((c) => (
                            <div key={c.id_cobro} className="rounded-lg border border-gray-100 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-800">{String(c.mes).padStart(2, '0')}/{c.anio}</span>
                                    <EstadoBadge estado={c.estado_pago} />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div><p className="text-gray-400">Total</p><p className="font-semibold text-gray-900">{money(c.total_cobrar)}</p></div>
                                    <div><p className="text-gray-400">Pagado</p><p className="font-medium text-gray-700">{money(c.pagado_total)}</p></div>
                                    <div><p className="text-gray-400">Saldo</p><p className="font-medium text-gray-700">{money(c.saldo_pendiente)}</p></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </PortalLayout>
    );
}
