import Badge from '@/Components/Badge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, HelpCircle, RefreshCcw, Zap } from 'lucide-react';
import { useState } from 'react';

const AUDITORIA_VARIANTS = { OK: 'info', REVISAR: 'warning', SIN_HISTORICO: 'gray' };
const AUDITORIA_LABELS = { OK: 'OK', REVISAR: 'Revisar', SIN_HISTORICO: 'Sin histórico' };

function AuditoriaBadge({ estado }) {
    return <Badge variant={AUDITORIA_VARIANTS[estado] ?? 'gray'}>{AUDITORIA_LABELS[estado] ?? estado}</Badge>;
}

// Cambiar de periodo navega con preserveState, así que esta instancia del
// componente sigue montada -- pero useState(() => ...) solo lee su valor
// inicial una vez. Sin remount, la tabla se queda pegada en las lecturas del
// periodo anterior aunque lleguen props nuevas. index.jsx delega en este
// componente con key={periodo.id_periodo} para forzar el remount.
function LecturasTabla({ periodo, periodos, lecturas }) {
    const { errors, auth } = usePage().props;
    const [valores, setValores] = useState(() => Object.fromEntries(lecturas.map((l) => [l.id_lectura, l.lectura_actual])));
    const [saving, setSaving] = useState(false);

    const puedeRegistrar = auth.permissions.includes('lecturas.registrar');
    const puedeSincronizar = auth.permissions.includes('lecturas.sincronizar');
    const editable = periodo.estado === 'ABIERTO';

    const cambiarPeriodo = (id) => {
        router.get(route('lecturas.index'), { periodo_id: id }, { preserveState: true });
    };

    const guardar = () => {
        setSaving(true);
        const items = lecturas.map((l) => ({ id_lectura: l.id_lectura, lectura_actual: parseFloat(valores[l.id_lectura]) || 0 }));
        router.post(route('lecturas.save'), { items, periodo_id: periodo.id_periodo }, {
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

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">OK</p>
                    <p className="mt-0.5 text-lg font-bold text-success">{conteo.OK ?? 0} <span className="text-xs font-normal text-gray-400">unidad{(conteo.OK ?? 0) === 1 ? '' : 'es'}</span></p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-400">A revisar</p>
                    <p className="mt-0.5 text-lg font-bold text-warning">{conteo.REVISAR ?? 0} <span className="text-xs font-normal text-gray-400">unidad{(conteo.REVISAR ?? 0) === 1 ? '' : 'es'}</span></p>
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
                            const necesitaAtencion = l.auditoria_lectura_anterior !== 'OK';
                            // Las filas OK ya coinciden con el histórico esperado -- se
                            // dejan bloqueadas para no pisarlas sin querer durante la
                            // edición en lote; las que necesitan atención (Revisar/Sin
                            // histórico) quedan editables y resaltadas.
                            const puedeEditarFila = editable && necesitaAtencion;
                            return (
                                <tr key={l.id_lectura} className={necesitaAtencion ? 'bg-warning/5' : ''}>
                                    <td className="px-4 py-2 font-medium text-gray-800">{l.codigo_unidad} · {l.nombre_unidad}</td>
                                    <td className="px-4 py-2 text-gray-500">{l.inquilino || '-'}</td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-500">{l.lectura_anterior.toFixed(2)}</td>
                                    <td className="px-4 py-2"><AuditoriaBadge estado={l.auditoria_lectura_anterior} /></td>
                                    <td className="px-4 py-2 text-right">
                                        {puedeEditarFila ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={valores[l.id_lectura]}
                                                onChange={(e) => setValores((v) => ({ ...v, [l.id_lectura]: e.target.value }))}
                                                className="w-28 rounded-md border-warning/40 bg-white text-right font-mono text-sm focus:border-primary focus:ring-primary"
                                            />
                                        ) : editable ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={valores[l.id_lectura]}
                                                readOnly
                                                title="Ya coincide con el histórico esperado."
                                                className="w-28 rounded-md border-gray-200 bg-gray-50 text-right font-mono text-sm text-gray-500"
                                            />
                                        ) : (
                                            <span className="font-mono text-gray-700">{l.lectura_actual.toFixed(2)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-right font-mono font-semibold text-gray-700">{l.consumo.toFixed(2)} kWh</td>
                                    <td className="px-4 py-2 text-right font-mono text-gray-500">{l.monto_alquiler != null ? `S/ ${Number(l.monto_alquiler).toFixed(2)}` : '-'}</td>
                                </tr>
                            );
                        })}
                        {lecturas.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-400">Sin lecturas para este periodo — usá "Sincronizar unidades".</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

export default function Index({ periodo, periodos, lecturas }) {
    return <LecturasTabla key={periodo.id_periodo} periodo={periodo} periodos={periodos} lecturas={lecturas} />;
}
