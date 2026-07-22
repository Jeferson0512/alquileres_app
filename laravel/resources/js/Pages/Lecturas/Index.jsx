import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function AuditoriaBadge({ estado }) {
    const styles = {
        OK: 'bg-primary-light text-primary-dark',
        REVISAR: 'bg-amber-50 text-warning',
        SIN_HISTORICO: 'bg-gray-100 text-gray-500',
    };
    const labels = { OK: 'OK', REVISAR: 'Revisar', SIN_HISTORICO: 'Sin histórico' };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[estado]}`}>{labels[estado]}</span>;
}

export default function Index({ periodo, periodos, lecturas }) {
    const { flash, errors, auth } = usePage().props;
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

    return (
        <AdminLayout title="Lecturas">
            <Head title="Lecturas" />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}
            {errors?.general && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{errors.general}</div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <select
                    value={periodo.id_periodo}
                    onChange={(e) => cambiarPeriodo(e.target.value)}
                    className="rounded-lg border-gray-300 text-sm"
                >
                    {periodos.map((p) => (
                        <option key={p.id_periodo} value={p.id_periodo}>{p.mes}/{p.anio} ({p.estado})</option>
                    ))}
                </select>

                <div className="flex gap-2">
                    {puedeSincronizar && editable && (
                        <button onClick={sincronizar} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Sincronizar unidades
                        </button>
                    )}
                    {puedeRegistrar && editable && (
                        <button onClick={guardar} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                            Guardar lecturas
                        </button>
                    )}
                </div>
            </div>

            {!editable && (
                <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">Este periodo está {periodo.estado.toLowerCase()} — solo lectura.</div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inquilino</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Lectura anterior</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Auditoría</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Lectura actual</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Consumo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {lecturas.map((l) => (
                            <tr key={l.id_lectura}>
                                <td className="px-4 py-2 font-medium text-gray-800">{l.codigo_unidad} · {l.nombre_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{l.inquilino || '-'}</td>
                                <td className="px-4 py-2 text-right text-gray-500">{l.lectura_anterior.toFixed(2)}</td>
                                <td className="px-4 py-2"><AuditoriaBadge estado={l.auditoria_lectura_anterior} /></td>
                                <td className="px-4 py-2 text-right">
                                    {editable ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={valores[l.id_lectura]}
                                            onChange={(e) => setValores((v) => ({ ...v, [l.id_lectura]: e.target.value }))}
                                            className="w-28 rounded-md border-gray-300 text-right text-sm"
                                        />
                                    ) : l.lectura_actual.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-right font-medium text-gray-700">{l.consumo.toFixed(2)} kWh</td>
                            </tr>
                        ))}
                        {lecturas.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Sin lecturas para este periodo — usá "Sincronizar unidades".</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
