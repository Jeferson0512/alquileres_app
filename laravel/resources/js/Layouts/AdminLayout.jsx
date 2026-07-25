import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Banknote, Bell, Building2, Calculator, Calendar, ChevronDown, CircleCheck, CircleX, Gauge, IdCard, KeyRound,
    LayoutDashboard, Menu, MessageSquare, Receipt, ReceiptText, RefreshCcw, Settings, ShieldCheck, Tag, UserCog, Users, Wallet, Zap,
} from 'lucide-react';
import { useState } from 'react';

// Excepciones donde el "code" del módulo (usado también para nombrar permisos,
// ej. config_cobranza.ver) no coincide literalmente con el segmento de la URL.
const CODE_TO_PATH = {
    config_cobranza: 'config-cobranza',
    'usuarios/roles': 'roles-permisos',
    'usuarios/perfil_campos': 'perfil-campos',
};

// Un ícono Lucide por módulo/submódulo (mismos "code" de la tabla `modules`).
const MODULE_ICONS = {
    dashboard: LayoutDashboard,
    periodos: Calendar,
    inquilinos: Users,
    unidades: Building2,
    ocupaciones: KeyRound,
    recibo: Zap,
    lecturas: Gauge,
    liquidacion: Calculator,
    cobros: Wallet,
    'cobros.pagos': Receipt,
    'cobros.comprobantes': ReceiptText,
    avisos: Bell,
    configuracion: Settings,
    tarifas: Tag,
    config_cobranza: Banknote,
    usuarios: UserCog,
    'usuarios.roles': ShieldCheck,
    'usuarios.perfil_campos': IdCard,
    consultas: MessageSquare,
};

function moduleToPath(code) {
    const segment = code.replace('.', '/');
    return CODE_TO_PATH[segment] ?? segment;
}

function isModuleActive(currentPath, code) {
    // "cobros" activa /cobros y /cobros/pagos; "cobros.pagos" solo /cobros/pagos.
    const segment = moduleToPath(code);
    return currentPath === `/${segment}` || currentPath.startsWith(`/${segment}/`);
}

// Padres "virtuales" como Configuración no tienen ruta propia (nadie visita
// /configuracion) -- su unica pista de que siguen activos es que la URL
// actual coincida con alguno de sus hijos reales.
function isParentActive(currentPath, item) {
    if (isModuleActive(currentPath, item.code)) return true;
    return (item.children ?? []).some((child) => isModuleActive(currentPath, child.code));
}

function ModuleIcon({ code, className }) {
    const Icon = MODULE_ICONS[code];
    return Icon ? <Icon className={className} strokeWidth={2} /> : null;
}

function NavItem({ item, currentPath }) {
    const hasChildren = item.children && item.children.length > 0;
    const active = hasChildren ? isParentActive(currentPath, item) : isModuleActive(currentPath, item.code);
    const [open, setOpen] = useState(active);

    if (!hasChildren) {
        return (
            <li>
                <Link
                    href={`/${moduleToPath(item.code)}`}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                            ? 'bg-primary-light text-primary-dark'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <ModuleIcon code={item.code} className="h-4 w-4 shrink-0" />
                    {item.name}
                </Link>
            </li>
        );
    }

    return (
        <li>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-primary-light text-primary-dark' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <span className="flex items-center gap-3">
                    <ModuleIcon code={item.code} className="h-4 w-4 shrink-0" />
                    {item.name}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
                    {item.children.map((child) => {
                        const childActive = isModuleActive(currentPath, child.code);
                        return (
                            <li key={child.code}>
                                <Link
                                    href={`/${moduleToPath(child.code)}`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium ${
                                        childActive
                                            ? 'bg-primary-light text-primary-dark'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <ModuleIcon code={child.code} className="h-4 w-4 shrink-0" />
                                    {child.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}

const NOTIFICACION_ICONOS = {
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
    return NOTIFICACION_ICONOS[clave] ?? NOTIFICACION_ICONOS.RENOVACION;
}

function NotificacionesBell() {
    const { notificaciones } = usePage().props;
    const items = notificaciones ?? [];
    const noLeidas = items.filter((n) => !n.leido).length;

    const marcarLeidas = (e) => {
        e.preventDefault();
        router.patch(route('notificaciones.marcar-leidas'), {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="relative flex items-center gap-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
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
            <Dropdown.Content align="right" width="80" contentClasses="bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                    <p className="text-sm font-semibold text-gray-800">Notificaciones</p>
                    {noLeidas > 0 && (
                        <button type="button" onClick={marcarLeidas} className="text-xs font-medium text-primary hover:text-primary-dark">
                            Marcar leídas
                        </button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="px-3 py-6 text-center text-sm text-gray-400">Sin notificaciones por ahora.</p>
                    ) : (
                        items.map((n) => {
                            const { Icon, bg, text } = iconoDe(n);
                            return (
                                <Link
                                    key={n.id}
                                    href={n.url}
                                    className={`flex items-start gap-2.5 border-b border-gray-50 px-3 py-2.5 text-left hover:bg-gray-50 ${!n.leido ? 'bg-amber-50/60' : ''}`}
                                >
                                    <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
                                            <span className="truncate">{n.titulo}</span>
                                            {!n.leido && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-gray-500">{n.detalle}</span>
                                    </span>
                                </Link>
                            );
                        })
                    )}
                </div>
                <Link href={route('notificaciones.index')} className="block border-t border-gray-100 px-3 py-2.5 text-center text-xs font-medium text-primary hover:text-primary-dark">
                    Ver todas las notificaciones →
                </Link>
            </Dropdown.Content>
        </Dropdown>
    );
}

export default function AdminLayout({ title, children }) {
    const { auth, navigation, url } = usePage().props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-surface">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center border-b border-gray-200 px-5">
                    <Link href="/dashboard" className="text-lg font-semibold text-primary">
                        Alquileres App
                    </Link>
                </div>
                <nav className="flex flex-col gap-1 overflow-y-auto p-3">
                    <ul className="space-y-1">
                        {navigation.map((item) => (
                            <NavItem key={item.code} item={item} currentPath={currentPath} />
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Overlay mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Contenido */}
            <div className="lg:pl-64">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
                            onClick={() => setMobileOpen((v) => !v)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        {title && <h1 className="text-base font-semibold text-gray-800">{title}</h1>}
                    </div>

                    <div className="flex items-center gap-2">
                    <NotificacionesBell />
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            >
                                <span>{user.name}</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>Perfil</Dropdown.Link>
                            <Dropdown.Link href={route('notificaciones.index')}>Notificaciones</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Cerrar sesión
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                    </div>
                </header>

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
