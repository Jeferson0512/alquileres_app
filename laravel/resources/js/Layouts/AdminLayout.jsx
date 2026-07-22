import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    Bell, Building2, Calculator, Calendar, ChevronDown, Gauge, KeyRound,
    LayoutDashboard, Menu, Receipt, Settings, Tag, UserCog, Users, Wallet, Zap,
} from 'lucide-react';
import { useState } from 'react';

// Excepciones donde el "code" del módulo (usado también para nombrar permisos,
// ej. config_cobranza.ver) no coincide literalmente con el segmento de la URL.
const CODE_TO_PATH = {
    config_cobranza: 'config-cobranza',
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
    avisos: Bell,
    tarifas: Tag,
    config_cobranza: Settings,
    usuarios: UserCog,
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

function ModuleIcon({ code, className }) {
    const Icon = MODULE_ICONS[code];
    return Icon ? <Icon className={className} strokeWidth={2} /> : null;
}

function NavItem({ item, currentPath }) {
    const hasChildren = item.children && item.children.length > 0;
    const active = isModuleActive(currentPath, item.code);
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
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Cerrar sesión
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
