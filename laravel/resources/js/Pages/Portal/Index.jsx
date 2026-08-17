import Badge from '@/Components/Badge';
import formatDate from '@/lib/date';
import logError from '@/lib/logError';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ChevronLeft, ChevronRight, Download, Eye, FileDown, Flame, ImageUp, QrCode, X, Zap, ZoomIn } from 'lucide-react';
import { Fragment, useState } from 'react';
import Chart from 'react-apexcharts';

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

const MESES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES_LARGO = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const ESTADO_COBRO_VARIANTS = { PENDIENTE: 'warning', PARCIAL: 'info', PAGADO: 'success', ANULADO: 'gray' };

function EstadoBadge({ estado }) {
    return <Badge variant={ESTADO_COBRO_VARIANTS[estado] ?? 'gray'}>{estado}</Badge>;
}

const COMPROBANTE_VARIANTS = { PENDIENTE: 'warning', APROBADO: 'success', RECHAZADO: 'danger' };
const COMPROBANTE_LABELS = { PENDIENTE: 'En revisión', APROBADO: 'Pago aprobado', RECHAZADO: 'Rechazado' };

function ComprobanteBadge({ estado }) {
    return <Badge variant={COMPROBANTE_VARIANTS[estado] ?? 'gray'}>{COMPROBANTE_LABELS[estado] ?? estado}</Badge>;
}

// Un comprobante puede estar en revisión (recién subido) o ya resuelto
// (aprobado/rechazado) -- tanto la card mobile como la fila de tabla
// desktop necesitan ambos estados para decidir qué acción mostrar.
function derivarComprobante(comprobantesDelCobro) {
    return {
        pendienteRevision: comprobantesDelCobro.find((c) => c.estado === 'PENDIENTE'),
        ultimoResuelto: comprobantesDelCobro.find((c) => c.estado !== 'PENDIENTE'),
    };
}

// Resumen "Alquiler S/150 · Agua S/12 · Luz S/18.40" para la columna
// Detalle de la tabla de Pendientes -- mismos campos que ya trae
// CobroService::listarParaPersona(), solo se omiten los conceptos en 0.
function desglose(cobro) {
    const partes = [];
    if (Number(cobro.monto_alquiler) > 0) partes.push(`Alquiler ${money(cobro.monto_alquiler)}`);
    const luz = Number(cobro.monto_luz || 0) + Number(cobro.ajuste_minimo_luz || 0);
    if (luz > 0) partes.push(`Luz ${money(luz)}`);
    if (Number(cobro.monto_agua) > 0) partes.push(`Agua ${money(cobro.monto_agua)}`);
    if (Number(cobro.monto_gas) > 0) partes.push(`Gas ${money(cobro.monto_gas)}`);
    if (Number(cobro.otros_conceptos) > 0) partes.push(`Otros ${money(cobro.otros_conceptos)}`);
    return partes.join(' · ');
}

function WhatsAppIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.13-.28.28-.12.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.27.14.43.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.27.13.44.2.51.31.07.11.07.63-.17 1.31z" />
        </svg>
    );
}

