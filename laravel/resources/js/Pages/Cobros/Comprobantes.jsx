import Badge from '@/Components/Badge';
import IconButton from '@/Components/IconButton';
import Pagination from '@/Components/Pagination';
import StatusTabs from '@/Components/StatusTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import formatDate from '@/lib/date';
import { router, useForm, usePage, Head } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ESTADO_VARIANTS = { PENDIENTE: 'warning', APROBADO: 'success', RECHAZADO: 'danger' };

function EstadoBadge({ estado }) {
    return <Badge variant={ESTADO_VARIANTS[estado] ?? 'gray'}>{estado}</Badge>;
}

function RechazarForm({ comprobante, onClose }) {
    const [motivo, setMotivo] = useState('');

    const submit = () => {
        if (!motivo.trim()) return;
        router.patch(route('comprobantes.rechazar', comprobante.id), { motivo_rechazo: motivo }, { onSuccess: onClose });
    };

    return (
        <div className="mt-2 flex items-center gap-2">
            <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Motivo del rechazo..."
                className="w-56 rounded-md border-border bg-surface text-xs text-ink"
            />
            <button onClick={submit} disabled={!motivo.trim()} className="rounded-md bg-danger px-3 py-1 text-xs font-medium text-white disabled:opacity-50">
                Confirmar
            </button>
            <button onClick={onClose} className="text-xs text-muted hover:text-ink">Cancelar</button>
        </div>
    );
}

