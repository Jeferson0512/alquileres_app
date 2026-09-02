import Badge from '@/Components/Badge';
import IconButton from '@/Components/IconButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, HelpCircle, Plus, RefreshCcw, Zap } from 'lucide-react';
import { Fragment, useState } from 'react';

const AUDITORIA_VARIANTS = { OK: 'info', REVISAR: 'warning', SIN_HISTORICO: 'gray' };
const AUDITORIA_LABELS = { OK: 'OK', REVISAR: 'Revisar', SIN_HISTORICO: 'Sin histórico' };

function AuditoriaBadge({ estado }) {
    return <Badge variant={AUDITORIA_VARIANTS[estado] ?? 'gray'}>{AUDITORIA_LABELS[estado] ?? estado}</Badge>;
}

function fmtCorta(fecha) {
    return new Date(`${String(fecha).slice(0, 10)}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
}

// Lectura de control sin cambio de inquilino -- la unica via para partir
// un tramo manualmente (los cortes por cambio de ocupacion los crea
// sincronizar() solo). La fecha de cierre del periodo queda afuera del
// rango permitido porque esa la cubre "Actual", no un corte.
function RegistrarCorteModal({ unidad, periodo, onClose }) {
    const { errors } = usePage().props;
    const [fecha, setFecha] = useState('');
    const [lectura, setLectura] = useState('');
    const [observacion, setObservacion] = useState('');
    const [processing, setProcessing] = useState(false);

    const minFecha = String(periodo.fecha_inicio).slice(0, 10);
    const maxFechaDate = new Date(`${String(periodo.fecha_fin).slice(0, 10)}T00:00:00`);
    maxFechaDate.setDate(maxFechaDate.getDate() - 1);
    const maxFecha = maxFechaDate.toISOString().slice(0, 10);

    const submit = () => {
        setProcessing(true);
        router.post(route('lecturas.corte.registrar'), {
            periodo_id: periodo.id_periodo,
            id_unidad: unidad.id_unidad,
            fecha_corte: fecha,
            lectura_corte: lectura,
            observacion: observacion.trim() || null,
        }, {
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal show onClose={onClose} maxWidth="sm">
            <div className="p-5">
                <h3 className="mb-1 text-base font-semibold text-gray-800">Registrar corte</h3>
                <p className="mb-4 text-sm text-gray-500">{unidad.codigo_unidad} · {unidad.nombre_unidad} — lectura de control, sin cambio de inquilino</p>

                <div className="mb-3">
                    <InputLabel htmlFor="fecha_corte_manual" value="Fecha *" />
                    <TextInput id="fecha_corte_manual" type="date" min={minFecha} max={maxFecha} className="mt-1 block w-full" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                    <InputError className="mt-1" message={errors.fecha_corte} />
                </div>
                <div className="mb-3">
                    <InputLabel htmlFor="lectura_corte_manual" value="Lectura del medidor *" />
                    <TextInput id="lectura_corte_manual" type="number" step="0.01" className="mt-1 block w-full" value={lectura} onChange={(e) => setLectura(e.target.value)} />
                    <InputError className="mt-1" message={errors.lectura_corte} />
                </div>
                <div className="mb-1">
                    <InputLabel htmlFor="observacion_corte_manual" value="Observación" />
                    <TextInput id="observacion_corte_manual" type="text" placeholder="ej. lectura de control" className="mt-1 block w-full" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
                </div>

                <div className="mt-4 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={submit} disabled={processing || !fecha || !lectura}>Registrar</PrimaryButton>
                </div>
            </div>
        </Modal>
    );
}

// Cambiar de periodo navega con preserveState, así que esta instancia del
// componente sigue montada -- pero useState(() => ...) solo lee su valor
// inicial una vez. Sin remount, la tabla se queda pegada en las lecturas del
// periodo anterior aunque lleguen props nuevas. index.jsx delega en este
// componente con key={periodo.id_periodo} para forzar el remount.
function LecturasTabla({ periodo, periodos, lecturas }) {
    const { errors, auth } = usePage().props;
    const [valores, setValores] = useState(() => Object.fromEntries(lecturas.map((l) => [l.id_lectura, l.lectura_actual])));
    const [cortes, setCortes] = useState(() => {
        const init = {};
        lecturas.forEach((l) => {
            (l.tramos || []).forEach((t) => {
                if (t.id_corte_hasta) init[t.id_corte_hasta] = t.lectura_hasta ?? '';
            });
        });
        return init;
    });
    const [saving, setSaving] = useState(false);
    const [corteManualUnidad, setCorteManualUnidad] = useState(null);

    const puedeRegistrar = auth.permissions.includes('lecturas.registrar');
    const puedeSincronizar = auth.permissions.includes('lecturas.sincronizar');
    const editable = periodo.estado === 'ABIERTO';

    const cambiarPeriodo = (id) => {
        router.get(route('lecturas.index'), { periodo_id: id }, { preserveState: true });
    };

    const guardar = () => {
        setSaving(true);
        const items = lecturas.map((l) => ({ id_lectura: l.id_lectura, lectura_actual: parseFloat(valores[l.id_lectura]) || 0 }));
        const cortesEnviados = Object.entries(cortes).map(([id, lectura_corte]) => ({ id: Number(id), lectura_corte }));
        router.post(route('lecturas.save'), { items, cortes: cortesEnviados, periodo_id: periodo.id_periodo }, {
            onFinish: () => setSaving(false),
        });
    };

    const sincronizar = () => {
        router.post(route('lecturas.sync'), { periodo_id: periodo.id_periodo });
    };

    const conteo = lecturas.reduce((acc, l) => {
        acc[l.auditoria_lectura_anterior] = (acc[l.auditoria_lectura_anterior] ?? 0) + 1;
        return acc;
    }, {});
    const consumoTotal = lecturas.reduce((acc, l) => acc + Number(l.consumo || 0), 0);
    const cortesPendientes = lecturas.filter((l) => l.tiene_corte_pendiente).length;

    return (
        <AdminLayout
            title="Lecturas"
            description={`${periodo.mes}/${periodo.anio} · ${lecturas.length} unidad${lecturas.length === 1 ? '' : 'es'}`}
            periodo={periodo}
            periodos={periodos}
            onPeriodoChange={cambiarPeriodo}
            actions={editable && (
                <div className="flex gap-2">
                    {puedeSincronizar && (
                        <button type="button" onClick={sincronizar} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            <RefreshCcw className="h-3.5 w-3.5" /> Sincronizar unidades
                        </button>
                    )}
                    {puedeRegistrar && (
                        <button type="button" onClick={guardar} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                            Guardar lecturas
                        </button>
                    )}
                </div>
            )}
        >
            <Head title="Lecturas" />

            {errors?.general && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{errors.general}</div>
            )}

            {!editable && (
                <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Este periodo está {periodo.estado.toLowerCase()} — solo lectura.</div>
            )}

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">OK</p>
                    <p className="mt-0.5 text-lg font-bold text-success">{conteo.OK ?? 0} <span className="text-xs font-normal text-gray-400">unidad{(conteo.OK ?? 0) === 1 ? '' : 'es'}</span></p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">A revisar</p>
                    <p className="mt-0.5 text-lg font-bold text-warning">{conteo.REVISAR ?? 0} <span className="text-xs font-normal text-gray-400">unidad{(conteo.REVISAR ?? 0) === 1 ? '' : 'es'}</span></p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">Cortes pendientes</p>
                    <p className="mt-0.5 text-lg font-bold text-warning">{cortesPendientes} <span className="text-xs font-normal text-gray-400">unidad{cortesPendientes === 1 ? '' : 'es'}</span></p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">Sin histórico</p>
                    <p className="mt-0.5 text-lg font-bold text-gray-500">{conteo.SIN_HISTORICO ?? 0} <span className="text-xs font-normal text-gray-400">unidad{(conteo.SIN_HISTORICO ?? 0) === 1 ? '' : 'es'}</span></p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">Consumo total</p>
                    <p className="mt-0.5 flex items-center gap-1 text-lg font-bold text-gray-800"><Zap className="h-4 w-4 text-primary" /> {consumoTotal.toFixed(1)} <span className="text-xs font-normal text-gray-400">kWh</span></p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inquilino</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Anterior</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Auditoría</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Actual</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Consumo</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Alquiler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lecturas.map((l) => {
                            // La auditoria es solo indicador visual (igual que el legacy) --
                            // no bloquea la edicion. Bloquear cuando auditoria=OK rompia el
                            // caso de una unidad recien sincronizada (actual = anterior
                            // todavia, auditoria da OK por construccion) y el de cargar mas
                            // de una lectura dentro del mismo periodo abierto (ej. lectura de
                            // corte al retirarse un inquilino, despues la de cierre).
                            const necesitaAtencion = l.auditoria_lectura_anterior !== 'OK';
                            // El ultimo tramo cierra con "Actual" (arriba) -- las sub-filas
                            // son solo las fronteras internas, cada una con su propio corte.
                            const tramosIntermedios = (l.tramos || []).slice(0, -1);

                            return (
                                <Fragment key={l.id_lectura}>
                                    <tr className={necesitaAtencion ? 'bg-warning/5' : ''}>
                                        <td className="px-4 py-2 font-medium text-gray-800">
                                            <div className="flex items-center gap-1">
                                                <span>{l.codigo_unidad} · {l.nombre_unidad}</span>
                                                {editable && puedeRegistrar && (
                                                    <IconButton icon={Plus} label="Registrar corte (lectura de control sin cambio de inquilino)" onClick={() => setCorteManualUnidad(l)} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-gray-500">{l.inquilino || '-'}</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-500">{l.lectura_anterior.toFixed(2)}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap items-center gap-1">
                                                <AuditoriaBadge estado={l.auditoria_lectura_anterior} />
                                                {l.tiene_corte_pendiente && <Badge variant="warning">Corte pendiente</Badge>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {editable ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={valores[l.id_lectura]}
                                                    onChange={(e) => setValores((v) => ({ ...v, [l.id_lectura]: e.target.value }))}
                                                    className={`w-28 rounded-md bg-white text-right font-mono text-sm focus:border-primary focus:ring-primary ${necesitaAtencion ? 'border-warning/40' : 'border-gray-300'}`}
                                                />
                                            ) : (
                                                <span className="font-mono text-gray-700">{l.lectura_actual.toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono font-semibold text-gray-700">{l.consumo.toFixed(2)} kWh</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-500">{l.monto_alquiler != null ? `S/ ${Number(l.monto_alquiler).toFixed(2)}` : '-'}</td>
                                    </tr>
                                    {tramosIntermedios.map((t) => (
                                        <tr key={`corte-${t.id_corte_hasta ?? `${l.id_lectura}-${t.fecha_hasta}`}`} className="bg-gray-50/70 text-xs text-gray-500">
                                            <td className="px-4 py-1.5 pl-8" colSpan={2}>
                                                ↳ {fmtCorta(t.fecha_desde)}–{fmtCorta(t.fecha_hasta)} · {t.inquilino || 'Vacante'}
                                            </td>
                                            <td className="px-4 py-1.5 text-right font-mono">{Number(t.lectura_desde).toFixed(2)}</td>
                                            <td className="px-4 py-1.5">
                                                {t.estado === 'CORTE_PENDIENTE' ? (
                                                    <Badge variant="warning">Corte pendiente</Badge>
                                                ) : t.estado === 'INCONSISTENTE' ? (
                                                    <Badge variant="danger">Inconsistente</Badge>
                                                ) : (
                                                    <Badge variant="gray">Corte registrado</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-1.5 text-right">
                                                {editable && t.id_corte_hasta ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={cortes[t.id_corte_hasta] ?? ''}
                                                        onChange={(e) => setCortes((v) => ({ ...v, [t.id_corte_hasta]: e.target.value }))}
                                                        placeholder="lectura de corte"
                                                        title="Lectura del medidor al momento de este cambio de ocupación"
                                                        className="w-32 rounded-md border-warning/40 bg-white text-right font-mono text-xs focus:border-primary focus:ring-primary"
                                                    />
                                                ) : (
                                                    <span className="font-mono">{t.lectura_hasta != null ? Number(t.lectura_hasta).toFixed(2) : '—'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-1.5 text-right font-mono">{t.consumo_kwh != null ? `${Number(t.consumo_kwh).toFixed(2)} kWh` : '—'}</td>
                                            <td></td>
                                        </tr>
                                    ))}
                                </Fragment>
                            );
                        })}
                        {lecturas.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Sin lecturas para este periodo — usá "Sincronizar unidades".</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {corteManualUnidad && (
                <RegistrarCorteModal unidad={corteManualUnidad} periodo={periodo} onClose={() => setCorteManualUnidad(null)} />
            )}
        </AdminLayout>
    );
}

export default function Index({ periodo, periodos, lecturas }) {
    return <LecturasTabla key={periodo.id_periodo} periodo={periodo} periodos={periodos} lecturas={lecturas} />;
}
