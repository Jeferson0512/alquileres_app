import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';
import StatusTabs from '@/Components/StatusTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import formatDate from '@/lib/date';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, CircleX, MessageSquare, ReceiptText, RefreshCcw } from 'lucide-react';

const TABS = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'RESUELTA', label: 'Resueltas' },
];

const ICONOS = {
    RENOVACION: { Icon: RefreshCcw, bg: 'bg-warning-tint', text: 'text-warning' },
    COMPROBANTE_PENDIENTE: { Icon: ReceiptText, bg: 'bg-warning-tint', text: 'text-warning' },
    COMPROBANTE_APROBADO: { Icon: CircleCheck, bg: 'bg-success-tint', text: 'text-success' },
    COMPROBANTE_RECHAZADO: { Icon: CircleX, bg: 'bg-danger-tint', text: 'text-danger' },
    CONSULTA_NUEVO: { Icon: MessageSquare, bg: 'bg-warning-tint', text: 'text-warning' },
    CONSULTA_CONTACTADO: { Icon: MessageSquare, bg: 'bg-success-tint', text: 'text-success' },
    CONSULTA_DESCARTADO: { Icon: MessageSquare, bg: 'bg-surface-3', text: 'text-muted-2' },
};

function iconoDe(item) {
    const clave = item.tipo === 'RENOVACION' ? item.tipo : `${item.tipo}_${item.subestado}`;
    return ICONOS[clave] ?? ICONOS.RENOVACION;
}

export default function Index({ feed, estadoFiltro, totalSinLeer }) {
    const cambiarFiltro = (estado) => router.get(route('notificaciones.index'), { estado }, { preserveState: true, replace: true });
    const cambiarPagina = (page) => router.get(route('notificaciones.index'), { estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });
    const marcarLeidas = () => router.patch(route('notificaciones.marcar-leidas'), {}, { preserveScroll: true, preserveState: true });

    return (
        <AdminLayout
            title="Notificaciones"
            description={`${feed.total} en total · ${totalSinLeer} sin leer`}
        >
            <Head title="Notificaciones" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <StatusTabs value={estadoFiltro} options={TABS} onChange={cambiarFiltro} />
                <button
                    onClick={marcarLeidas}
                    disabled={totalSinLeer === 0}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Marcar todas como leídas
                </button>
            </div>

            <div className="space-y-2">
                {feed.data.length === 0 && (
                    <p className="rounded-[13px] border border-border bg-surface p-6 text-center text-sm text-muted-2 shadow-sm">Sin notificaciones en este filtro.</p>
                )}
                {feed.data.map((n) => {
                    const { Icon, bg, text } = iconoDe(n);
                    return (
                        <Link
                            key={n.id}
                            href={n.url}
                            className={`flex items-center justify-between gap-3 rounded-[13px] border p-4 shadow-sm transition-colors ${
                                n.leido
                                    ? 'border-border bg-surface hover:bg-surface-2'
                                    : 'border-primary-light bg-primary-light/40 hover:bg-primary-light/60'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className={`flex items-center gap-1.5 text-sm ${n.leido ? 'font-normal text-muted' : 'font-semibold text-ink'}`}>
                                        {n.titulo}
                                        {!n.leido && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                    </p>
                                    <p className={`text-xs ${n.leido ? 'text-muted-2' : 'text-muted'}`}>{n.detalle}</p>
                                    <p className="mt-1 text-xs text-muted-2">{formatDate(n.fecha)}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {!n.leido && <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Nuevo</span>}
                                {n.estado === 'PENDIENTE' ? (
                                    <Badge variant="warning">Pendiente</Badge>
                                ) : (
                                    <Badge variant="success">Resuelta</Badge>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-3 rounded-[13px] border border-border bg-surface shadow-sm">
                <Pagination meta={feed} onPageChange={cambiarPagina} />
            </div>
        </AdminLayout>
    );
}
