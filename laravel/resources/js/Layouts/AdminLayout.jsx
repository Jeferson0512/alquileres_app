import Dropdown from '@/Components/Dropdown';
import { iniciales } from '@/lib/iniciales';
import MESES from '@/lib/meses';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Banknote, Bell, Building2, Calculator, Calendar, ChevronDown, CircleCheck, CircleX, Gauge, IdCard, KeyRound,
    LayoutDashboard, Menu, MessageSquare, Receipt, ReceiptText, RefreshCcw, Settings, ShieldCheck, Tag, UserCog, Users, Wallet, Zap,
} from 'lucide-react';
import { Fragment, useState } from 'react';

// Excepciones donde el "code" del módulo (usado también para nombrar permisos,
// ej. config_cobranza.ver) no coincide literalmente con el segmento de la URL.
const CODE_TO_PATH = {
    config_cobranza: 'config-cobranza',
    'usuarios/roles': 'roles-permisos',
    'usuarios/perfil_campos': 'perfil-campos',
};

// Agrupación puramente visual del sidebar (no toca `modules` ni permisos).
// Los módulos que no aparecen acá (configuracion, consultas) se renderizan
// sueltos, sin encabezado -- "configuracion" ya se explica solo porque es un
// ítem expandible con ese nombre; "consultas" queda suelto a propósito, ver
// CLAUDE.md.
const MODULE_GROUPS = {
    dashboard: 'Operación',
    periodos: 'Operación',
    inquilinos: 'Operación',
    unidades: 'Operación',
    ocupaciones: 'Operación',
    recibo: 'Medición y recibo',
    lecturas: 'Medición y recibo',
    liquidacion: 'Medición y recibo',
    cobros: 'Cobranza',
    avisos: 'Cobranza',
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

// "Mapa de navegación": de qué grupo y de qué módulo es la página actual,
// derivado 100% de `navigation` (lo que el usuario puede ver) -- no hay
// texto fijo por página, así que nunca se puede desincronizar del sidebar.
function breadcrumbFor(navigation, currentPath) {
    for (const item of navigation) {
        const activeChild = (item.children ?? []).find((child) => isModuleActive(currentPath, child.code));
        if (activeChild) {
            return [MODULE_GROUPS[item.code] ?? item.name, activeChild.name];
        }
        if (isModuleActive(currentPath, item.code)) {
            const group = MODULE_GROUPS[item.code] ?? item.name;
            return group === item.name ? [item.name] : [group, item.name];
        }
    }
    return [];
}

const ESTADO_PERIODO_STYLES = {
    ABIERTO: 'bg-primary-light text-primary-dark',
    CERRADO: 'bg-gray-100 text-gray-500',
    ANULADO: 'bg-red-50 text-danger',
};

// Selector de periodo real (no solo texto) -- aparece en el topbar SOLO en
// las páginas que trabajan sobre un periodo (Dashboard, Cobros, Lecturas,
// etc: cada una pasa `periodo`/`periodos`/`onPeriodoChange` a AdminLayout).
// Páginas sin noción de periodo (Inquilinos, Unidades...) simplemente no
// pasan esos props y acá no se pinta nada.
//
// Es un <Dropdown> propio (mismo componente que ya usan la campana y el
// menú de usuario), no un <select> nativo: el listbox abierto de un
// <select> lo dibuja el sistema operativo, no el navegador -- ninguna
// clase de Tailwind/TailAdmin puede tocarlo. Por eso se ve "sin estilos"
// al abrirlo. Un dropdown propio sí se puede diseñar de punta a punta.
function PeriodSwitcher({ periodo, periodos, onChange }) {
    return (
        <Dropdown align="left" width="56">
            <Dropdown.Trigger>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-2.5 pr-2 hover:bg-gray-100"
                >
                    <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-800">{MESES[periodo.mes - 1]} {periodo.anio}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ESTADO_PERIODO_STYLES[periodo.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                        {periodo.estado}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content contentClasses="bg-white py-1.5">
                <div className="max-h-72 overflow-y-auto">
                    {periodos.map((p) => {
                        const active = p.id_periodo === periodo.id_periodo;
                        return (
                            <button
                                key={p.id_periodo}
                                type="button"
                                onClick={() => onChange(p.id_periodo)}
                                className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-start text-sm ${
                                    active ? 'bg-primary-light font-semibold text-primary-dark' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <span>{MESES[p.mes - 1]} {p.anio}</span>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ESTADO_PERIODO_STYLES[p.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {p.estado}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}

// Primer módulo hijo de "Configuración" al que el usuario tiene acceso --
// el atajo de engranaje del topbar apunta ahí. Si el usuario no tiene
// ningún permiso de configuración, `navigation` ni trae el padre (ver
// HandleInertiaRequests::navigationFor) y el atajo simplemente no se pinta.
function firstConfigPath(navigation) {
    const configuracion = navigation.find((item) => item.code === 'configuracion');
    const first = configuracion?.children?.[0];
    return first ? `/${moduleToPath(first.code)}` : null;
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
                            ? 'bg-primary/20 text-white'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <ModuleIcon code={item.code} className={`h-4 w-4 shrink-0 ${active ? 'text-primary-light' : ''}`} />
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
                    active ? 'bg-primary/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
            >
                <span className="flex items-center gap-3">
                    <ModuleIcon code={item.code} className={`h-4 w-4 shrink-0 ${active ? 'text-primary-light' : ''}`} />
                    {item.name}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-3">
                    {item.children.map((child) => {
                        const childActive = isModuleActive(currentPath, child.code);
                        return (
                            <li key={child.code}>
                                <Link
                                    href={`/${moduleToPath(child.code)}`}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium ${
                                        childActive
                                            ? 'bg-primary/20 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <ModuleIcon code={child.code} className={`h-4 w-4 shrink-0 ${childActive ? 'text-primary-light' : ''}`} />
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
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    title="Notificaciones"
                >
                    <Bell className="h-[18px] w-[18px]" />
                    {noLeidas > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
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

export default function AdminLayout({ title, description, children, periodo, periodos, onPeriodoChange }) {
    const { auth, navigation, url } = usePage().props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const breadcrumb = breadcrumbFor(navigation, currentPath);
    const configPath = firstConfigPath(navigation);

    return (
        <div className="min-h-screen bg-surface">
            {/* Sidebar -- oscuro a propósito, distinto del resto del panel (que
                sigue 100% claro, sin clases dark:): es una identidad fija del
                sidebar, no un modo de tema. El toggle claro/oscuro real solo
                existe en el Portal del inquilino, ver tailwind.config.js. */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transform bg-surface-dark transition-transform lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
                    <Link href="/dashboard" className="text-lg font-semibold text-white">
                        Alquileres App
                    </Link>
                </div>
                <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
                    <ul className="space-y-1">
                        {navigation.map((item, index) => {
                            const group = MODULE_GROUPS[item.code];
                            const previousGroup = index > 0 ? MODULE_GROUPS[navigation[index - 1].code] : undefined;
                            const showGroupLabel = group && group !== previousGroup;
                            return (
                                <Fragment key={item.code}>
                                    {showGroupLabel && (
                                        <li className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 first:pt-0">
                                            {group}
                                        </li>
                                    )}
                                    <NavItem item={item} currentPath={currentPath} />
                                </Fragment>
                            );
                        })}
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
                        {/* El título y el "mapa de navegación" (breadcrumb) viven en
                            el contenido, no acá -- ver <main> más abajo. */}
                        {periodo && periodos && onPeriodoChange && (
                            <PeriodSwitcher periodo={periodo} periodos={periodos} onChange={onPeriodoChange} />
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                    {configPath && (
                        <Link
                            href={configPath}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                            title="Configuración"
                        >
                            <Settings className="h-[18px] w-[18px]" />
                        </Link>
                    )}
                    <NotificacionesBell />
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-xs font-bold text-primary-dark">
                                    {iniciales(user.name)}
                                </span>
                                <span className="hidden text-left leading-tight sm:block">
                                    <span className="block text-sm font-semibold text-gray-800">{user.name}</span>
                                    {user.role && <span className="block text-xs text-gray-400">{user.role}</span>}
                                </span>
                                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Cerrar sesión
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                    </div>
                </header>

                <main className="p-4 sm:p-6">
                    {(breadcrumb.length > 0 || title) && (
                        <div className="mb-3">
                            {breadcrumb.length > 0 && (
                                <p className="mb-1 text-xs text-gray-400">{breadcrumb.join(' / ')}</p>
                            )}
                            {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
                            {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
