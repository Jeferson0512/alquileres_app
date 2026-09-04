import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import Dropdown from '@/Components/Dropdown';
import KpiCard from '@/Components/KpiCard';
import PeriodRangeSwitcher from '@/Components/PeriodRangeSwitcher';
import StatusTabs from '@/Components/StatusTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle, Building2, CalendarClock, ChevronDown, Download, FileSpreadsheet, FileText, Gauge, KeyRound,
    TrendingDown, TrendingUp, Wallet, Zap,
} from 'lucide-react';
import { useState } from 'react';
import Chart from 'react-apexcharts';

const CHART_COLORS = { primary: '#2563EB', success: '#16A34A', warning: '#D97706', danger: '#DC2626', purple: '#9333EA' };
const UNIT_COLORS = ['#2563EB', '#9333EA', '#16A34A', '#D97706', '#DB2777', '#0EA5E9', '#DC2626', '#65A30D', '#64748B'];

function money(value) {
    return `S/ ${Number(value ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function kwh(value) {
    return `${Number(value ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 1 })} kWh`;
}
function donutOptions(labels, colors) {
    return {
        chart: { fontFamily: 'inherit' },
        labels,
        colors,
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        plotOptions: { pie: { donut: { size: '68%' } } },
    };
}
const TABS = [
    { value: 'financiero', label: 'Financiero' },
    { value: 'ocupacion', label: 'Ocupación' },
    { value: 'consumo', label: 'Consumo de luz' },
];

// Links nativos del navegador (sin fetch+blob ni window.open programatico)
// -- mismo criterio que ya usa el PDF del Portal (PortalReciboController::
// descargar, "stream() abre inline en pestaña nueva"): la descarga la
// maneja el navegador, no una libreria. El PDF abre en pestaña nueva para
// verlo antes de decidir si descargarlo; el Excel no es viewable inline,
// asi que ese sí dispara la descarga directo.
const EXPORT_ROUTES = {
    financiero: { pdf: 'reportes.financiero.pdf', excel: 'reportes.financiero.excel' },
    ocupacion: { pdf: 'reportes.ocupacion.pdf', excel: 'reportes.ocupacion.excel' },
    consumo: { pdf: 'reportes.consumo.pdf', excel: 'reportes.consumo.excel' },
};

function BotonExportar({ tab, rango }) {
    const rutas = EXPORT_ROUTES[tab];
    const query = { desde: rango.desde, hasta: rango.hasta };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button type="button" className="flex items-center gap-1.5 rounded-lg bg-ink px-3.5 py-2 text-sm font-semibold text-white hover:bg-ink/90">
                    <Download className="h-4 w-4" />
                    Exportar
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="right" width="56" contentClasses="bg-surface py-1.5">
                <a
                    href={route(rutas.pdf, query)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink hover:bg-surface-2"
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-danger text-[9px] font-bold text-white"><FileText className="h-3.5 w-3.5" /></span>
                    Ver / descargar PDF
                </a>
                <a
                    href={route(rutas.excel, query)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink hover:bg-surface-2"
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-success text-[9px] font-bold text-white"><FileSpreadsheet className="h-3.5 w-3.5" /></span>
                    Descargar Excel
                </a>
            </Dropdown.Content>
        </Dropdown>
    );
}

export default function ReportesIndex({ periodos, rango, financiero, ocupacion, consumo }) {
    const [tab, setTab] = useState('financiero');

    const cambiarRango = (desde, hasta) => router.get(route('reportes.index'), { desde, hasta }, { preserveState: true, preserveScroll: true });

    return (
        <AdminLayout title="Reportes" description="Financiero, ocupación y consumo de luz por rango de períodos.">
            <Head title="Reportes" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <StatusTabs value={tab} options={TABS} onChange={setTab} />
                <div className="flex flex-wrap items-center gap-3">
                    <PeriodRangeSwitcher periodos={periodos} desde={rango.desde} hasta={rango.hasta} onChange={cambiarRango} />
                    <BotonExportar tab={tab} rango={rango} />
                </div>
            </div>

            {tab === 'financiero' && <TabFinanciero data={financiero} />}
            {tab === 'ocupacion' && <TabOcupacion data={ocupacion} />}
            {tab === 'consumo' && <TabConsumo data={consumo} />}
        </AdminLayout>
    );
}

function TabFinanciero({ data }) {
    const { kpis, serie_periodo: seriePeriodo, desglose_concepto: desgloseConcepto, aging, rent_roll: rentRoll } = data;

    const facCobOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS.primary + '55', CHART_COLORS.primary],
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
        dataLabels: { enabled: false },
        legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
        xaxis: { categories: seriePeriodo.map((s) => s.label), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { formatter: (v) => `S/ ${Number(v).toFixed(0)}` } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => money(v) } },
    };
    const facCobSeries = [
        { name: 'Facturado', data: seriePeriodo.map((s) => s.facturado) },
        { name: 'Cobrado', data: seriePeriodo.map((s) => s.cobrado) },
    ];

    const pendienteOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS.danger],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.28, opacityTo: 0.04 } },
        dataLabels: { enabled: false },
        xaxis: { categories: seriePeriodo.map((s) => s.label), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { formatter: (v) => `S/ ${Number(v).toFixed(0)}` } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => money(v) } },
    };
    const pendienteSeries = [{ name: 'Pendiente', data: seriePeriodo.map((s) => Math.max(s.facturado - s.cobrado, 0)) }];

    const agingTotales = aging.reduce((acc, r) => ({
        t1: acc.t1 + r.tramo_0_30, t2: acc.t2 + r.tramo_31_60, t3: acc.t3 + r.tramo_61_mas,
    }), { t1: 0, t2: 0, t3: 0 });

    return (
        <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label="Facturado" value={money(kpis.facturado)} icon={Wallet} tone="primary" desc="Suma del rango seleccionado" />
                <KpiCard label="Cobrado" value={money(kpis.cobrado)} icon={TrendingUp} tone="success" delta={`${kpis.tasa_cobranza}% del facturado`} deltaDirection={kpis.tasa_cobranza >= 90 ? 'up' : kpis.tasa_cobranza >= 70 ? 'flat' : 'down'} />
                <KpiCard label="Pendiente" value={money(kpis.pendiente)} icon={CalendarClock} tone="warning" desc="Incluye períodos aún abiertos" />
                <KpiCard label="Morosidad &gt; 60 días" value={money(kpis.morosidad_60)} icon={AlertTriangle} tone="danger" desc="Ver aging abajo" />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Facturado vs. cobrado por período" />
                    <Card.Body>
                        <Chart options={facCobOptions} series={facCobSeries} type="bar" height={260} />
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header title="Evolución de deuda pendiente" hint="por período" />
                    <Card.Body>
                        <Chart options={pendienteOptions} series={pendienteSeries} type="area" height={260} />
                    </Card.Body>
                </Card>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Facturado por concepto" hint="último período con datos" />
                    <Card.Body>
                        {desgloseConcepto.length > 0 ? (
                            <Chart
                                options={donutOptions(desgloseConcepto.map((d) => d.concepto), UNIT_COLORS)}
                                series={desgloseConcepto.map((d) => d.monto)}
                                type="donut" height={260}
                            />
                        ) : <p className="py-8 text-center text-sm text-muted-2">Sin datos en el rango.</p>}
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header title="Deuda pendiente por antigüedad" hint="al día de hoy" />
                    <Card.Body>
                        {agingTotales.t1 + agingTotales.t2 + agingTotales.t3 > 0 ? (
                            <Chart
                                options={donutOptions(['0–30 días', '31–60 días', '61–90+ días'], ['#FCA5A5', CHART_COLORS.danger, '#7F1D1D'])}
                                series={[agingTotales.t1, agingTotales.t2, agingTotales.t3]}
                                type="donut" height={260}
                            />
                        ) : <p className="py-8 text-center text-sm text-muted-2">Sin morosidad en el rango.</p>}
                    </Card.Body>
                </Card>
            </div>

            <Card className="mb-4">
                <Card.Header title="Aging de morosidad por inquilino" hint="ordenado por deuda total" />
                <Card.Body className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead>
                                <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">
                                    <th className="px-[18px] py-2.5">Unidad / inquilino</th>
                                    <th className="px-3 py-2.5 text-right">0–30 días</th>
                                    <th className="px-3 py-2.5 text-right">31–60 días</th>
                                    <th className="px-3 py-2.5 text-right">61–90+ días</th>
                                    <th className="px-3 py-2.5 text-right">Total</th>
                                    <th className="px-[18px] py-2.5">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {aging.length === 0 && (
                                    <tr><td colSpan={6} className="px-[18px] py-6 text-center text-sm text-muted-2">Sin deudores en el rango seleccionado.</td></tr>
                                )}
                                {aging.map((r, i) => (
                                    <tr key={i}>
                                        <td className="whitespace-nowrap px-[18px] py-2.5"><UnitCell unidad={r.unidad} label={r.persona} /></td>
                                        <td className="px-3 py-2.5 text-right font-mono">{r.tramo_0_30 > 0 ? money(r.tramo_0_30) : '—'}</td>
                                        <td className="px-3 py-2.5 text-right font-mono">{r.tramo_31_60 > 0 ? money(r.tramo_31_60) : '—'}</td>
                                        <td className="px-3 py-2.5 text-right font-mono">{r.tramo_61_mas > 0 ? money(r.tramo_61_mas) : '—'}</td>
                                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-ink">{money(r.total)}</td>
                                        <td className="px-[18px] py-2.5">
                                            {r.tramo_61_mas > 0 ? <Badge variant="danger">Crítico</Badge> : r.tramo_31_60 > 0 ? <Badge variant="warning">Atrasado</Badge> : <Badge variant="gray">Reciente</Badge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <Card>
                <Card.Header title="Detalle por unidad" hint="rango seleccionado" />
                <Card.Body className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead>
                                <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">
                                    <th className="px-[18px] py-2.5">Unidad / inquilino</th>
                                    <th className="px-3 py-2.5 text-right">Facturado</th>
                                    <th className="px-3 py-2.5 text-right">Cobrado</th>
                                    <th className="px-3 py-2.5 text-right">Pendiente</th>
                                    <th className="px-[18px] py-2.5">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rentRoll.map((r, i) => (
                                    <tr key={i}>
                                        <td className="whitespace-nowrap px-[18px] py-2.5"><UnitCell unidad={r.unidad} label={r.persona} /></td>
                                        <td className="px-3 py-2.5 text-right font-mono">{money(r.facturado)}</td>
                                        <td className="px-3 py-2.5 text-right font-mono">{money(r.cobrado)}</td>
                                        <td className="px-3 py-2.5 text-right font-mono">{money(r.pendiente)}</td>
                                        <td className="px-[18px] py-2.5">
                                            {r.pendiente <= 0 ? <Badge variant="success">Al día</Badge> : <Badge variant="warning">Pendiente</Badge>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}

function TabOcupacion({ data }) {
    const { kpis, timeline, dias_rango: diasRango, periodo_ticks: periodoTicks, serie_periodo: seriePeriodo, motivo_salida: motivoSalida, eventos } = data;

    const ocupOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS.success],
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 4 },
        dataLabels: { enabled: false },
        xaxis: { categories: seriePeriodo.map((s) => s.label), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { max: 100, labels: { formatter: (v) => `${Number(v).toFixed(0)}%` } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => `${v}%` } },
    };
    const ocupSeries = [{ name: 'Ocupación', data: seriePeriodo.map((s) => s.tasa) }];

    const motivoEntradas = Object.entries(motivoSalida).filter(([, v]) => v > 0);
    const motivoColors = { 'Renovación': CHART_COLORS.success, 'Traslado': CHART_COLORS.purple, 'Fin sin renovar': CHART_COLORS.danger };

    return (
        <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label="Ocupación promedio" value={`${kpis.tasa_ocupacion}%`} icon={Building2} tone="success" desc="De todas las unidades" />
                <KpiCard label="Tasa de vacancia" value={`${kpis.tasa_vacancia}%`} icon={KeyRound} tone="warning" desc="En el rango seleccionado" />
                <KpiCard label="Eventos de contrato" value={kpis.eventos_total} icon={CalendarClock} tone="primary" desc="Renovaciones, traslados y salidas" />
                <KpiCard label="Mayor rotación" value={`Unidad ${kpis.mayor_rotacion}`} icon={TrendingDown} tone="danger" desc="Menor tasa de ocupación del rango" />
            </div>

            <Card className="mb-4">
                <Card.Header title="Historial de ocupación por unidad" />
                <Card.Body>
                    <div className="space-y-2">
                        {timeline.map((row) => (
                            <div key={row.unidad} className="grid grid-cols-[80px_1fr] items-center gap-3">
                                <span className="rounded-md bg-surface-2 px-2 py-1 text-center font-mono text-xs font-bold text-ink">{row.unidad}</span>
                                <div className="relative flex h-6 overflow-hidden rounded-md bg-surface-2">
                                    {row.segmentos.map((seg, i) => {
                                        const width = `${(seg.dias / diasRango) * 100}%`;
                                        if (seg.tipo === 'vacante') {
                                            return <div key={i} style={{ width }} className="h-full border-r border-paper bg-[repeating-linear-gradient(135deg,#CBD5E1,#CBD5E1_3px,#F8FAFC_3px,#F8FAFC_6px)]" title="Vacante" />;
                                        }
                                        const bg = seg.tipo === 'traslado' ? CHART_COLORS.purple : CHART_COLORS.primary;
                                        return (
                                            <div key={i} style={{ width, background: bg }} className="flex h-full items-center overflow-hidden border-r border-paper px-2 text-[10px] font-semibold text-white" title={seg.persona}>
                                                <span className="truncate">{seg.persona}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-1.5 grid grid-cols-[80px_1fr] gap-3">
                        <div />
                        <div className="relative h-4">
                            {periodoTicks.map((tick, i) => {
                                const pct = (tick.offset_dias / diasRango) * 100;
                                const translate = pct < 5 ? '0' : pct > 95 ? '-100%' : '-50%';
                                return (
                                    <span
                                        key={i}
                                        className="absolute top-0 whitespace-nowrap font-mono text-[10px] text-muted-2"
                                        style={{ left: `${pct}%`, transform: `translateX(${translate})` }}
                                    >
                                        {tick.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS.primary }} />Ocupada</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS.purple }} />Traslado (misma persona)</span>
                        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-border-strong bg-[repeating-linear-gradient(135deg,#CBD5E1,#CBD5E1_2px,#F8FAFC_2px,#F8FAFC_4px)]" />Vacante</span>
                    </div>
                </Card.Body>
            </Card>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                    <Card.Header title="Tasa de ocupación por período" />
                    <Card.Body>
                        <Chart options={ocupOptions} series={ocupSeries} type="line" height={260} />
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header title="Motivo de salida" hint="tramos finalizados en el rango" />
                    <Card.Body>
                        {motivoEntradas.length > 0 ? (
                            <Chart
                                options={donutOptions(motivoEntradas.map(([k]) => k), motivoEntradas.map(([k]) => motivoColors[k]))}
                                series={motivoEntradas.map(([, v]) => v)}
                                type="donut" height={260}
                            />
                        ) : <p className="py-8 text-center text-sm text-muted-2">Sin salidas en el rango.</p>}
                    </Card.Body>
                </Card>
            </div>

            <Card>
                <Card.Header title="Eventos de contrato en el rango" />
                <Card.Body className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead>
                                <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">
                                    <th className="px-[18px] py-2.5">Unidad / inquilino</th>
                                    <th className="px-3 py-2.5">Evento</th>
                                    <th className="px-3 py-2.5">Fecha</th>
                                    <th className="px-[18px] py-2.5">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {eventos.length === 0 && (
                                    <tr><td colSpan={4} className="px-[18px] py-6 text-center text-sm text-muted-2">Sin eventos de contrato en el rango.</td></tr>
                                )}
                                {eventos.map((e, i) => (
                                    <tr key={i}>
                                        <td className="whitespace-nowrap px-[18px] py-2.5"><UnitCell unidad={e.unidad} label={e.persona} /></td>
                                        <td className="px-3 py-2.5">
                                            <Badge variant={e.evento === 'Renovación' ? 'success' : e.evento === 'Traslado' ? 'info' : 'danger'}>{e.evento}</Badge>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-muted">{e.fecha}</td>
                                        <td className="px-[18px] py-2.5 text-muted">{e.detalle}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}

function TabConsumo({ data }) {
    const {
        kpis, periodos_labels: periodosLabels, matriz, total_por_periodo: totalPorPeriodo,
        ranking, distribucion_ultimo_periodo: distribucionUltimo, tramos,
    } = data;

    const lineasOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: UNIT_COLORS,
        stroke: { curve: 'smooth', width: 2 },
        markers: { size: 3 },
        dataLabels: { enabled: false },
        legend: { position: 'bottom', fontSize: '11px' },
        xaxis: { categories: periodosLabels, labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { formatter: (v) => `${Number(v).toFixed(0)}` } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => kwh(v) } },
    };
    const lineasSeries = matriz.map((m) => ({ name: m.unidad, data: m.valores.map((v) => v.kwh) }));

    const totalOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS.primary],
        plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
        dataLabels: { enabled: false },
        xaxis: { categories: periodosLabels, labels: { style: { colors: '#94a3b8' } } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => kwh(v) } },
    };

    const rankingOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit' },
        colors: [CHART_COLORS.warning],
        plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '55%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: ranking.map((r) => r.unidad), labels: { style: { colors: '#94a3b8' } } },
        grid: { borderColor: '#f1f5f9' },
        tooltip: { y: { formatter: (v) => kwh(v) } },
    };

    return (
        <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label="Consumo total" value={kwh(kpis.consumo_total)} icon={Zap} tone="primary" desc="Todas las unidades, rango completo" />
                <KpiCard label="Promedio por unidad" value={kwh(kpis.promedio_unidad)} icon={Gauge} tone="muted" desc="Por período" />
                <KpiCard
                    label="Bajo el mínimo facturable"
                    value={kpis.unidades_bajo_minimo.length > 0 ? `${kpis.unidades_bajo_minimo.length} unidad${kpis.unidades_bajo_minimo.length === 1 ? '' : 'es'}` : 'Ninguna'}
                    icon={AlertTriangle} tone="warning" desc={`< ${kpis.minimo_kwh} kWh en todo el rango`}
                />
                <KpiCard label="Mayor consumidor" value={`Unidad ${kpis.mayor_consumidor}`} icon={TrendingUp} tone="danger" desc="Mayor promedio del rango" />
            </div>

            <Card className="mb-4">
                <Card.Header title="Comparativa de consumo por unidad" hint="kWh por período" />
                <Card.Body>
                    <Chart options={lineasOptions} series={lineasSeries} type="line" height={280} />
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header title="Detalle por unidad y período" hint="▲ se aleja de su promedio · ⚠ bajo mínimo facturable" />
                <Card.Body className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border text-sm">
                            <thead>
                                <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">
                                    <th className="px-[18px] py-2.5">Unidad</th>
                                    {periodosLabels.map((l) => <th key={l} className="px-3 py-2.5 text-right">{l}</th>)}
                                    <th className="px-[18px] py-2.5 text-right">Promedio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {matriz.map((m) => (
                                    <tr key={m.unidad}>
                                        <td className="whitespace-nowrap px-[18px] py-2.5"><UnitCell unidad={m.unidad} /></td>
                                        {m.valores.map((v, i) => (
                                            <td key={i} className={`px-3 py-2.5 text-right font-mono ${v.bajo_minimo ? 'font-semibold text-warning' : v.anomalia ? 'font-semibold text-danger' : 'text-ink'}`}>
                                                {v.kwh}{v.bajo_minimo ? ' ⚠' : v.anomalia ? ' ▲' : ''}
                                            </td>
                                        ))}
                                        <td className="px-[18px] py-2.5 text-right font-mono text-muted">{m.promedio}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card>
                    <Card.Header title="Consumo total del inmueble" />
                    <Card.Body>
                        <Chart options={totalOptions} series={[{ name: 'kWh', data: totalPorPeriodo }]} type="bar" height={220} />
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header title="Ranking de consumo" hint="promedio del rango" />
                    <Card.Body>
                        <Chart options={rankingOptions} series={[{ name: 'kWh', data: ranking.map((r) => r.promedio) }]} type="bar" height={220} />
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Header title="Distribución" hint="último período" />
                    <Card.Body>
                        {distribucionUltimo.length > 0 ? (
                            <Chart
                                options={donutOptions(distribucionUltimo.map((d) => d.unidad), UNIT_COLORS)}
                                series={distribucionUltimo.map((d) => d.kwh)}
                                type="donut" height={220}
                            />
                        ) : <p className="py-8 text-center text-sm text-muted-2">Sin consumo registrado.</p>}
                    </Card.Body>
                </Card>
            </div>

            <Card>
                <Card.Header title="Consumo por tramo de ocupación" hint="unidades con traslado dentro del rango" />
                <Card.Body className={tramos.length === 0 ? '' : '!p-0'}>
                    {tramos.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-2">Sin traslados dentro del rango seleccionado.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border text-sm">
                                <thead>
                                    <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">
                                        <th className="px-[18px] py-2.5">Inquilino</th>
                                        <th className="px-3 py-2.5">Unidad origen</th>
                                        <th className="px-3 py-2.5 text-right">kWh en origen</th>
                                        <th className="px-3 py-2.5">Unidad destino</th>
                                        <th className="px-[18px] py-2.5 text-right">kWh en destino</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {tramos.map((t, i) => (
                                        <tr key={i}>
                                            <td className="whitespace-nowrap px-[18px] py-2.5 text-ink">{t.persona}</td>
                                            <td className="px-3 py-2.5"><span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-bold">{t.unidad_origen}</span></td>
                                            <td className="px-3 py-2.5 text-right font-mono">{kwh(t.kwh_origen)}</td>
                                            <td className="px-3 py-2.5"><span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs font-bold">{t.unidad_destino}</span></td>
                                            <td className="px-[18px] py-2.5 text-right font-mono">{kwh(t.kwh_destino)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </>
    );
}

function UnitCell({ unidad, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-xs font-bold text-ink">{unidad}</span>
            {label && <span className="text-ink">{label}</span>}
        </div>
    );
}