function WhatsAppFab({ numero }) {
    if (!numero) return null;

    return (
        <a
            href={`https://wa.me/${numero}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Escribir por WhatsApp"
            className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-105"
        >
            <WhatsAppIcon className="h-7 w-7" />
        </a>
    );
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
        <form onSubmit={submit} className="space-y-2 rounded-lg border border-gray-100 bg-surface p-3 dark:border-slate-700 dark:bg-slate-800/60">
            {errors.general && <p className="text-xs text-danger">{errors.general}</p>}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Monto pagado (S/)</label>
                    <input type="number" step="0.01" value={data.monto_declarado} onChange={(e) => setData('monto_declarado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
                    {errors.monto_declarado && <p className="mt-1 text-xs text-danger">{errors.monto_declarado}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Fecha de pago</label>
                    <input type="date" value={data.fecha_pago_declarada} onChange={(e) => setData('fecha_pago_declarada', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
                    {errors.fecha_pago_declarada && <p className="mt-1 text-xs text-danger">{errors.fecha_pago_declarada}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Método</label>
                    <select value={data.metodo_pago} onChange={(e) => setData('metodo_pago', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
                        <option value="YAPE">Yape</option>
                        <option value="PLIN">Plin</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="OTRO">Otro</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">
                        {data.metodo_pago === 'EFECTIVO' ? '¿A quién se lo entregaste?' : 'Nº de operación'}
                    </label>
                    <input
                        value={data.numero_operacion}
                        onChange={(e) => setData('numero_operacion', e.target.value)}
                        placeholder={data.metodo_pago === 'EFECTIVO' ? 'Nombre de la persona' : ''}
                        className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                    {errors.numero_operacion && <p className="mt-1 text-xs text-danger">{errors.numero_operacion}</p>}
                </div>
            </div>
            {data.metodo_pago === 'EFECTIVO' && (
                <p className="text-xs text-gray-400 dark:text-slate-500">En efectivo no hay operación: solo dinos a quién se lo diste. La foto es opcional, pero ayuda si tienes algún respaldo (recibo, etc.).</p>
            )}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">
                    Foto del comprobante {data.metodo_pago !== 'EFECTIVO' && '*'}
                    {data.metodo_pago === 'EFECTIVO' && <span className="text-gray-400 dark:text-slate-500"> (opcional)</span>}
                </label>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setData('imagen', e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-dark dark:text-slate-400"
                />
                {errors.imagen && <p className="mt-1 text-xs text-danger">{errors.imagen}</p>}
            </div>
            <div className="flex gap-2 pt-1">
                <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                    Enviar
                </button>
                <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                    Cancelar
                </button>
            </div>
        </form>
    );
}

const STRIPE_COLOR = { PENDIENTE: 'bg-warning', PARCIAL: 'bg-primary', PAGADO: 'bg-success', ANULADO: 'bg-gray-300 dark:bg-slate-600' };

function ReciboLink({ cobro }) {
    return (
        <a
            href={route('portal.recibo', cobro.id_cobro)}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver recibo (PDF)"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark dark:text-blue-400"
        >
            <FileDown className="h-3.5 w-3.5" /> Recibo
        </a>
    );
}

// En vez de navegar a la imagen directamente (que en el pasado terminaba
// en la página de error cruda de Laravel cuando el archivo no existía en
// disco), abre una previsualización dentro del portal -- si la imagen
// falla, se ve un mensaje entendible en vez de un error de servidor.
function VerComprobanteLink({ comprobante, onPreview }) {
    if (!comprobante) return null;

    return (
        <button
            type="button"
            onClick={() => onPreview(comprobante)}
            title="Ver comprobante enviado"
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
            <Eye className="h-3.5 w-3.5" /> Ver comprobante
        </button>
    );
}

function ComprobantePreviewModal({ comprobante, onClose }) {
    const [error, setError] = useState(false);

    if (!comprobante) return null;

    const src = route('comprobantes.imagen', comprobante.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 rounded-lg bg-white p-5 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">Comprobante enviado</p>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {error ? (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <AlertTriangle className="h-8 w-8 text-warning" />
                        <p className="text-sm font-medium text-gray-700 dark:text-slate-200">No se pudo cargar la imagen</p>
                        <p className="max-w-xs text-xs text-gray-400 dark:text-slate-500">El archivo de este comprobante ya no está disponible. Si necesitas verificarlo, contáctanos.</p>
                    </div>
                ) : (
                    <img
                        src={src}
                        alt="Comprobante de pago"
                        className="max-h-[65vh] w-full overflow-auto rounded-lg object-contain"
                        onError={() => {
                            setError(true);
                            logError('No se pudo cargar la imagen del comprobante', { comprobanteId: comprobante.id, src });
                        }}
                    />
                )}
            </div>
        </div>
    );
}

// Mobile: una card por cobro, con toda la accion de pago inline.
function CobroCard({ cobro, comprobantesDelCobro, mostrarAccionPago, onVerComprobante }) {
    const [subiendo, setSubiendo] = useState(false);
    const { pendienteRevision, ultimoResuelto } = derivarComprobante(comprobantesDelCobro);

    return (
        <div className="flex overflow-hidden rounded-lg border border-gray-100 dark:border-slate-700">
            <span className={`w-1 shrink-0 ${STRIPE_COLOR[cobro.estado_pago] ?? 'bg-gray-300'}`} />
            <div className="flex-1 p-3">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">{String(cobro.mes).padStart(2, '0')}/{cobro.anio}</span>
                    <div className="flex items-center gap-2">
                        <ReciboLink cobro={cobro} />
                        <EstadoBadge estado={cobro.estado_pago} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div><p className="text-gray-400 dark:text-slate-500">Total</p><p className="font-semibold text-gray-900 dark:text-slate-100">{money(cobro.total_cobrar)}</p></div>
                    <div><p className="text-gray-400 dark:text-slate-500">Pagado</p><p className="font-medium text-gray-700 dark:text-slate-300">{money(cobro.pagado_total)}</p></div>
                    <div><p className="text-gray-400 dark:text-slate-500">Saldo</p><p className="font-medium text-gray-700 dark:text-slate-300">{money(cobro.saldo_pendiente)}</p></div>
                </div>

                {mostrarAccionPago ? (
                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-slate-700">
                        {pendienteRevision ? (
                            <div className="flex items-center gap-2">
                                <ComprobanteBadge estado="PENDIENTE" />
                                <span className="text-xs text-gray-400 dark:text-slate-500">Tu comprobante está en revisión.</span>
                            </div>
                        ) : subiendo ? (
                            <SubirComprobanteForm cobro={cobro} onClose={() => setSubiendo(false)} />
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSubiendo(true)}
                                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark dark:text-blue-400"
                            >
                                <ImageUp className="h-4 w-4" /> Subir comprobante de pago
                            </button>
                        )}

                        {ultimoResuelto && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <ComprobanteBadge estado={ultimoResuelto.estado} />
                                {ultimoResuelto.estado === 'RECHAZADO' && ultimoResuelto.motivo_rechazo && (
                                    <span className="text-xs text-gray-500 dark:text-slate-400">{ultimoResuelto.motivo_rechazo}</span>
                                )}
                                <VerComprobanteLink comprobante={ultimoResuelto} onPreview={onVerComprobante} />
                            </div>
                        )}
                    </div>
                ) : ultimoResuelto ? (
                    <div className="mt-2 border-t border-gray-100 pt-2 dark:border-slate-700">
                        <VerComprobanteLink comprobante={ultimoResuelto} onPreview={onVerComprobante} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

// Desktop: panel "Cobros pendientes" -- tabla con el desglose de conceptos
// en una sola linea por fila (Periodo · Detalle · Saldo · Estado · Accion),
// igual que en el mockup de escritorio.
function PendientesPanel({ pendientes, comprobantesPorCobro }) {
    const [expandido, setExpandido] = useState(null);

    return (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Cobros pendientes</h2>
                <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-gray-500 dark:bg-slate-800 dark:text-slate-400">{pendientes.length}</span>
            </div>
            {pendientes.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 dark:text-slate-500">No tienes cobros pendientes. ¡Estás al día!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-surface text-xs uppercase tracking-wide text-gray-400 dark:bg-slate-800/60 dark:text-slate-500">
                                <th className="px-5 py-2.5 font-medium">Periodo</th>
                                <th className="px-5 py-2.5 font-medium">Detalle</th>
                                <th className="px-5 py-2.5 text-right font-medium">Saldo</th>
                                <th className="px-5 py-2.5 font-medium">Estado</th>
                                <th className="px-5 py-2.5 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendientes.map((cobro) => {
                                const { pendienteRevision } = derivarComprobante(comprobantesPorCobro(cobro.id_cobro));
                                return (
                                    <Fragment key={cobro.id_cobro}>
                                        <tr className="border-t border-gray-100 dark:border-slate-800">
                                            <td className="px-5 py-3.5">
                                                <span className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100">
                                                    <span className={`h-2 w-2 shrink-0 rounded-full ${STRIPE_COLOR[cobro.estado_pago] ?? 'bg-gray-300'}`} />
                                                    {MESES_LARGO[cobro.mes]} {cobro.anio}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-slate-400">{desglose(cobro)}</td>
                                            <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-gray-900 dark:text-slate-100">{money(cobro.saldo_pendiente)}</td>
                                            <td className="px-5 py-3.5"><EstadoBadge estado={cobro.estado_pago} /></td>
                                            <td className="px-5 py-3.5 text-right">
                                                {pendienteRevision ? (
                                                    <span className="text-xs text-gray-400 dark:text-slate-500">Comprobante enviado</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandido(expandido === cobro.id_cobro ? null : cobro.id_cobro)}
                                                        className="text-xs font-medium text-primary hover:text-primary-dark dark:text-blue-400"
                                                    >
                                                        {expandido === cobro.id_cobro ? 'Cancelar' : 'Subir comprobante'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {expandido === cobro.id_cobro && (
                                            <tr className="border-t border-gray-100 dark:border-slate-800">
                                                <td colSpan={5} className="bg-surface px-5 py-3 dark:bg-slate-800/40">
                                                    <SubirComprobanteForm cobro={cobro} onClose={() => setExpandido(null)} />
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Desktop: panel "Historial" -- Periodo · Fecha de pago · Monto · Descargar
// recibo · Ver comprobante, con "Descargar todas" en el header y
// paginación numerada al pie (en vez de "Ver todo" desplegando todo el
// historial dentro del mismo panel).
function HistorialPanel({ historial, historialBase, comprobantesPorCobro, aniosConPago, onVerComprobante, page, totalPages, onPageChange }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-slate-100">Historial</h2>
                <DescargarTodasControl anios={aniosConPago} />
            </div>
            {historialBase.length === 0 ? (
                <p className="px-5 py-6 text-sm text-gray-400 dark:text-slate-500">Aún no tienes cobros pagados en tu historial.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-surface text-xs uppercase tracking-wide text-gray-400 dark:bg-slate-800/60 dark:text-slate-500">
                                <th className="px-5 py-2.5 font-medium">Periodo</th>
                                <th className="px-5 py-2.5 font-medium">Fecha de pago</th>
                                <th className="px-5 py-2.5 text-right font-medium">Monto</th>
                                <th className="px-5 py-2.5 font-medium"></th>
                                <th className="px-5 py-2.5 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {historial.map((cobro) => {
                                const { ultimoResuelto } = derivarComprobante(comprobantesPorCobro(cobro.id_cobro));
                                return (
                                    <tr key={cobro.id_cobro} className="border-t border-gray-100 dark:border-slate-800">
                                        <td className="px-5 py-3.5">
                                            <span className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-100">
                                                <span className={`h-2 w-2 shrink-0 rounded-full ${STRIPE_COLOR[cobro.estado_pago] ?? 'bg-gray-300'}`} />
                                                {MESES_LARGO[cobro.mes]} {cobro.anio}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-slate-400">{cobro.fecha_ultimo_pago ? formatDate(cobro.fecha_ultimo_pago) : '—'}</td>
                                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-gray-900 dark:text-slate-100">{money(cobro.total_cobrar)}</td>
                                        <td className="px-5 py-3.5"><ReciboLink cobro={cobro} /></td>
                                        <td className="px-5 py-3.5">
                                            {ultimoResuelto ? <VerComprobanteLink comprobante={ultimoResuelto} onPreview={onVerComprobante} /> : <span className="text-xs text-gray-300 dark:text-slate-600">—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <HistorialPager page={page} totalPages={totalPages} onChange={onPageChange} />
        </div>
    );
}

// Selector de año para "Descargar todas" -- por defecto ofrece TODO el
// historial pagado en un solo PDF (no un año fijo elegido por nosotros);
// el desplegable deja acotar a un año puntual si es lo que se necesita.
// Siempre se muestra como select, nunca como texto fijo "(2026)", para que
// quede claro que es una elección y no un valor hardcodeado.
function DescargarTodasControl({ anios }) {
    const [seleccion, setSeleccion] = useState('todos');

    if (anios.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5">
            <select
                value={seleccion}
                onChange={(e) => setSeleccion(e.target.value)}
                className="rounded-md border-gray-300 py-1 text-xs font-medium text-gray-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
                <option value="todos">Todos los años</option>
                {anios.map((a) => (
                    <option key={a} value={a}>Solo {a}</option>
                ))}
            </select>
            <a
                href={`${route('portal.recibos.descargar-todos')}?anio=${seleccion}`}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark dark:text-blue-400"
            >
                <Download className="h-3.5 w-3.5" /> Descargar
            </a>
        </div>
    );
}

const HISTORIAL_PAGE_SIZE = 6;

// Paginación numerada del historial -- antes "Ver todo" desplegaba la
// lista completa dentro del mismo panel, y con muchos meses de historial
// el panel terminaba mucho más largo que el resto del layout. Con
// páginas de tamaño fijo el panel no crece más allá de eso.
function HistorialPager({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-1 border-t border-gray-100 px-5 py-3 dark:border-slate-800">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-surface hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                    key={p}
                    type="button"
                    onClick={() => onChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`h-7 w-7 rounded-md text-xs font-medium ${
                        p === page
                            ? 'bg-primary text-white'
                            : 'text-gray-500 hover:bg-surface dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                >
                    {p}
                </button>
            ))}
            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-surface hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
}

