import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}
function number(value, decimals = 2) {
    return Number(value ?? 0).toFixed(decimals);
}

export default function Dashboard({ periodo, periodos, recibo, preview, stats }) {
    const filas = (preview?.data || []).filter((r) => r.participa_liquidacion);
    const totalConsumo = filas.reduce((acc, r) => acc + Number(r.consumo_kwh || 0), 0);

    const cambiarPeriodo = (id) => router.get(route('dashboard'), { periodo_id: id }, { preserveState: true });

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <select value={periodo.id_periodo} onChange={(e) => cambiarPeriodo(e.target.value)} className="rounded-lg border-gray-300 text-sm">
                    {periodos.map((p) => <option key={p.id_periodo} value={p.id_periodo}>{p.mes}/{p.anio} ({p.estado})</option>)}
                </select>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Total alquiler mensual" value={money(stats.total_alquiler)} desc={`Suma de las ${stats.total_ocupados} unidades ocupadas`} color="bg-success/10 text-success" />
                <KpiCard title="Luz distribuida" value={money(stats.total_luz)} desc="Resultado de la liquidación del recibo" color="bg-primary-light text-primary" />
                <KpiCard title="Consumo liquidado" value={`${number(totalConsumo)} kWh`} desc="Suma de consumos de unidades ocupadas" color="bg-amber-50 text-warning" />
                <KpiCard title="Cobro teórico del mes" value={money(stats.total_cobrar)} desc="Alquiler + agua fija + luz" color="bg-purple-50 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-800">Resumen operativo</h3>
                        <p className="text-xs text-gray-500">Vista rápida del recibo y del reparto mensual.</p>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniStat label="Suministro" value={recibo?.numero_suministro ?? '—'} />
                        <MiniStat label="Consumo general" value={`${number(recibo?.consumo_kwh_general)} kWh`} />
                        <MiniStat label="Consumo energía" value={money(recibo?.consumo_energia)} />
                        <MiniStat label="Total recibo" value={money(recibo?.total_recibo)} />
                    </div>

                    {filas.length === 0 ? (
                        <p className="py-4 text-sm text-gray-400">Sin datos. Genera la liquidación primero.</p>
                    ) : (
                        <div className="space-y-3">
                            {filas.map((row) => {
                                const pct = (Number(row.porcentaje_participacion || 0) * 100).toFixed(1);
                                return (
                                    <div key={row.id_unidad} className="rounded-lg border border-gray-100 p-3">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">Unidad {row.codigo_unidad}</span>
                                            <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs text-primary-dark">{row.inquilino?.split(' ')[0] ?? '—'}</span>
                                            <span className="ml-auto text-xs text-gray-400">{row.nombre_unidad}</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                            <div><p className="text-gray-400">Consumo</p><p className="font-medium text-gray-700">{number(row.consumo_kwh)} kWh</p></div>
                                            <div><p className="text-gray-400">Luz</p><p className="font-medium text-gray-700">{money(row.total_pagar_luz)}</p></div>
                                            <div><p className="text-gray-400">Alquiler</p><p className="font-medium text-gray-700">{money(row.monto_alquiler)}</p></div>
                                            <div><p className="text-gray-400">Total</p><p className="font-semibold text-gray-900">{money(row.total_cobrar)}</p></div>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                            <span>Participación</span>
                                            <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                                                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span>{pct}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="flex flex-col gap-4">
                    <section className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Composición del recibo</h3>
                        <div className="space-y-1.5 text-sm">
                            <CompRow label="Consumo de energía" value={recibo?.consumo_energia} />
                            <CompRow label="Cargo fijo" value={recibo?.cargo_fijo} />
                            <CompRow label="Mant. y reposición" value={recibo?.mant_reposicion} />
                            <CompRow label="Alumbrado público" value={recibo?.alumbrado_publico} />
                            <CompRow label="IGV" value={recibo?.igv} />
                            <CompRow label="Electrificación rural" value={recibo?.electrificacion_rural} />
                            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-semibold text-gray-900">
                                <span>Total a pagar</span><span>{money(recibo?.total_recibo)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-4">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Regla de cálculo</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />El consumo de energía se reparte según kWh consumidos por unidad.</li>
                            <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Los cargos comunes se distribuyen de forma equitativa entre las {filas.length} unidades ocupadas.</li>
                            <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />El cobro final del mes suma alquiler + luz + agua fija.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}

function KpiCard({ title, value, desc, color }) {
    return (
        <article className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
            <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${color}`}>{desc}</p>
        </article>
    );
}
function MiniStat({ label, value }) {
    return (
        <div className="rounded-lg bg-surface p-2 text-center">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-800">{value}</p>
        </div>
    );
}
function CompRow({ label, value }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <strong className="text-gray-800">{money(value)}</strong>
        </div>
    );
}
