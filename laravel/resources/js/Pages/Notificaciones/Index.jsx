import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';
import StatusTabs from '@/Components/StatusTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import formatDate from '@/lib/date';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, CircleX, MessageSquare, ReceiptText, RefreshCcw } from 'lucide-react';

const TABS = [
    { value: 'PENDIENTE', label: 'Pendientes' },
    { value: 'RESUELTA', label: 'Resueltas' },
    { value: 'TODAS', label: 'Todas' },
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

export default function Index({ notificaciones, estadoFiltro }) {
    const cambiarFiltro = (estado) => router.get(route('notificaciones.index'), { estado }, { preserveState: true, replace: true });
    const cambiarPagina = (page) => router.get(route('notificaciones.index'), { estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });
    const marcarLeidas = () => router.patch(route('notificaciones.marcar-leidas'), {}, { preserveScroll: true, preserveState: true });

    return (
        <AdminLayout title="Notificaciones">
            <Head title="Notificaciones" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                    Historial de avisos: renovaciones de contrato pendientes y comprobantes de pago subidos por inquilinos.
                </p>
                <button onClick={marcarLeidas} className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Marcar todas como leídas
                </button>
            </div>

            <div className="mb-4">
                <StatusTabs value={estadoFiltro} options={TABS} onChange={cambiarFiltro} />
            </div>

            <div className="space-y-3">
                {notificaciones.data.length === 0 && (
                    <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">Sin notificaciones en este filtro.</p>
                )}
                {notificaciones.data.map((n) => {
                    const { Icon, bg, text } = iconoDe(n);
                    return (
                        <Link
                            key={n.id}
                            href={n.url}
                            className={`flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 ${!n.leido ? 'ring-1 ring-primary-light' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                                        {n.titulo}
                                        {!n.leido && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                    </p>
                                    <p className="text-xs text-gray-500">{n.detalle}</p>
                                    <p className="mt-1 text-xs text-gray-400">{formatDate(n.fecha)}</p>
                                </div>
                            </div>
                            <div className="shrink-0">
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
                <Pagination meta={notificaciones} onPageChange={cambiarPagina} />
            </div>
        </AdminLayout>
    );
}
