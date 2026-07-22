import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import Chart from 'react-apexcharts';

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}
function number(value, decimals = 2) {
    return Number(value ?? 0).toFixed(decimals);
}

const CHART_COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626'];

export default function Dashboard({ periodo, periodos, recibo, preview, stats, tendencia, estadoCobros, morosidadTotal, vencimientosContrato, consumoAnterior }) {
    const filas = (preview?.data || []).filter((r) => r.participa_liquidacion);
    const totalConsumo = filas.reduce((acc, r) => acc + Number(r.consumo_kwh || 0), 0);

    const cambiarPeriodo = (id) => router.get(route('dashboard'), { periodo_id: id }, { preserveState: true });

    const tendenciaOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS[0]],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        xaxis: { categories: tendencia.map((t) => t.label), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { formatter: (v) => `S/ ${Number(v).toFixed(0)}` } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => money(v) } },
    };
    const tendenciaSeries = [{ name: 'Total cobrado', data: tendencia.map((t) => t.total) }];

    const estadoLabels = ['Pendiente', 'Parcial', 'Pagado'];
    const estadoData = [estadoCobros.PENDIENTE, estadoCobros.PARCIAL, estadoCobros.PAGADO];
    const estadoOptions = {
        chart: { fontFamily: 'inherit' },
        labels: estadoLabels,
        colors: [CHART_COLORS[2], CHART_COLORS[0], CHART_COLORS[1]],
        legend: { position: 'bottom' },
        dataLabels: { enabled: true, formatter: (v) => `${v.toFixed(0)}%` },
        plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Cobros' } } } } },
    };

    const consumoOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: ['#cbd5e1', CHART_COLORS[2]],
        plotOptions: { bar: { borderRadius: 4, columnWidth: '65%' } },
        dataLabels: { enabled: false },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
        xaxis: { categories: filas.map((f) => f.codigo_unidad), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { formatter: (v) => `${Number(v).toFixed(0)} kWh` } },
        grid: { borderColor: '#f1f5f9' },
    };
    const consumoSeries = [
        { name: 'Mes anterior', data: filas.map((f) => Number(consumoAnterior[f.id_unidad] ?? 0)) },
        { name: 'Este mes', data: filas.map((f) => Number(f.consumo_kwh || 0)) },
    ];

    function tendenciaConsumo(row) {
        const anterior = Number(consumoAnterior[row.id_unidad] ?? 0);
        const actual = Number(row.consumo_kwh || 0);
        const diff = actual - anterior;
        if (anterior === 0 || Math.abs(diff) < 0.05) return { Icon: Minus, color: 'text-gray-400', text: 'Igual que el mes anterior' };
        if (diff > 0) return { Icon: TrendingUp, color: 'text-danger', text: `+${number(diff, 1)} kWh vs. mes anterior` };
        return { Icon: TrendingDown, color: 'text-success', text: `${number(diff, 1)} kWh vs. mes anterior` };
    }

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <select value={periodo.id_periodo} onChange={(e) => cambiarPeriodo(e.target.value)} className="rounded-lg border-gray-300 text-sm">
                    {periodos.map((p) => <option key={p.id_periodo} value={p.id_periodo}>{p.mes}/{p.anio} ({p.estado})</option>)}
                </select>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <KpiCard title="Total alquiler mensual" value={money(stats.total_alquiler)} desc={`Suma de las ${stats.total_ocupados} unidades ocupadas`} color="bg-success/10 text-success" />
                <KpiCard title="Luz distribuida" value={money(stats.total_luz)} desc="Resultado de la liquidación del recibo" color="bg-primary-light text-primary" />
                <KpiCard title="Consumo liquidado" value={`${number(totalConsumo)} kWh`} desc="Suma de consumos de unidades ocupadas" color="bg-amber-50 text-warning" />
                <KpiCard title="Cobro teórico del mes" value={money(stats.total_cobrar)} desc="Alquiler + agua fija + luz" color="bg-purple-50 text-purple-600" />
                <KpiCard title="Morosidad total" value={money(morosidadTotal)} desc="Deuda anterior acumulada" color="bg-red-50 text-danger" />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">Tendencia de cobros (últimos {tendencia.length} periodos)</h3>
                    {tendencia.length > 0 ? (
                        <Chart options={tendenciaOptions} series={tendenciaSeries} type="area" height={260} />
                    ) : (
                        <p className="py-8 text-center text-sm text-gray-400">Sin periodos suficientes todavía.</p>
                    )}
                </section>
                <section className="rounded-lg border border-gray-200 bg-white p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">Estado de cobros del periodo</h3>
                    {estadoData.some((v) => v > 0) ? (
                        <Chart options={estadoOptions} series={estadoData} type="donut" height={260} />
                    ) : (
                        <p className="py-8 text-center text-sm text-gray-400">Sin cobros generados para este periodo.</p>
                    )}
                </section>
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
                        <>
                            <div className="mb-4">
                                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Consumo por unidad — este mes vs. mes anterior</h4>
                                <Chart options={consumoOptions} series={consumoSeries} type="bar" height={220} />
                            </div>

                            <div className="space-y-3">
                                {filas.map((row) => {
                                    const pct = (Number(row.porcentaje_participacion || 0) * 100).toFixed(1);
                                    const { Icon, color, text } = tendenciaConsumo(row);
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
                                            <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${color}`}>
                                                <Icon className="h-3.5 w-3.5" /> {text}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
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

                    {vencimientosContrato.length > 0 && (
                        <section className="rounded-lg border border-gray-200 bg-white p-4">
                            <h3 className="mb-3 text-sm font-semibold text-gray-800">Contratos por vencer</h3>
                            <div className="space-y-2">
                                {vencimientosContrato.map((aviso) => {
                                    const urgente = aviso.nivel === 'URGENTE';
                                    return (
                                        <div key={aviso.id_referencia} className={`flex items-center gap-3 rounded-lg border-l-4 bg-surface p-3 ${urgente ? 'border-danger' : 'border-warning'}`}>
                                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${urgente ? 'bg-red-100 text-danger' : 'bg-amber-100 text-warning'}`}>
                                                {urgente ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-800">{aviso.inquilino}</p>
                                                <p className="text-xs text-gray-400">Unidad {aviso.codigo_unidad}</p>
                                            </div>
                                            <div className={`shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-bold text-white ${urgente ? 'bg-danger' : 'bg-warning'}`}>
                                                {aviso.dias_restantes}d
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

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