function AprobarModal({ comprobante, onClose }) {
    const [conceptos, setConceptos] = useState(null);
    const [seleccion, setSeleccion] = useState({});

    const { data, setData, patch, processing, errors } = useForm({
        modo_aplicacion: 'AUTOMATICA',
        aplicaciones: [],
    });

    useEffect(() => {
        if (data.modo_aplicacion === 'MANUAL' && conceptos === null) {
            fetch(route('cobros.detalle', { id_cobro: comprobante.cobro.id_cobro }))
                .then((r) => r.json())
                .then((res) => setConceptos(
                    (res.data.conceptos || []).filter((c) => Number(c.permite_pago_directo) === 1 && Number(c.saldo_pendiente) > 0)
                ));
        }
    }, [data.modo_aplicacion, conceptos, comprobante.cobro.id_cobro]);

    const totalSeleccionado = Object.values(seleccion).reduce((acc, monto) => acc + (parseFloat(monto) || 0), 0);
    const montoDeclarado = Number(comprobante.monto_declarado);

    useEffect(() => {
        setData('aplicaciones', Object.entries(seleccion).map(([id, monto]) => ({
            id_cobro_detalle: Number(id), monto_aplicado: parseFloat(monto) || 0,
        })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seleccion]);

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
        patch(route('comprobantes.aprobar', comprobante.id), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[13px] bg-surface p-5 shadow-xl">
                <h3 className="mb-3 text-base font-bold text-ink">Aprobar comprobante</h3>

                <div className="mb-4 rounded-lg bg-surface-2 p-3 text-xs text-muted">
                    <p><strong>Inquilino:</strong> {comprobante.cobro?.persona?.nombres} {comprobante.cobro?.persona?.apellidos}</p>
                    <p><strong>Unidad:</strong> {comprobante.cobro?.unidad?.codigo_unidad}</p>
                    <p><strong>Monto declarado:</strong> S/ {montoDeclarado.toFixed(2)}</p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-2 rounded-lg border border-border p-3">
                        <label className="block text-xs font-medium text-muted">Modo de pago</label>
                        <label className="flex items-center gap-2 text-sm text-ink">
                            <input type="radio" checked={data.modo_aplicacion === 'AUTOMATICA'} onChange={() => setData('modo_aplicacion', 'AUTOMATICA')} />
                            Aplicar completo / automático
                        </label>
                        <label className="flex items-center gap-2 text-sm text-ink">
                            <input type="radio" checked={data.modo_aplicacion === 'MANUAL'} onChange={() => setData('modo_aplicacion', 'MANUAL')} />
                            Aplicar solo a ciertos servicios
                        </label>
                    </div>

                    {data.modo_aplicacion === 'MANUAL' && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted">Selecciona conceptos a pagar</p>
                            {conceptos === null && <p className="text-xs text-muted-2">Cargando conceptos...</p>}
                            {conceptos?.length === 0 && <p className="text-xs text-muted-2">No hay conceptos con saldo pendiente que admitan pago directo.</p>}
                            {conceptos?.map((c) => {
                                const marcado = c.id_cobro_detalle in seleccion;
                                return (
                                    <div key={c.id_cobro_detalle} className="flex items-center justify-between gap-2 rounded-md border border-border p-2">
                                        <label className="flex flex-1 items-center gap-2 text-sm">
                                            <input type="checkbox" checked={marcado} onChange={(e) => toggleConcepto(c, e.target.checked)} />
                                            <span>
                                                <span className="block font-medium text-ink">{c.nombre}</span>
                                                <span className="block text-xs text-muted-2">Saldo: S/ {Number(c.saldo_pendiente).toFixed(2)}</span>
                                            </span>
                                        </label>
                                        <input
                                            type="number" step="0.01"
                                            disabled={!marcado}
                                            max={c.saldo_pendiente}
                                            value={marcado ? seleccion[c.id_cobro_detalle] : ''}
                                            onChange={(e) => cambiarMontoConcepto(c.id_cobro_detalle, e.target.value)}
                                            className="w-24 rounded-md border-border bg-surface text-sm text-ink disabled:bg-surface-2"
                                        />
                                    </div>
                                );
                            })}
                            {errors.aplicaciones && <p className="text-xs text-danger">{errors.aplicaciones}</p>}
                            <div className={`rounded-md px-3 py-2 text-sm font-medium ${totalSeleccionado === montoDeclarado ? 'bg-primary-light text-primary-dark' : 'bg-warning-tint text-warning'}`}>
                                Seleccionado: S/ {totalSeleccionado.toFixed(2)} de S/ {montoDeclarado.toFixed(2)} declarado
                            </div>
                        </div>
                    )}

                    {errors.general && <p className="text-xs text-danger">{errors.general}</p>}
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                            Confirmar aprobación
                        </button>
                        <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface-2">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Comprobantes({ comprobantes, estadoFiltro }) {
    const { auth } = usePage().props;
    const [lightbox, setLightbox] = useState(null);
    const [rechazando, setRechazando] = useState(null);
    const [aprobando, setAprobando] = useState(null);

    const puede = (p) => auth.permissions.includes(p);

    const cambiarFiltro = (estado) => router.get(route('comprobantes.index'), { estado }, { preserveState: true, replace: true });

    const cambiarPagina = (page) => router.get(route('comprobantes.index'), { estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });

    const tabs = [
        { value: 'PENDIENTE', label: 'Pendientes' },
        { value: 'APROBADO', label: 'Aprobados' },
        { value: 'RECHAZADO', label: 'Rechazados' },
        { value: 'TODOS', label: 'Todos' },
    ];

    return (
        <AdminLayout title="Comprobantes de pago">
            <Head title="Comprobantes" />

            <div className="mb-4">
                <StatusTabs value={estadoFiltro} options={tabs} onChange={cambiarFiltro} />
            </div>
            <p className="mb-4 text-xs text-muted-2">
                Esta lista es para revisar comprobantes que los propios inquilinos subieron desde el portal. Si tú recibiste el pago directamente (efectivo, Yape, etc.) y quieres registrarlo tú mismo sin pasar por aquí, hazlo desde el submódulo "Pagos" — es la misma lógica de aplicación, solo que sin el paso de revisión.
            </p>

            <div className="overflow-x-auto rounded-[13px] border border-border bg-surface shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surface-2">
                        <tr>
                            <th className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Periodo</th>
                            <th className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Unidad</th>
                            <th className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Inquilino</th>
                            <th className="px-3 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Monto</th>
                            <th className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Fecha</th>
                            <th className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Método</th>
                            <th className="px-3 py-2.5 text-center text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Imagen</th>
                            <th className="px-3 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Estado</th>
                            <th className="px-3 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {comprobantes.data.map((c) => (
                            <tr key={c.id}>
                                <td className="px-3 py-2.5 text-muted">{c.cobro?.periodo ? `${c.cobro.periodo.mes}/${c.cobro.periodo.anio}` : '—'}</td>
                                <td className="px-3 py-2.5 font-semibold text-ink">{c.cobro?.unidad?.codigo_unidad}</td>
                                <td className="px-3 py-2.5 text-muted">{c.cobro?.persona?.nombres} {c.cobro?.persona?.apellidos}</td>
                                <td className="px-3 py-2.5 text-right font-mono text-muted">S/ {Number(c.monto_declarado).toFixed(2)}</td>
                                <td className="px-3 py-2.5 text-muted">{formatDate(c.fecha_pago_declarada)}</td>
                                <td className="px-3 py-2.5 text-muted">
                                    {c.metodo_pago}
                                    {c.numero_operacion && (
                                        <p className="text-xs text-muted-2">
                                            {c.metodo_pago === 'EFECTIVO' ? `Entregado a: ${c.numero_operacion}` : `Op. ${c.numero_operacion}`}
                                        </p>
                                    )}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                    {c.imagen_url ? (
                                        <button onClick={() => setLightbox(c.imagen_url)} className="inline-block" title="Ver comprobante">
                                            <img src={c.imagen_url} alt="Comprobante" className="h-10 w-10 rounded-md border border-border object-cover hover:opacity-80" />
                                        </button>
                                    ) : (
                                        <span className="text-xs text-muted-2">Sin foto</span>
                                    )}
                                </td>
                                <td className="px-3 py-2.5">
                                    <EstadoBadge estado={c.estado} />
                                    {c.estado === 'RECHAZADO' && c.motivo_rechazo && (
                                        <p className="mt-1 max-w-[160px] text-xs text-muted-2">{c.motivo_rechazo}</p>
                                    )}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                    {c.estado === 'PENDIENTE' && puede('cobros.comprobantes.revisar') && (
                                        rechazando === c.id ? (
                                            <RechazarForm comprobante={c} onClose={() => setRechazando(null)} />
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton icon={Check} label="Aprobar comprobante" variant="success" onClick={() => setAprobando(c)} />
                                                <IconButton icon={X} label="Rechazar comprobante" variant="danger" onClick={() => setRechazando(c.id)} />
                                            </div>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                        {comprobantes.data.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-6 text-center text-muted-2">Sin comprobantes en este filtro.</td></tr>
                        )}
                    </tbody>
                </table>
                <Pagination meta={comprobantes} onPageChange={cambiarPagina} />
            </div>

            {aprobando && <AprobarModal comprobante={aprobando} onClose={() => setAprobando(null)} />}

            {lightbox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={() => setLightbox(null)}>
                    <img src={lightbox} alt="Comprobante" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
                </div>
            )}
        </AdminLayout>
    );
}
