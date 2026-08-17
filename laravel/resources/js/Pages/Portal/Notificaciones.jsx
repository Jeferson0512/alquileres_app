import Badge from '@/Components/Badge';
import Pagination from '@/Components/Pagination';
import PortalLayout from '@/Layouts/PortalLayout';
import formatDate from '@/lib/date';
import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, CircleX } from 'lucide-react';

export default function Notificaciones({ notificaciones }) {
    const cambiarPagina = (page) => router.get(route('portal.notificaciones.index'), { page }, { preserveState: true, preserveScroll: true });
    const marcarLeidas = () => router.patch(route('portal.notificaciones.marcar-leidas'), {}, { preserveScroll: true, preserveState: true });

    return (
        <PortalLayout title="Notificaciones">
            <Head title="Notificaciones" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-slate-400">Avisos sobre tus comprobantes de pago: aprobados o rechazados.</p>
                {notificaciones.data.some((n) => !n.leido) && (
                    <button onClick={marcarLeidas} className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notificaciones.data.length === 0 && (
                    <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                        Todavía no tienes notificaciones. Acá vas a ver cuando se revise un comprobante que subas.
                    </p>
                )}
                {notificaciones.data.map((n) => {
                    const aprobado = n.estado === 'APROBADO';
                    const Icon = aprobado ? CircleCheck : CircleX;
                    return (
                        <Link
                            key={n.id}
                            href={n.url}
                            className={`flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 ${!n.leido ? 'ring-1 ring-primary-light dark:ring-blue-400/30' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${aprobado ? 'bg-green-100 text-success dark:bg-green-400/10' : 'bg-red-100 text-danger dark:bg-red-400/10'}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div>
                                    <p className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-slate-100">
                                        {n.titulo}
                                        {!n.leido && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{n.detalle}</p>
                                    <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{formatDate(n.fecha)}</p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                <Badge variant={aprobado ? 'success' : 'danger'}>{aprobado ? 'Aprobado' : 'Rechazado'}</Badge>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-3 rounded-lg border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <Pagination meta={notificaciones} onPageChange={cambiarPagina} />
            </div>
        </PortalLayout>
    );
}
