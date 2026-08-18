import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle, Calculator, CalendarClock, Gauge, Info, Wallet, Zap,
} from 'lucide-react';
import Chart from 'react-apexcharts';

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}
function number(value, decimals = 2) {
    return Number(value ?? 0).toFixed(decimals);
}
function formatDia(fecha) {
    if (!fecha) return null;
    // `fecha` puede llegar como 'YYYY-MM-DD' o como datetime ISO completo
    // (depende del cast del modelo) -- nos quedamos solo con la fecha.
    const d = new Date(`${String(fecha).slice(0, 10)}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
}
const ESTADO_PERIODO_TEXTO = { ABIERTO: 'abierto', CERRADO: 'cerrado', ANULADO: 'anulado' };

const CHART_COLORS = { primary: '#2563EB', success: '#16A34A', warning: '#D97706', danger: '#DC2626' };

export default function Dashboard({
    periodo, periodos, recibo, preview, stats, tendencia, estadoCobros, morosidadTotal, carteraVencidaCount,
    vencimientosContrato, consumoAnterior,
}) {
    const filas = (preview?.data || []).filter((r) => r.participa_liquidacion);
    const totalConsumo = filas.reduce((acc, r) => acc + Number(r.consumo_kwh || 0), 0);

    const cambiarPeriodo = (id) => router.get(route('dashboard'), { periodo_id: id }, { preserveState: true });

    const tendenciaOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
        xaxis: { categories: tendencia.map((t) => t.label), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { formatter: (v) => `S/ ${Number(v).toFixed(0)}` } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => money(v) } },
    };
    const tendenciaSeries = [
        { name: 'Facturado', data: tendencia.map((t) => t.facturado) },
        { name: 'Cobrado', data: tendencia.map((t) => t.cobrado) },
        { name: 'Pendiente', data: tendencia.map((t) => t.pendiente) },
    ];

    // "Salud de cobranza": el estado de los cobros del periodo (Pagado/Parcial/
    // Pendiente) más la cartera vencida de periodos ya cerrados (Vencido) --
    // mismos 4 estados que ya usa el módulo de Cobros, en un solo vistazo.
    const totalPeriodo = estadoCobros.PAGADO + estadoCobros.PARCIAL + estadoCobros.PENDIENTE;
    const totalSalud = totalPeriodo + carteraVencidaCount;
    const pctCobrado = totalPeriodo > 0 ? (estadoCobros.PAGADO / totalPeriodo) * 100 : 0;
    const saludLabels = ['Pagado', 'Parcial', 'Pendiente', 'Vencido'];
    const saludData = [estadoCobros.PAGADO, estadoCobros.PARCIAL, estadoCobros.PENDIENTE, carteraVencidaCount];
    const saludColors = [CHART_COLORS.success, CHART_COLORS.primary, CHART_COLORS.warning, CHART_COLORS.danger];
    const saludOptions = {
        chart: { fontFamily: 'inherit' },
        labels: saludLabels,
        colors: saludColors,
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        value: { fontSize: '22px', fontWeight: 700, color: '#0f172a', formatter: () => `${pctCobrado.toFixed(0)}%` },
                        total: { show: true, label: 'Cobrado del periodo', fontSize: '11px', color: '#94a3b8', formatter: () => `${pctCobrado.toFixed(0)}%` },
                    },
                },
            },
        },
        tooltip: { y: { formatter: (v) => `${v} cobro${v === 1 ? '' : 's'}` } },
    };

    // "Sin dato" (la unidad no tuvo liquidación el periodo anterior -- recién
    // ocupada, o ese mes no participó) es un caso distinto de "igual que el
    // mes anterior" (sí hay dato, y no cambió) -- antes ambos se mostraban
    // igual, en gris, y no había forma de distinguirlos a simple vista.
    function tendenciaConsumo(row) {
        const tieneDatoAnterior = Object.prototype.hasOwnProperty.call(consumoAnterior, row.id_unidad);
        if (!tieneDatoAnterior) {
            return { sinDato: true, stroke: '#cbd5e1', text: 'Sin liquidación en el periodo anterior para comparar' };
        }
        const anterior = Number(consumoAnterior[row.id_unidad]);
        const actual = Number(row.consumo_kwh || 0);
        const diff = actual - anterior;
        if (Math.abs(diff) < 0.05) return { stroke: '#94a3b8', text: 'Igual que el mes anterior' };
        if (diff > 0) return { stroke: CHART_COLORS.danger, text: `Subió ${number(diff, 1)} kWh vs. el mes anterior` };
        return { stroke: CHART_COLORS.success, text: `Bajó ${number(Math.abs(diff), 1)} kWh vs. el mes anterior` };
    }

    function Sparkline({ anterior, actual, stroke }) {
        const max = Math.max(anterior, actual, 1);
        const yFor = (v) => 18 - (v / max) * 14;
        return (
            <svg width="52" height="20" viewBox="0 0 52 20" className="shrink-0">
                <path
                    d={`M2 ${yFor(anterior)} L50 ${yFor(actual)}`}
                    fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                />
                <circle cx="50" cy={yFor(actual)} r="2.2" fill={stroke} />
            </svg>
        );
    }

    const unidadesTexto = `${stats.total_ocupados} unidad${stats.total_ocupados === 1 ? '' : 'es'} ocupada${stats.total_ocupados === 1 ? '' : 's'}`;
    const estadoTexto = ESTADO_PERIODO_TEXTO[periodo.estado] ?? periodo.estado.toLowerCase();
    const inicioTexto = formatDia(periodo.fecha_inicio);
    const description = `${unidadesTexto} · periodo ${estadoTexto}${inicioTexto ? ` desde el ${inicioTexto}` : ''}`;

    return (
        <AdminLayout title="Dashboard" description={description} periodo={periodo} periodos={periodos} onPeriodoChange={cambiarPeriodo}>
            <Head title="Dashboard" />

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <KpiCard title="Total alquiler mensual" value={money(stats.total_alquiler)} desc={`Suma de las ${stats.total_ocupados} unidades ocupadas`} icon={Wallet} iconColor="text-success" />
                <KpiCard title="Luz distribuida" value={money(stats.total_luz)} desc="Resultado de la liquidación del recibo" icon={Zap} iconColor="text-primary" />
                <KpiCard title="Consumo liquidado" value={`${number(totalConsumo)} kWh`} desc="Suma de consumos de unidades ocupadas" icon={Gauge} iconColor="text-warning" />
                <KpiCard title="Cobro teórico del mes" value={money(stats.total_cobrar)} desc="Alquiler + agua fija + luz" icon={Calculator} iconColor="text-purple-600" />
                <KpiCard title="Morosidad total" value={money(morosidadTotal)} desc="Deuda anterior acumulada" icon={AlertTriangle} iconColor="text-danger" />
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
                    <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800">Salud de cobranza</h3>
                        <span className="text-xs text-gray-400">{totalSalud} cobro{totalSalud === 1 ? '' : 's'}</span>
                    </div>
                    {totalSalud > 0 ? (
                        <Chart options={saludOptions} series={saludData} type="donut" height={260} />
                    ) : (
                        <p className="py-8 text-center text-sm text-gray-400">Sin cobros generados para este periodo.</p>
                    )}
                </section>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-800">Contratos por vencer</h3>
                        {vencimientosContrato.length > 0 && (
                            <span className="text-xs text-gray-400">{vencimientosContrato.length}</span>
                        )}
                    </div>
                    {vencimientosContrato.length === 0 ? (
                        <p className="py-4 text-sm text-gray-400">Sin contratos por vencer en los próximos 60 días.</p>
                    ) : (
                        <div className="max-h-[196px] space-y-2 overflow-y-auto pr-1">
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
                    )}
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

            <section className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">Resumen operativo</h3>
                        <p className="text-xs text-gray-500">Recibo de luz y reparto por unidad de este periodo.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded-full bg-danger" />Subió</span>
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded-full bg-success" />Bajó</span>
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded-full bg-gray-400" />Igual</span>
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-3 rounded-full bg-gray-200" />Sin dato anterior</span>
                    </div>
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead>
                                <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    <th className="py-2 pr-3">Unidad</th>
                                    <th className="py-2 pr-3">Inquilino</th>
                                    <th className="py-2 pr-3 text-right">Consumo</th>
                                    <th className="py-2 pr-3">Tendencia</th>
                                    <th className="py-2 pr-3 text-right">Luz</th>
                                    <th className="py-2 pr-3 text-right">Alquiler</th>
                                    <th className="py-2 pr-3 text-right">Total</th>
                                    <th className="py-2 pr-3">Participación</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filas.map((row) => {
                                    const pct = (Number(row.porcentaje_participacion || 0) * 100).toFixed(1);
                                    const tendencia = tendenciaConsumo(row);
                                    return (
                                        <tr key={row.id_unidad}>
                                            <td className="whitespace-nowrap py-2.5 pr-3 font-semibold text-gray-800">{row.codigo_unidad}</td>
                                            <td className="whitespace-nowrap py-2.5 pr-3 text-gray-600">
                                                {row.inquilino ?? '—'}
                                                <span className="ml-1.5 text-xs text-gray-400">{row.nombre_unidad}</span>
                                            </td>
                                            <td className="whitespace-nowrap py-2.5 pr-3 text-right font-medium text-gray-700">{number(row.consumo_kwh)} kWh</td>
                                            <td className="py-2.5 pr-3" title={tendencia.text}>
                                                {tendencia.sinDato ? (
                                                    <span className="text-xs text-gray-300">Sin dato</span>
                                                ) : (
                                                    <Sparkline anterior={Number(consumoAnterior[row.id_unidad])} actual={Number(row.consumo_kwh || 0)} stroke={tendencia.stroke} />
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap py-2.5 pr-3 text-right text-gray-700">{money(row.total_pagar_luz)}</td>
                                            <td className="whitespace-nowrap py-2.5 pr-3 text-right text-gray-700">{money(row.monto_alquiler)}</td>
                                            <td className="whitespace-nowrap py-2.5 pr-3 text-right font-semibold text-gray-900">{money(row.total_cobrar)}</td>
                                            <td className="py-2.5 pr-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 rounded-full bg-gray-100">
                                                        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="w-10 shrink-0 text-xs text-gray-400">{pct}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}

function KpiCard({ title, value, desc, icon: Icon, iconColor }) {
    return (
        <article className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <span>{title}</span>
                <span className="group relative inline-flex">
                    <Info tabIndex={0} className="h-3.5 w-3.5 cursor-help text-gray-300 outline-none hover:text-gray-400 focus:text-gray-400" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-44 -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1.5 text-center text-[11px] font-normal normal-case leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        {desc}
                    </span>
                </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
                {Icon && <Icon className={`h-5 w-5 shrink-0 ${iconColor ?? 'text-gray-400'}`} />}
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
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
