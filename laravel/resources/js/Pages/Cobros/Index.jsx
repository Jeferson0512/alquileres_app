import Badge from '@/Components/Badge';
import IconButton from '@/Components/IconButton';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmDialog from '@/lib/confirm';
import formatDate from '@/lib/date';
import promptDialog from '@/lib/promptDialog';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Ban, Eye, SlidersHorizontal, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

const ESTADO_COBRO_VARIANTS = { PENDIENTE: 'warning', PARCIAL: 'info', PAGADO: 'success', ANULADO: 'gray' };

function EstadoBadge({ estado }) {
    return <Badge variant={ESTADO_COBRO_VARIANTS[estado] ?? 'gray'}>{estado}</Badge>;
}

function PagoModal({ cobro, onClose }) {
    const [conceptos, setConceptos] = useState(null);
    const [seleccion, setSeleccion] = useState({}); // { id_cobro_detalle: monto_aplicado }

    const { data, setData, post, processing, errors } = useForm({
        id_cobro: cobro.id_cobro,
        fecha_pago: new Date().toISOString().slice(0, 10),
        monto_pagado: cobro.saldo_pendiente,
        metodo_pago: 'EFECTIVO',
        numero_operacion: '',
        observacion: '',
        modo_aplicacion: 'AUTOMATICA',
        aplicaciones: [],
    });

    useEffect(() => {
        if (data.modo_aplicacion === 'MANUAL' && conceptos === null) {
            fetch(route('cobros.detalle', { id_cobro: cobro.id_cobro }))
                .then((r) => r.json())
                .then((res) => setConceptos(
                    (res.data.conceptos || []).filter((c) => Number(c.permite_pago_directo) === 1 && Number(c.saldo_pendiente) > 0)
                ));
        }
    }, [data.modo_aplicacion, conceptos, cobro.id_cobro]);

    const totalSeleccionado = Object.values(seleccion).reduce((acc, monto) => acc + (parseFloat(monto) || 0), 0);

    useEffect(() => {
        setData('aplicaciones', Object.entries(seleccion).map(([id, monto]) => ({
            id_cobro_detalle: Number(id), monto_aplicado: parseFloat(monto) || 0,
        })));
        if (data.modo_aplicacion === 'MANUAL') {
            setData('monto_pagado', totalSeleccionado);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seleccion]);

    const cambiarModo = (modo) => {
        setData('modo_aplicacion', modo);
        if (modo === 'AUTOMATICA') {
            setData('monto_pagado', cobro.saldo_pendiente);
        }
    };

    const toggleConcepto = (concepto, checked) => {
        setSeleccion((prev) => {
            const next = { ...prev };
            if (checked) next[concepto.id_cobro_detalle] = Number(concepto.saldo_pendiente);
            else delete next[concepto.id_cobro_detalle];
            return next;
        });
    };

    const cambiarMontoConcepto = (id, monto) => {
        setSeleccion((prev) => ({ ...prev, [id]: monto }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('pagos.store'), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-3 text-base font-semibold text-gray-800">Registrar pago · {cobro.codigo_unidad}</h3>

                <div className="mb-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    <p><strong>Inquilino:</strong> {cobro.inquilino}</p>
                    <p><strong>Total cobro:</strong> S/ {Number(cobro.total_cobrar).toFixed(2)}</p>
                    <p><strong>Pendiente:</strong> S/ {Number(cobro.saldo_pendiente).toFixed(2)}</p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Fecha de pago</label>
                            <input type="date" value={data.fecha_pago} onChange={(e) => setData('fecha_pago', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Monto pagado</label>
                            <input
                                type="number" step="0.01" value={data.monto_pagado}
                                disabled={data.modo_aplicacion === 'MANUAL'}
                                onChange={(e) => setData('monto_pagado', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-100"
                            />
                            {errors.monto_pagado && <p className="mt-1 text-xs text-danger">{errors.monto_pagado}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    <div className="space-y-2 rounded-lg border border-gray-100 p-3">
                        <label className="block text-xs font-medium text-gray-500">Modo de pago</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" checked={data.modo_aplicacion === 'AUTOMATICA'} onChange={() => cambiarModo('AUTOMATICA')} />
                            Pagar completo / aplicar automático
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" checked={data.modo_aplicacion === 'MANUAL'} onChange={() => cambiarModo('MANUAL')} />
                            Pagar solo ciertos servicios
                        </label>
                        <p className="text-xs text-gray-400">
                            El pago manual registra exactamente qué conceptos pagó el inquilino, guardando el detalle por concepto.
                        </p>
                    </div>

                    {data.modo_aplicacion === 'MANUAL' && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-500">Selecciona conceptos a pagar</p>
                            {conceptos === null && <p className="text-xs text-gray-400">Cargando conceptos...</p>}
                            {conceptos?.length === 0 && <p className="text-xs text-gray-400">No hay conceptos con saldo pendiente que admitan pago directo.</p>}
                            {conceptos?.map((c) => {
                                const marcado = c.id_cobro_detalle in seleccion;
                                return (
                                    <div key={c.id_cobro_detalle} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 p-2">
                                        <label className="flex flex-1 items-center gap-2 text-sm">
                                            <input type="checkbox" checked={marcado} onChange={(e) => toggleConcepto(c, e.target.checked)} />
                                            <span>
                                                <span className="block font-medium text-gray-700">{c.nombre}</span>
                                                <span className="block text-xs text-gray-400">Saldo: S/ {Number(c.saldo_pendiente).toFixed(2)}</span>
                                            </span>
                                        </label>
                                        <input
                                            type="number" step="0.01"
                                            disabled={!marcado}
                                            max={c.saldo_pendiente}
                                            value={marcado ? seleccion[c.id_cobro_detalle] : ''}
                                            onChange={(e) => cambiarMontoConcepto(c.id_cobro_detalle, e.target.value)}
                                            className="w-24 rounded-md border-gray-300 text-sm disabled:bg-gray-100"
                                        />
                                    </div>
                                );
                            })}
                            {errors.aplicaciones && <p className="text-xs text-danger">{errors.aplicaciones}</p>}
                            <div className="rounded-md bg-primary-light px-3 py-2 text-sm font-medium text-primary-dark">
                                Seleccionado: S/ {totalSeleccionado.toFixed(2)}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-500">Observación</label>
                        <textarea value={data.observacion} onChange={(e) => setData('observacion', e.target.value)} rows={2} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
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

function ServiciosModal({ cobro, periodoId, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        id_unidad: cobro.id_unidad,
        id_persona: cobro.id_persona,
        periodo_id: periodoId,
        agua: cobro.monto_agua,
        gas: cobro.monto_gas,
        mantenimiento: cobro.otros_conceptos,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('cobros.overrides.store'), { onSuccess: onClose, preserveScroll: true });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-3 text-base font-semibold text-gray-800">Ajustar servicios · {cobro.codigo_unidad}</h3>

                <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-xs text-primary">
                    Estos montos se aplican por inquilino y reemplazan la tarifa general solo para este periodo. Después de guardar, usa "Forzar actualización" para que el cambio se refleje en la tabla de Cobros.
                </p>

                <form onSubmit={submit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Agua (S/)</label>
                            <input type="number" step="0.01" value={data.agua} onChange={(e) => setData('agua', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                            {errors.agua && <p className="mt-1 text-xs text-danger">{errors.agua}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Gas (S/)</label>
                            <input type="number" step="0.01" value={data.gas} onChange={(e) => setData('gas', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                            {errors.gas && <p className="mt-1 text-xs text-danger">{errors.gas}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Mantenimiento (S/)</label>
                        <input type="number" step="0.01" value={data.mantenimiento} onChange={(e) => setData('mantenimiento', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.mantenimiento && <p className="mt-1 text-xs text-danger">{errors.mantenimiento}</p>}
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

    const anular = async (idPago) => {
        const motivo = await promptDialog({
            title: 'Anular pago',
            inputLabel: 'Motivo de la anulación',
            confirmText: 'Anular',
        });
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
                            <span>{formatDate(p.fecha_pago)} · S/ {Number(p.monto_pagado).toFixed(2)} · {p.metodo_pago}</span>
                            <span className="flex items-center gap-2">
                                <span className={`text-xs ${p.estado === 'REGISTRADO' ? 'text-success' : 'text-gray-400'}`}>{p.estado}</span>
                                {puedeAnular && p.estado === 'REGISTRADO' && (
                                    <IconButton icon={Ban} label="Anular pago" variant="danger" onClick={() => anular(p.id_pago)} />
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

export default function Index({ periodo, periodos, cobros, carteraVencida }) {
    const { auth } = usePage().props;
    const [modalPago, setModalPago] = useState(null);
    const [modalDetalle, setModalDetalle] = useState(null);
    const [modalServicios, setModalServicios] = useState(null);
    const [buscar, setBuscar] = useState('');

    const puede = (p) => auth.permissions.includes(p);

    const cambiarPeriodo = (id) => router.get(route('cobros.index'), { periodo_id: id }, { preserveState: true });

    const generar = () => router.post(route('cobros.generar'), { periodo_id: periodo.id_periodo });
    const forzar = async () => {
        const ok = await confirmDialog({
            title: '¿Forzar actualización?',
            text: 'Esto reversa y reaplica los pagos activos de este periodo si es necesario.',
            confirmText: 'Forzar actualización',
        });
        if (ok) router.post(route('cobros.forzar'), { periodo_id: periodo.id_periodo });
    };

    const filtrados = cobros.filter((c) => !buscar || `${c.codigo_unidad} ${c.inquilino}`.toLowerCase().includes(buscar.toLowerCase()));
    const totalCarteraVencida = carteraVencida.reduce((acc, c) => acc + Number(c.saldo_pendiente), 0);

    return (
        <AdminLayout title="Cobros generados">
            <Head title="Cobros" />

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
                                    <div className="flex items-center justify-end gap-1">
                                        <IconButton icon={Eye} label="Ver detalle" onClick={() => setModalDetalle(c)} />
                                        {puede('cobros.generar') && periodo.estado === 'ABIERTO' && c.estado_pago !== 'PAGADO' && c.estado_pago !== 'ANULADO' && (
                                            <IconButton icon={SlidersHorizontal} label="Ajustar servicios (agua/gas/mantenimiento)" onClick={() => setModalServicios(c)} />
                                        )}
                                        {puede('cobros.pagos.registrar') && c.estado_pago !== 'PAGADO' && c.estado_pago !== 'ANULADO' && (
                                            <IconButton icon={Wallet} label="Registrar pago" variant="primary" onClick={() => setModalPago(c)} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtrados.length === 0 && (
                            <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-400">Sin cobros generados para este periodo.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {carteraVencida.length > 0 && (
                <section className="mt-6 overflow-hidden rounded-lg border border-amber-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <h3 className="text-sm font-semibold text-gray-800">Cartera vencida — periodos anteriores</h3>
                            <Badge variant="warning">{carteraVencida.length}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-gray-500">Saldos de meses ya cerrados. No cambia según el periodo que elijas arriba.</p>
                            <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-danger shadow-sm">
                                Total adeudado: S/ {totalCarteraVencida.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Periodo</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Unidad</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Inquilino</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500">Pagado</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500">Saldo</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500">Vencimiento</th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {carteraVencida.map((c) => (
                                    <tr key={c.id_cobro}>
                                        <td className="px-3 py-2 text-gray-500">{c.periodo_label}</td>
                                        <td className="px-3 py-2 font-medium text-gray-800">{c.codigo_unidad}</td>
                                        <td className="px-3 py-2 text-gray-500">{c.inquilino}</td>
                                        <td className="px-3 py-2 text-right text-gray-500">{Number(c.total_cobrar).toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right text-gray-500">{Number(c.pagado_total).toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right font-semibold text-danger">{Number(c.saldo_pendiente).toFixed(2)}</td>
                                        <td className="px-3 py-2 text-gray-500">{formatDate(c.fecha_vencimiento)}</td>
                                        <td className="px-3 py-2 text-right">
                                            {puede('cobros.pagos.registrar') && (
                                                <IconButton icon={Wallet} label="Registrar pago" variant="primary" onClick={() => setModalPago(c)} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={5} className="px-3 py-2 text-right text-xs font-semibold uppercase text-gray-500">Total adeudado</td>
                                    <td className="px-3 py-2 text-right text-sm font-bold text-danger">S/ {totalCarteraVencida.toFixed(2)}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </section>
            )}

            {modalPago && <PagoModal cobro={modalPago} onClose={() => setModalPago(null)} />}
            {modalDetalle && <DetalleModal cobro={modalDetalle} onClose={() => setModalDetalle(null)} puedeAnular={puede('cobros.pagos.anular')} />}
            {modalServicios && <ServiciosModal cobro={modalServicios} periodoId={periodo.id_periodo} onClose={() => setModalServicios(null)} />}
        </AdminLayout>
    );
}