// Racha de pago: cuantos meses seguidos al dia (contando desde el mas
// reciente hacia atras) y un mini-sparkline de los ultimos montos pagados.
function RachaCard({ racha }) {
    if (!racha) return null;

    const valores = racha.sparkline ?? [];
    const max = Math.max(1, ...valores);

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100">
                <Flame className="h-4 w-4 text-warning" /> Historial de pago
            </h2>
            <div className="flex items-end justify-between gap-4">
                <div>
                    <p className="font-serif text-3xl italic leading-none text-gray-900 dark:text-slate-100">
                        {racha.meses_al_dia}
                        <span className="ml-1 font-sans text-sm not-italic font-normal text-gray-400 dark:text-slate-500">meses al día</span>
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">Este año: {racha.pagos_este_anio} pago{racha.pagos_este_anio === 1 ? '' : 's'}</p>
                </div>
                {valores.length > 0 && (
                    <div className="flex h-10 items-end gap-1">
                        {valores.map((v, i) => (
                            <span
                                key={i}
                                className="w-2 rounded-sm bg-primary-light dark:bg-blue-400/30"
                                style={{ height: `${Math.max(12, (v / max) * 100)}%` }}
                                title={money(v)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function HeroPago({ compact, ocupacion, proximo, deudaAnteriorTotal, totalAPagar }) {
    if (!proximo) return null;

    return (
        <section className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/20 ${compact ? 'p-4' : 'p-5'}`}>
            <span className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Tu próximo pago</p>
                <p className={`mt-1 font-serif italic leading-none ${compact ? 'text-3xl' : 'text-4xl'}`}>
                    <span className="mr-1 font-sans text-xl not-italic font-semibold opacity-85">S/</span>
                    {Number(totalAPagar).toFixed(2)}
                </p>
                <p className="mt-2 text-sm text-white/80">
                    Unidad {ocupacion?.unidad?.codigo_unidad} · vence el {formatDate(proximo.fecha_vencimiento)}
                </p>
                {deudaAnteriorTotal > 0.009 && (
                    <p className="mt-2 inline-block rounded-full bg-white/15 px-2.5 py-1 text-xs text-white/90">
                        Incluye <strong>{money(deudaAnteriorTotal)}</strong> de meses anteriores
                    </p>
                )}
            </div>
        </section>
    );
}

function MiContratoCard({ ocupacion }) {
    if (!ocupacion) return null;

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-slate-100">Mi contrato</h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Unidad</p>
                    <p className="font-medium text-gray-800 dark:text-slate-100">{ocupacion.unidad?.codigo_unidad}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Alquiler vigente</p>
                    <p className="font-medium text-gray-800 dark:text-slate-100">{money(ocupacion.monto_alquiler)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Contrato hasta</p>
                    <p className="font-medium text-gray-800 dark:text-slate-100">{ocupacion.fecha_fin ? formatDate(ocupacion.fecha_fin) : 'Indefinido'}</p>
                </div>
            </div>
        </section>
    );
}

function ConsumoCard({ consumoHistorico, options, series, height }) {
    if (consumoHistorico.length === 0) return null;

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100">
                <Zap className="h-4 w-4 text-primary dark:text-blue-400" /> Consumo eléctrico
            </h2>
            <p className="mb-2 text-xs text-gray-400 dark:text-slate-500">Últimos {consumoHistorico.length} periodos con lectura registrada</p>
            <Chart options={options} series={series} type="area" height={height} />
        </section>
    );
}

function ComoPagarCard({ configCobranza, qrError, setQrError, onOpenQr }) {
    if (!configCobranza?.yape_qr && !configCobranza?.yape_titular) return null;

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-slate-100">
                <QrCode className="h-4 w-4 text-yape dark:text-purple-400" /> Cómo pagar
            </h2>
            <div className="flex items-center gap-4 rounded-lg bg-yape-light p-3 dark:bg-purple-400/10">
                {configCobranza.yape_qr && !qrError ? (
                    <button
                        type="button"
                        onClick={onOpenQr}
                        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white dark:bg-slate-800"
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
                    <p className="text-xs font-semibold uppercase tracking-wide text-yape-dark dark:text-purple-300">Yape</p>
                    <p className="mt-0.5 font-medium text-gray-800 dark:text-slate-100">{configCobranza.yape_titular || '—'}</p>
                    <p className="text-gray-600 dark:text-slate-400">{configCobranza.yape_numero || '—'}</p>
                </div>
            </div>
        </section>
    );
}

export default function Index({ persona, ocupacion, cobros, racha, vencimiento, configCobranza, misComprobantes, consumoHistorico }) {
    const [historialPage, setHistorialPage] = useState(1);
    const [qrError, setQrError] = useState(false);
    const [qrAbierto, setQrAbierto] = useState(false);
    const [comprobantePreview, setComprobantePreview] = useState(null);

    const pendientes = cobros.filter((c) => c.estado_pago !== 'PAGADO' && c.estado_pago !== 'ANULADO');
    const historialBase = cobros.filter((c) => c.estado_pago === 'PAGADO' || c.estado_pago === 'ANULADO');
    const historialTotalPages = Math.max(1, Math.ceil(historialBase.length / HISTORIAL_PAGE_SIZE));
    const historial = historialBase.slice((historialPage - 1) * HISTORIAL_PAGE_SIZE, historialPage * HISTORIAL_PAGE_SIZE);
    const cambiarHistorialPage = (p) => setHistorialPage(Math.min(Math.max(1, p), historialTotalPages));

    const comprobantesPorCobro = (idCobro) => misComprobantes.filter((c) => c.id_cobro === idCobro);

    const proximo = pendientes[0] ?? null;
    const deudaAnteriorTotal = pendientes.slice(1).reduce((acc, c) => acc + Number(c.saldo_pendiente || 0), 0);
    const totalAPagar = pendientes.reduce((acc, c) => acc + Number(c.saldo_pendiente || 0), 0);

    // Distintos años con cobros pagados -- el historial puede abarcar más
    // de un año, "Descargar todas" necesita ofrecer cada uno, no solo el
    // más reciente.
    const aniosConPago = [...new Set(historialBase.filter((c) => c.estado_pago === 'PAGADO').map((c) => c.anio))].sort((a, b) => b - a);

    // Colores elegidos para leerse bien en claro y oscuro por igual -- el
    // grafico en si (canvas/SVG de ApexCharts) no sigue las clases dark: de
    // Tailwind, así que no reacciona en vivo al toggle sin recargar la
    // pagina; con estos tonos no desentona en ninguno de los dos temas.
    const consumoOptions = {
        chart: { toolbar: { show: false }, fontFamily: 'inherit', background: 'transparent' },
        colors: ['#3B82F6'],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        xaxis: { categories: consumoHistorico.map((c) => `${MESES[c.mes]}`), labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: (v) => `${Number(v).toFixed(0)} kWh` } },
        grid: { borderColor: 'rgba(148,163,184,0.25)' },
        tooltip: { y: { formatter: (v) => `${Number(v).toFixed(2)} kWh` } },
    };
    const consumoSeries = [{ name: 'Consumo', data: consumoHistorico.map((c) => c.consumo_kwh) }];

    const abrirQr = () => setQrAbierto(true);

    return (
        <PortalLayout title={`Hola, ${persona.nombres}`}>
            <Head title="Mi cuenta" />

            {vencimiento && (
                <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${vencimiento.nivel === 'URGENTE' ? 'bg-red-50 text-danger dark:bg-red-400/10' : 'bg-amber-50 text-warning dark:bg-amber-400/10'}`}>
                    <strong>{vencimiento.nivel === 'URGENTE' ? 'Urgente' : 'Próximo a vencer'}:</strong> {vencimiento.mensaje}
                </div>
            )}

            {/* ── Mobile: todo apilado en una columna, cards ── */}
            <div className="space-y-4 lg:hidden">
                <HeroPago ocupacion={ocupacion} proximo={proximo} deudaAnteriorTotal={deudaAnteriorTotal} totalAPagar={totalAPagar} />

                <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-100">Cobros pendientes</h2>
                    {pendientes.length === 0 ? (
                        <p className="py-4 text-sm text-gray-400 dark:text-slate-500">No tienes cobros pendientes. ¡Estás al día!</p>
                    ) : (
                        <div className="space-y-3">
                            {pendientes.map((c) => (
                                <CobroCard key={c.id_cobro} cobro={c} comprobantesDelCobro={comprobantesPorCobro(c.id_cobro)} mostrarAccionPago onVerComprobante={setComprobantePreview} />
                            ))}
                        </div>
                    )}
                </section>

                <ComoPagarCard configCobranza={configCobranza} qrError={qrError} setQrError={setQrError} onOpenQr={abrirQr} />

                <MiContratoCard ocupacion={ocupacion} />

                <RachaCard racha={racha} />

                <ConsumoCard consumoHistorico={consumoHistorico} options={consumoOptions} series={consumoSeries} height={180} />

                <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-slate-100">Historial de cobros</h2>
                    {cobros.length === 0 ? (
                        <p className="py-4 text-sm text-gray-400 dark:text-slate-500">Todavía no tienes cobros generados.</p>
                    ) : historialBase.length === 0 ? (
                        <p className="py-4 text-sm text-gray-400 dark:text-slate-500">Aún no tienes cobros pagados en tu historial.</p>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {historial.map((c) => (
                                    <CobroCard key={c.id_cobro} cobro={c} comprobantesDelCobro={comprobantesPorCobro(c.id_cobro)} mostrarAccionPago={false} onVerComprobante={setComprobantePreview} />
                                ))}
                            </div>
                            {aniosConPago.length > 0 && (
                                <div className="mt-3">
                                    <DescargarTodasControl anios={aniosConPago} />
                                </div>
                            )}
                            <HistorialPager page={historialPage} totalPages={historialTotalPages} onChange={cambiarHistorialPage} />
                        </>
                    )}
                </section>
            </div>

            {/* ── Desktop: sidebar fijo (contexto de pago) + panel principal (tablas) ── */}
            <div className="hidden lg:grid lg:grid-cols-[320px_1fr] lg:items-start lg:gap-6">
                <div className="flex flex-col gap-4">
                    <HeroPago compact ocupacion={ocupacion} proximo={proximo} deudaAnteriorTotal={deudaAnteriorTotal} totalAPagar={totalAPagar} />
                    <MiContratoCard ocupacion={ocupacion} />
                    <RachaCard racha={racha} />
                    <ConsumoCard consumoHistorico={consumoHistorico} options={consumoOptions} series={consumoSeries} height={140} />
                    <ComoPagarCard configCobranza={configCobranza} qrError={qrError} setQrError={setQrError} onOpenQr={abrirQr} />
                </div>

                <div className="flex flex-col gap-6">
                    <PendientesPanel pendientes={pendientes} comprobantesPorCobro={comprobantesPorCobro} />
                    <HistorialPanel
                        historial={historial}
                        historialBase={historialBase}
                        comprobantesPorCobro={comprobantesPorCobro}
                        aniosConPago={aniosConPago}
                        onVerComprobante={setComprobantePreview}
                        page={historialPage}
                        totalPages={historialTotalPages}
                        onPageChange={cambiarHistorialPage}
                    />
                </div>
            </div>

            <ComprobantePreviewModal comprobante={comprobantePreview} onClose={() => setComprobantePreview(null)} />

            {qrAbierto && configCobranza?.yape_qr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setQrAbierto(false)}>
                    <div className="flex max-w-xs flex-col items-center gap-4 rounded-lg bg-white p-5 dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="flex w-full items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">QR de Yape</p>
                            <button type="button" onClick={() => setQrAbierto(false)} className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300">
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

            <WhatsAppFab numero={configCobranza?.whatsapp_contacto} />
        </PortalLayout>
    );
}
