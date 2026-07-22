import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function EstadoBadge({ estado }) {
    const styles = {
        PENDIENTE: 'bg-amber-50 text-warning',
        PARCIAL: 'bg-blue-50 text-primary',
        PAGADO: 'bg-green-50 text-success',
        ANULADO: 'bg-gray-100 text-gray-500',
    };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[estado] ?? ''}`}>{estado}</span>;
}

function PagoModal({ cobro, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        id_cobro: cobro.id_cobro,
        fecha_pago: new Date().toISOString().slice(0, 10),
        monto_pagado: cobro.saldo_pendiente,
        metodo_pago: 'EFECTIVO',
        numero_operacion: '',
        observacion: '',
        modo_aplicacion: 'AUTOMATICA',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('pagos.store'), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Registrar pago · {cobro.codigo_unidad}</h3>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha de pago</label>
                        <input type="date" value={data.fecha_pago} onChange={(e) => setData('fecha_pago', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Monto pagado (saldo: S/ {Number(cobro.saldo_pendiente).toFixed(2)})</label>
                        <input type="number" step="0.01" value={data.monto_pagado} onChange={(e) => setData('monto_pagado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.monto_pagado && <p className="mt-1 text-xs text-danger">{errors.monto_pagado}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Método de pago</label>
                        <select value={data.metodo_pago} onChange={(e) => setData('metodo_pago', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="YAPE">Yape</option>
                            <option value="PLIN">Plin</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                            <option value="OTRO">Otro</option>
                        </select>
                    </div>
                    {data.metodo_pago !== 'EFECTIVO' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Nº de operación</label>
                            <input value={data.numero_operacion} onChange={(e) => setData('numero_operacion', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Observación</label>
                        <input value={data.observacion} onChange={(e) => setData('observacion', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    {errors.general && <p className="text-xs text-danger">{errors.general}</p>}
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">Guardar</button>
                        <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DetalleModal({ cobro, onClose, puedeAnular }) {
    const [detalle, setDetalle] = useState(null);

    useEffect(() => {
        fetch(route('cobros.detalle', { id_cobro: cobro.id_cobro }))
            .then((r) => r.json())
            .then((res) => setDetalle(res.data));
    }, [cobro.id_cobro]);

    const anular = (idPago) => {
        const motivo = prompt('Motivo de la anulación:');
        if (!motivo) return;
        router.post(route('pagos.reversa', idPago), { motivo_reversa: motivo }, { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Detalle · {cobro.codigo_unidad} — {cobro.inquilino}</h3>

                {detalle && (
                    <table className="mb-4 w-full text-sm">
                        <thead><tr className="text-left text-xs text-gray-500"><th>Concepto</th><th className="text-right">Programado</th><th className="text-right">Pagado</th><th className="text-right">Saldo</th></tr></thead>
                        <tbody>
                            {detalle.conceptos.map((c) => (
                                <tr key={c.id_cobro_detalle} className="border-t border-gray-100">
                                    <td className="py-1">{c.nombre}</td>
                                    <td className="py-1 text-right">{Number(c.monto_programado).toFixed(2)}</td>
                                    <td className="py-1 text-right">{Number(c.monto_pagado).toFixed(2)}</td>
                                    <td className="py-1 text-right font-medium">{Number(c.saldo_pendiente).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Pagos registrados</h4>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                    {detalle && detalle.pagos.length === 0 && <p className="text-sm text-gray-400">Sin pagos registrados.</p>}
                    {detalle && detalle.pagos.map((p) => (
                        <div key={p.id_pago} className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm">
                            <span>{p.fecha_pago} · S/ {Number(p.monto_pagado).toFixed(2)} · {p.metodo_pago}</span>
                            <span className="flex items-center gap-2">
                                <span className={`text-xs ${p.estado === 'REGISTRADO' ? 'text-success' : 'text-gray-400'}`}>{p.estado}</span>
                                {puedeAnular && p.estado === 'REGISTRADO' && (
                                    <button onClick={() => anular(p.id_pago)} className="text-xs font-medium text-danger hover:opacity-75">Anular</button>
                                )}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ periodo, periodos, cobros }) {
    const { flash, auth } = usePage().props;
    const [modalPago, setModalPago] = useState(null);
    const [modalDetalle, setModalDetalle] = useState(null);
    const [buscar, setBuscar] = useState('');

    const puede = (p) => auth.permissions.includes(p);

    const cambiarPeriodo = (id) => router.get(route('cobros.index'), { periodo_id: id }, { preserveState: true });

    const generar = () => router.post(route('cobros.generar'), { periodo_id: periodo.id_periodo });
    const forzar = () => {
        if (confirm('¿Forzar actualización de los cobros de este periodo? Esto reversa y reaplica los pagos activos si es necesario.')) {
            router.post(route('cobros.forzar'), { periodo_id: periodo.id_periodo });
        }
    };

    const filtrados = cobros.filter((c) => !buscar || `${c.codigo_unidad} ${c.inquilino}`.toLowerCase().includes(buscar.toLowerCase()));

    return (
        <AdminLayout title="Cobros generados">
            <Head title="Cobros" />

            {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <select value={periodo.id_periodo} onChange={(e) => cambiarPeriodo(e.target.value)} className="rounded-lg border-gray-300 text-sm">
                        {periodos.map((p) => <option key={p.id_periodo} value={p.id_periodo}>{p.mes}/{p.anio} ({p.estado})</option>)}
                    </select>
                    <input type="search" placeholder="Buscar..." value={buscar} onChange={(e) => setBuscar(e.target.value)} className="rounded-lg border-gray-300 text-sm" />
                </div>
                <div className="flex gap-2">
                    {puede('cobros.generar') && periodo.estado === 'ABIERTO' && (
                        <button onClick={generar} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Generar cobros</button>
                    )}
                    {puede('cobros.forzar_actualizacion') && periodo.estado === 'ABIERTO' && (
                        <button onClick={forzar} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Forzar actualización</button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Inquilino</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Alquiler</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Luz</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Agua</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Otros</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Saldo</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtrados.map((c) => (
                            <tr key={c.id_cobro}>
                                <td className="px-3 py-2 font-medium text-gray-800">{c.codigo_unidad}</td>
                                <td className="px-3 py-2 text-gray-500">{c.inquilino}</td>
                                <td className="px-3 py-2 text-right text-gray-500">{Number(c.monto_alquiler).toFixed(2)}</td>
                                <td className="px-3 py-2 text-right text-gray-500">{(Number(c.monto_luz) + Number(c.ajuste_minimo_luz)).toFixed(2)}</td>
                                <td className="px-3 py-2 text-right text-gray-500">{Number(c.monto_agua).toFixed(2)}</td>
                                <td className="px-3 py-2 text-right text-gray-500">{(Number(c.monto_gas) + Number(c.otros_conceptos)).toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-800">{Number(c.total_cobrar).toFixed(2)}</td>
                                <td className="px-3 py-2 text-right text-danger">{Number(c.saldo_pendiente).toFixed(2)}</td>
                                <td className="px-3 py-2"><EstadoBadge estado={c.estado_pago} /></td>
                                <td className="px-3 py-2 text-right">
                                    <button onClick={() => setModalDetalle(c)} className="mr-3 text-sm font-medium text-gray-600 hover:text-gray-800">Detalle</button>
                                    {puede('cobros.pagos.registrar') && c.estado_pago !== 'PAGADO' && c.estado_pago !== 'ANULADO' && (
                                        <button onClick={() => setModalPago(c)} className="text-sm font-medium text-primary hover:text-primary-dark">Registrar pago</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtrados.length === 0 && (
                            <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-400">Sin cobros generados para este periodo.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalPago && <PagoModal cobro={modalPago} onClose={() => setModalPago(null)} />}
            {modalDetalle && <DetalleModal cobro={modalDetalle} onClose={() => setModalDetalle(null)} puedeAnular={puede('cobros.pagos.anular')} />}
        </AdminLayout>
    );
}
