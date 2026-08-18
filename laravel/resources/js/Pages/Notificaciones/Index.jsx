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
    RENOVACION: { Icon: RefreshCcw, bg: 'bg-amber-100', text: 'text-warning' },
    COMPROBANTE_PENDIENTE: { Icon: ReceiptText, bg: 'bg-amber-100', text: 'text-warning' },
    COMPROBANTE_APROBADO: { Icon: CircleCheck, bg: 'bg-green-100', text: 'text-success' },
    COMPROBANTE_RECHAZADO: { Icon: CircleX, bg: 'bg-red-100', text: 'text-danger' },
    CONSULTA_NUEVO: { Icon: MessageSquare, bg: 'bg-amber-100', text: 'text-warning' },
    CONSULTA_CONTACTADO: { Icon: MessageSquare, bg: 'bg-green-100', text: 'text-success' },
    CONSULTA_DESCARTADO: { Icon: MessageSquare, bg: 'bg-gray-100', text: 'text-gray-400' },
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
                    className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Marcar todas como leídas
                </button>
            </div>

            <div className="space-y-2">
                {feed.data.length === 0 && (
                    <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">Sin notificaciones en este filtro.</p>
                )}
                {feed.data.map((n) => {
                    const { Icon, bg, text } = iconoDe(n);
                    return (
                        <Link
                            key={n.id}
                            href={n.url}
                            className={`flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${
                                n.leido
                                    ? 'border-gray-200 bg-white hover:bg-gray-50'
                                    : 'border-primary-light bg-primary-light/40 hover:bg-primary-light/60'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className={`flex items-center gap-1.5 text-sm ${n.leido ? 'font-normal text-gray-600' : 'font-semibold text-gray-900'}`}>
                                        {n.titulo}
                                        {!n.leido && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                    </p>
                                    <p className={`text-xs ${n.leido ? 'text-gray-400' : 'text-gray-600'}`}>{n.detalle}</p>
                                    <p className="mt-1 text-xs text-gray-400">{formatDate(n.fecha)}</p>
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

            <div className="mt-3 rounded-lg border border-gray-200 bg-white">
                <Pagination meta={feed} onPageChange={cambiarPagina} />
            </div>
        </AdminLayout>
    );
}
