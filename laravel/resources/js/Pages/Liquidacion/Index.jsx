import Badge from '@/Components/Badge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Fragment, useState } from 'react';

const ESTADO_VARIANTS = { OCUPADA: 'info', VACIA: 'gray', CORTE_PENDIENTE: 'warning' };
const ESTADO_LABELS = { OCUPADA: 'Ocupada', VACIA: 'Vacía', CORTE_PENDIENTE: 'Corte pendiente' };

function fmtCorta(fecha) {
    return new Date(`${String(fecha).slice(0, 10)}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

function PipeStep({ label, value, sub }) {
    return (
        <div className="flex-1 rounded-[13px] border border-border bg-surface px-4 py-3.5 shadow-sm">
            <p className="text-[0.66rem] font-bold uppercase tracking-wide text-muted-2">{label}</p>
            <p className="mt-1.5 font-mono text-[1.18rem] font-bold text-ink">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-2">{sub}</p>}
        </div>
    );
}

// "Jeferson Fernando Bujaico Rodriguez" -> "Jeferson F. Bujaico Rodriguez".
// Best-effort: nombres/apellidos vienen concatenados en un solo string desde
// el backend (LiquidacionService::CONCAT), no hay campos separados que
// abreviar con certeza -- con 4+ tokens se asume nombre + segundo nombre +
// apellidos y se abrevia el segundo nombre; con menos tokens se deja tal cual.
function abreviarInquilino(nombre) {
    const tokens = String(nombre ?? '').trim().split(/\s+/);
    if (tokens.length < 4) return nombre;
    return `${tokens[0]} ${tokens[1][0]}. ${tokens.slice(2).join(' ')}`;
}

function PipeArrow() {
    return (
        <div className="hidden w-[34px] shrink-0 items-center justify-center text-muted-2 sm:flex">
            <ArrowRight className="h-4 w-4" />
        </div>
    );
}

// Cambiar de periodo navega con preserveState, así que esta instancia del
// componente sigue montada -- pero useState(() => ...) solo lee su valor
// inicial una vez. Sin remount, los ajustes se quedan pegados en los del
// periodo anterior aunque lleguen props nuevas. index.jsx delega en este
// componente con key={periodo.id_periodo} para forzar el remount.
function LiquidacionTabla({ periodo, periodos, meta, data }) {
    const { errors, auth } = usePage().props;
    const puedeGenerar = auth.permissions.includes('liquidacion.generar');
    const [ajustes, setAjustes] = useState(() => Object.fromEntries((data || []).map((r) => [r.id_unidad, r.ajuste])));

    const cambiarPeriodo = (id) => router.get(route('liquidacion.index'), { periodo_id: id }, { preserveState: true });

    const generar = () => {
        const payload = Object.entries(ajustes).map(([id_unidad, ajuste]) => ({ id_unidad: Number(id_unidad), ajuste: parseFloat(ajuste) || 0 }));
        router.post(route('liquidacion.generar'), { periodo_id: periodo.id_periodo, ajustes: payload });
    };

    return (
        <AdminLayout
            title="Liquidación de luz"
            periodo={periodo}
            periodos={periodos}
            onPeriodoChange={cambiarPeriodo}
            actions={puedeGenerar && periodo.estado === 'ABIERTO' && (
                <button onClick={generar} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                    Generar liquidación
                </button>
            )}
        >
            <Head title="Liquidación" />

            {errors?.general && <div className="mb-4 rounded-lg bg-danger-tint px-4 py-3 text-sm text-danger">{errors.general}</div>}

            {meta && (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-0">
                    <PipeStep label="Precio kWh" value={`S/ ${Number(meta.precio_kwh).toFixed(4)}`} />
                    <PipeArrow />
                    <PipeStep label="Consumo total" value={`S/ ${Number(meta.monto_consumo_total).toFixed(2)}`} />
                    <PipeArrow />
                    <PipeStep label="Gasto común (dif.)" value={`S/ ${Number(meta.diferencia_comun).toFixed(2)}`} />
                    <PipeArrow />
                    <PipeStep label="Unidades liquidadas" value={`${meta.total_unidades_liquidadas} / ${meta.total_unidades}`} />
                </div>
            )}

            <div className="overflow-x-auto rounded-[13px] border border-border bg-surface shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surface-2">
                        <tr>
                            <th className="w-64 px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Unidad</th>
                            <th className="w-28 px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Estado</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Consumo</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">%</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Consumo S/</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Gasto común</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Ajuste</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Total luz</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Total cobrar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {(data || []).map((r) => {
                            const tramos = r.tramos || [];
                            const tieneVariosTramos = tramos.length > 1;

                            return (
                                <Fragment key={r.id_unidad}>
                                    <tr className={r.participa_liquidacion ? '' : 'opacity-50'}>
                                        <td className="px-4 py-2.5 font-semibold text-ink" title={r.inquilino}>{r.codigo_unidad} · {abreviarInquilino(r.inquilino)}</td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col items-start gap-1">
                                                <Badge variant={ESTADO_VARIANTS[r.estado_unidad] ?? 'gray'}>{ESTADO_LABELS[r.estado_unidad] ?? r.estado_unidad}</Badge>
                                                {r.consumo_vacante_kwh > 0 && (
                                                    <span className="text-[0.68rem] leading-tight text-muted-2" title="Consumo de tramos sin ocupante este período -- su costo ya está repartido como gasto común entre las unidades ocupadas, no lo paga nadie aparte.">
                                                        +{Number(r.consumo_vacante_kwh).toFixed(2)} kWh vac.
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-mono text-muted">{r.consumo_kwh.toFixed(2)}</td>
                                        <td className="px-4 py-2.5 text-right font-mono text-muted">{(r.porcentaje_participacion * 100).toFixed(2)}%</td>
                                        <td className="px-4 py-2.5 text-right font-mono text-muted">{Number(r.monto_consumo).toFixed(2)}</td>
                                        <td className="px-4 py-2.5 text-right font-mono text-muted">{Number(r.gasto_comun).toFixed(2)}</td>
                                        <td className="px-4 py-2.5 text-right">
                                            {r.participa_liquidacion && periodo.estado === 'ABIERTO' ? (
                                                <input type="number" step="0.01" value={ajustes[r.id_unidad] ?? 0}
                                                    onChange={(e) => setAjustes((a) => ({ ...a, [r.id_unidad]: e.target.value }))}
                                                    className="w-24 rounded-md border-border text-right font-mono text-sm text-ink" />
                                            ) : <span className="font-mono text-muted">{Number(r.ajuste).toFixed(2)}</span>}
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-ink">{Number(r.total_pagar_luz).toFixed(2)}</td>
                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-primary">{Number(r.total_cobrar).toFixed(2)}</td>
                                    </tr>
                                    {tieneVariosTramos && tramos.map((t) => (
                                        <tr key={`${r.id_unidad}-${t.fecha_desde}`} className="bg-surface-2/70 text-xs text-muted-2">
                                            <td className="px-4 py-1.5 pl-8" colSpan={2}>
                                                ↳ {fmtCorta(t.fecha_desde)}–{fmtCorta(t.fecha_hasta)} ({t.dias} d) · {t.inquilino || 'Vacante'}
                                            </td>
                                            <td className="px-4 py-1.5 text-right font-mono">{Number(t.consumo_kwh).toFixed(2)}</td>
                                            <td className="px-4 py-1.5 text-right font-mono">{(Number(t.porcentaje_tramo) * 100).toFixed(1)}%</td>
                                            <td className="px-4 py-1.5" colSpan={3}></td>
                                            <td className="px-4 py-1.5 text-right font-mono font-medium">{Number(t.total_pagar_luz).toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </Fragment>
                            );
                        })}
                        {(!data || data.length === 0) && (
                            <tr><td colSpan={9} className="px-4 py-6 text-center text-muted-2">Sin recibo o lecturas para este periodo todavía.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

export default function Index({ periodo, periodos, meta, data }) {
    return <LiquidacionTabla key={periodo.id_periodo} periodo={periodo} periodos={periodos} meta={meta} data={data} />;
}
