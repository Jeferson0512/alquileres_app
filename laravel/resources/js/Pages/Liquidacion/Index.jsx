import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ periodo, periodos, meta, data }) {
    const { flash, errors, auth } = usePage().props;
    const puedeGenerar = auth.permissions.includes('liquidacion.generar');
    const [ajustes, setAjustes] = useState(() => Object.fromEntries((data || []).map((r) => [r.id_unidad, r.ajuste])));

    const cambiarPeriodo = (id) => router.get(route('liquidacion.index'), { periodo_id: id }, { preserveState: true });

    const generar = () => {
        const payload = Object.entries(ajustes).map(([id_unidad, ajuste]) => ({ id_unidad: Number(id_unidad), ajuste: parseFloat(ajuste) || 0 }));
        router.post(route('liquidacion.generar'), { periodo_id: periodo.id_periodo, ajustes: payload });
    };

    return (
        <AdminLayout title="Liquidación de luz">
            <Head title="Liquidación" />

            {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}
            {errors?.general && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{errors.general}</div>}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <select value={periodo.id_periodo} onChange={(e) => cambiarPeriodo(e.target.value)} className="rounded-lg border-gray-300 text-sm">
                    {periodos.map((p) => <option key={p.id_periodo} value={p.id_periodo}>{p.mes}/{p.anio} ({p.estado})</option>)}
                </select>
                {puedeGenerar && periodo.estado === 'ABIERTO' && (
                    <button onClick={generar} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Generar liquidación
                    </button>
                )}
            </div>

            {meta && (
                <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:grid-cols-4">
                    <div><span className="text-gray-500">Precio kWh:</span> <span className="font-medium">S/ {Number(meta.precio_kwh).toFixed(4)}</span></div>
                    <div><span className="text-gray-500">Consumo total:</span> <span className="font-medium">S/ {Number(meta.monto_consumo_total).toFixed(2)}</span></div>
                    <div><span className="text-gray-500">Gasto común (dif.):</span> <span className="font-medium">S/ {Number(meta.diferencia_comun).toFixed(2)}</span></div>
                    <div><span className="text-gray-500">Unidades liquidadas:</span> <span className="font-medium">{meta.total_unidades_liquidadas} / {meta.total_unidades}</span></div>
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Consumo</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">%</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Consumo S/</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Gasto común</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Ajuste</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Total luz</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Total cobrar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(data || []).map((r) => (
                            <tr key={r.id_unidad} className={r.participa_liquidacion ? '' : 'opacity-50'}>
                                <td className="px-4 py-2 font-medium text-gray-800">{r.codigo_unidad} · {r.inquilino}</td>
                                <td className="px-4 py-2 text-gray-500">{r.estado_unidad}</td>
                                <td className="px-4 py-2 text-right text-gray-500">{r.consumo_kwh.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right text-gray-500">{(r.porcentaje_participacion * 100).toFixed(2)}%</td>
                                <td className="px-4 py-2 text-right text-gray-500">{Number(r.monto_consumo).toFixed(2)}</td>
                                <td className="px-4 py-2 text-right text-gray-500">{Number(r.gasto_comun).toFixed(2)}</td>
                                <td className="px-4 py-2 text-right">
                                    {r.participa_liquidacion && periodo.estado === 'ABIERTO' ? (
                                        <input type="number" step="0.01" value={ajustes[r.id_unidad] ?? 0}
                                            onChange={(e) => setAjustes((a) => ({ ...a, [r.id_unidad]: e.target.value }))}
                                            className="w-24 rounded-md border-gray-300 text-right text-sm" />
                                    ) : Number(r.ajuste).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-right font-medium text-gray-700">{Number(r.total_pagar_luz).toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-semibold text-primary">{Number(r.total_cobrar).toFixed(2)}</td>
                            </tr>
                        ))}
                        {(!data || data.length === 0) && (
                            <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">Sin recibo o lecturas para este periodo todavía.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
