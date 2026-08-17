import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CircleCheck, CircleX, LogOut, Moon, Sun, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';

function PortalNotificacionesBell() {
    const { notificacionesPortal } = usePage().props;
    const items = notificacionesPortal ?? [];
    const noLeidas = items.filter((n) => !n.leido).length;

    const marcarLeidas = (e) => {
        e.preventDefault();
        router.patch(route('portal.notificaciones.marcar-leidas'), {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="relative flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Notificaciones"
                >
                    <Bell className="h-5 w-5" />
                    {noLeidas > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                            {noLeidas}
                        </span>
                    )}
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="right" width="80" contentClasses="bg-white dark:bg-slate-800 dark:ring-1 dark:ring-slate-700">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 dark:border-slate-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">Notificaciones</p>
                    {noLeidas > 0 && (
                        <button type="button" onClick={marcarLeidas} className="text-xs font-medium text-primary hover:text-primary-dark dark:text-blue-400">
                            Marcar leídas
                        </button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-gray-400 dark:text-slate-500">Sin notificaciones por ahora.</p>
                    ) : (
                        items.map((n) => {
                            const aprobado = n.estado === 'APROBADO';
                            const Icon = aprobado ? CircleCheck : CircleX;
                            return (
                                <Link
                                    key={n.id}
                                    href={n.url}
                                    className={`flex items-start gap-2.5 border-b border-gray-50 px-3 py-2.5 text-left hover:bg-gray-50 dark:border-slate-700/60 dark:hover:bg-slate-700/50 ${!n.leido ? 'bg-amber-50/60 dark:bg-amber-400/10' : ''}`}
                                >
                                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${aprobado ? 'bg-green-100 text-success dark:bg-green-400/10' : 'bg-red-100 text-danger dark:bg-red-400/10'}`}>
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-slate-100">
                                            <span className="truncate">{n.titulo}</span>
                                            {!n.leido && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-500 dark:text-slate-400">{n.detalle}</span>
                                    </span>
                                </Link>
                            );
                        })
                    )}
                </div>
                <Link href={route('portal.notificaciones.index')} className="block border-t border-gray-100 px-3 py-2.5 text-center text-xs font-medium text-primary hover:text-primary-dark dark:border-slate-700 dark:text-blue-400">
                    Ver todas las notificaciones →
                </Link>
            </Dropdown.Content>
        </Dropdown>
    );
}

const THEME_KEY = 'portal-theme';

function ThemeToggle() {
    const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    };

    return (
        <button
            type="button"
            onClick={toggle}
            title="Cambiar tema"
            className="flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
    );
}

/**
 * Layout minimalista para el portal del Inquilino -- sin el sidebar de
 * modulos del panel admin (AdminLayout). Una sola columna en el celular
 * (el caso de uso real), pero permite hasta 2 columnas en pantallas anchas
 * -- ver Portal/Index.jsx. Tema oscuro escoteado solo a este layout: el
 * panel admin no tiene ninguna clase dark:, asi que este toggle no le
 * afecta en absoluto.
 */
export default function PortalLayout({ title, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-surface dark:bg-surface-dark">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
                <span className="flex items-center gap-2 text-lg font-semibold text-primary dark:text-blue-400">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-sm text-white dark:bg-blue-500">A</span>
                    Mi Alquiler
                </span>
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="hidden text-sm text-gray-500 dark:text-slate-400 sm:inline">{auth.user?.name}</span>
                    <ThemeToggle />
                    <PortalNotificacionesBell />
                    <Link
                        href={route('portal.perfil.completar')}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <UserCog className="h-4 w-4" /> <span className="hidden sm:inline">Mi perfil</span>
                    </Link>
                    <Link
                        href={route('logout')} method="post" as="button"
                        title="Cerrar sesión"
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Cerrar sesión</span>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-2xl p-4 sm:p-6 lg:max-w-6xl">
                {title && <h1 className="mb-4 text-lg font-semibold text-gray-800 dark:text-slate-100">{title}</h1>}
                {children}
            </main>
        </div>
    );
}
