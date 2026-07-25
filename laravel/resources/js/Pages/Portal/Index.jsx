import Badge from '@/Components/Badge';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, useForm } from '@inertiajs/react';
import { Download, ImageUp, QrCode, X, ZoomIn } from 'lucide-react';
import { useState } from 'react';

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

const ESTADO_COBRO_VARIANTS = { PENDIENTE: 'warning', PARCIAL: 'info', PAGADO: 'success', ANULADO: 'gray' };

function EstadoBadge({ estado }) {
    return <Badge variant={ESTADO_COBRO_VARIANTS[estado] ?? 'gray'}>{estado}</Badge>;
}

const COMPROBANTE_VARIANTS = { PENDIENTE: 'warning', APROBADO: 'success', RECHAZADO: 'danger' };
const COMPROBANTE_LABELS = { PENDIENTE: 'En revisión', APROBADO: 'Pago aprobado', RECHAZADO: 'Rechazado' };

function ComprobanteBadge({ estado }) {
    return <Badge variant={COMPROBANTE_VARIANTS[estado] ?? 'gray'}>{COMPROBANTE_LABELS[estado] ?? estado}</Badge>;
}

function SubirComprobanteForm({ cobro, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        id_cobro: cobro.id_cobro,
        monto_declarado: cobro.saldo_pendiente,
        fecha_pago_declarada: new Date().toISOString().slice(0, 10),
        metodo_pago: 'YAPE',
        numero_operacion: '',
        imagen: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('portal.comprobantes.store'), {
            forceFormData: true,
            onSuccess: onClose,
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 space-y-2 rounded-lg border border-gray-100 bg-surface p-3">
            {errors.general && <p className="text-xs text-danger">{errors.general}</p>}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium text-gray-500">Monto pagado (S/)</label>
                    <input type="number" step="0.01" value={data.monto_declarado} onChange={(e) => setData('monto_declarado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    {errors.monto_declarado && <p className="mt-1 text-xs text-danger">{errors.monto_declarado}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Fecha de pago</label>
                    <input type="date" value={data.fecha_pago_declarada} onChange={(e) => setData('fecha_pago_declarada', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    {errors.fecha_pago_declarada && <p className="mt-1 text-xs text-danger">{errors.fecha_pago_declarada}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Método</label>
                    <select value={data.metodo_pago} onChange={(e) => setData('metodo_pago', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                        <option value="YAPE">Yape</option>
                        <option value="PLIN">Plin</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="OTRO">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">
                        {data.metodo_pago === 'EFECTIVO' ? '¿A quién se lo entregaste?' : 'Nº de operación'}
                    </label>
                    <input
                        value={data.numero_operacion}
                        onChange={(e) => setData('numero_operacion', e.target.value)}
                        placeholder={data.metodo_pago === 'EFECTIVO' ? 'Nombre de la persona' : ''}
                        className="mt-1 w-full rounded-md border-gray-300 text-sm"
                    />
                    {errors.numero_operacion && <p className="mt-1 text-xs text-danger">{errors.numero_operacion}</p>}
                </div>
            </div>
            {data.metodo_pago === 'EFECTIVO' && (
                <p className="text-xs text-gray-400">En efectivo no hay operación: solo dinos a quién se lo diste. La foto es opcional, pero ayuda si tienes algún respaldo (recibo, etc.).</p>
            )}
            <div>
                <label className="block text-xs font-medium text-gray-500">
                    Foto del comprobante {data.metodo_pago !== 'EFECTIVO' && '*'}
                    {data.metodo_pago === 'EFECTIVO' && <span className="text-gray-400"> (opcional)</span>}
                </label>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setData('imagen', e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-dark"
                />
                {errors.imagen && <p className="mt-1 text-xs text-danger">{errors.imagen}</p>}
            </div>
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                    Enviar
                </button>
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

function CobroCard({ cobro, comprobantesDelCobro, mostrarAccionPago }) {
    const [subiendo, setSubiendo] = useState(false);
    const pendienteRevision = comprobantesDelCobro.find((c) => c.estado === 'PENDIENTE');
    const ultimoResuelto = comprobantesDelCobro.find((c) => c.estado !== 'PENDIENTE');

    return (
        <div className="rounded-lg border border-gray-100 p-3">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{String(cobro.mes).padStart(2, '0')}/{cobro.anio}</span>
                <EstadoBadge estado={cobro.estado_pago} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div><p className="text-gray-400">Total</p><p className="font-semibold text-gray-900">{money(cobro.total_cobrar)}</p></div>
                <div><p className="text-gray-400">Pagado</p><p className="font-medium text-gray-700">{money(cobro.pagado_total)}</p></div>
                <div><p className="text-gray-400">Saldo</p><p className="font-medium text-gray-700">{money(cobro.saldo_pendiente)}</p></div>
            </div>

            {mostrarAccionPago && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                    {pendienteRevision ? (
                        <div className="flex items-center gap-2">
                            <ComprobanteBadge estado="PENDIENTE" />
                            <span className="text-xs text-gray-400">Tu comprobante está en revisión.</span>
                        </div>
                    ) : subiendo ? (
                        <SubirComprobanteForm cobro={cobro} onClose={() => setSubiendo(false)} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSubiendo(true)}
                            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
                        >
                            <ImageUp className="h-4 w-4" /> Subir comprobante de pago
                        </button>
                    )}

                    {ultimoResuelto && (
                        <div className="mt-2 flex items-center gap-2">
                            <ComprobanteBadge estado={ultimoResuelto.estado} />
                            {ultimoResuelto.estado === 'RECHAZADO' && ultimoResuelto.motivo_rechazo && (
                                <span className="text-xs text-gray-500">{ultimoResuelto.motivo_rechazo}</span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Index({ persona, ocupacion, cobros, vencimiento, configCobranza, misComprobantes }) {
    const [verHistorialCompleto, setVerHistorialCompleto] = useState(false);
    const [qrError, setQrError] = useState(false);
    const [qrAbierto, setQrAbierto] = useState(false);

    const pendientes = cobros.filter((c) => c.estado_pago !== 'PAGADO' && c.estado_pago !== 'ANULADO');
    const historialBase = cobros.filter((c) => c.estado_pago === 'PAGADO' || c.estado_pago === 'ANULADO');
    const historial = verHistorialCompleto ? historialBase : historialBase.slice(0, 6);

    const comprobantesPorCobro = (idCobro) => misComprobantes.filter((c) => c.id_cobro === idCobro);

    return (
        <PortalLayout title={`Hola, ${persona.nombres}`}>
            <Head title="Mi cuenta" />

            {vencimiento && (
                <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${vencimiento.nivel === 'URGENTE' ? 'bg-red-50 text-danger' : 'bg-amber-50 text-warning'}`}>
                    <strong>{vencimiento.nivel === 'URGENTE' ? 'Urgente' : 'Próximo a vencer'}:</strong> {vencimiento.mensaje}
                </div>
            )}

            {ocupacion && (
                <section className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-2 text-sm font-semibold text-gray-800">Mi unidad</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-xs text-gray-400">Unidad</p>
                            <p className="font-medium text-gray-800">{ocupacion.unidad?.codigo_unidad} · {ocupacion.unidad?.nombre_unidad}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Alquiler vigente</p>
                            <p className="font-medium text-gray-800">{money(ocupacion.monto_alquiler)}</p>
                        </div>
                    </div>
                </section>
            )}

            {(configCobranza?.yape_qr || configCobranza?.yape_titular) && (
                <section className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                    <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        <QrCode className="h-4 w-4 text-primary" /> Cómo pagar
                    </h2>
                    <div className="flex items-center gap-4">
                        {configCobranza.yape_qr && !qrError ? (
                            <button
                                type="button"
                                onClick={() => setQrAbierto(true)}
                                className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-100"
                            >
                                <img
                                    src={configCobranza.yape_qr}
                                    alt="QR de Yape"
                                    onError={() => setQrError(true)}
                                    className="h-full w-full object-contain"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                                    <ZoomIn className="h-6 w-6" />
                                </span>
                            </button>
                        ) : null}
                        <div className="text-sm">
                            <p className="text-xs text-gray-400">Yape</p>
                            <p className="font-medium text-gray-800">{configCobranza.yape_titular || '—'}</p>
                            <p className="text-gray-600">{configCobranza.yape_numero || '—'}</p>
                        </div>
                    </div>
                </section>
            )}

            {qrAbierto && configCobranza?.yape_qr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setQrAbierto(false)}>
                    <div className="flex max-w-xs flex-col items-center gap-4 rounded-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex w-full items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">QR de Yape</p>
                            <button type="button" onClick={() => setQrAbierto(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <img src={configCobranza.yape_qr} alt="QR de Yape" className="h-64 w-64 object-contain" />
                        <a
                            href={configCobranza.yape_qr}
                            download="qr-yape.jpg"
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                        >
                            <Download className="h-4 w-4" /> Descargar QR
                        </a>
                    </div>
                </div>
            )}

            <section className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-800">Cobros pendientes</h2>
                {pendientes.length === 0 ? (
                    <p className="py-4 text-sm text-gray-400">No tienes cobros pendientes. ¡Estás al día!</p>
                ) : (
                    <div className="space-y-3">
                        {pendientes.map((c) => (
                            <CobroCard key={c.id_cobro} cobro={c} comprobantesDelCobro={comprobantesPorCobro(c.id_cobro)} mostrarAccionPago />
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-gray-800">Historial de cobros</h2>
                {cobros.length === 0 ? (
                    <p className="py-4 text-sm text-gray-400">Todavía no tienes cobros generados.</p>
                ) : historialBase.length === 0 ? (
                    <p className="py-4 text-sm text-gray-400">Aún no tienes cobros pagados en tu historial.</p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {historial.map((c) => (
                                <CobroCard key={c.id_cobro} cobro={c} comprobantesDelCobro={comprobantesPorCobro(c.id_cobro)} mostrarAccionPago={false} />
                            ))}
                        </div>
                        {historialBase.length > 6 && (
                            <button
                                type="button"
                                onClick={() => setVerHistorialCompleto((v) => !v)}
                                className="mt-3 text-sm font-medium text-primary hover:text-primary-dark"
                            >
                                {verHistorialCompleto ? 'Ver menos' : `Ver historial completo (${historialBase.length})`}
                            </button>
                        )}
                    </>
                )}
            </section>
        </PortalLayout>
    );
}
