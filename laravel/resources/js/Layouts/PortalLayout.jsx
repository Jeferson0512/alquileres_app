import { Link, usePage } from '@inertiajs/react';

/**
 * Layout minimalista para el portal del Inquilino -- sin el sidebar de
 * modulos del panel admin (AdminLayout). Una sola columna, mobile-first:
 * el caso de uso real es el navegador del celular.
 */
export default function PortalLayout({ title, children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-surface">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
                <span className="text-lg font-semibold text-primary">Alquileres App</span>
                <div className="flex items-center gap-3">
                    <span className="hidden text-sm text-gray-500 sm:inline">{auth.user?.name}</span>
                    <Link
                        href={route('logout')} method="post" as="button"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cerrar sesión
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-2xl p-4 sm:p-6">
                {title && <h1 className="mb-4 text-lg font-semibold text-gray-800">{title}</h1>}
                {children}
            </main>
        </div>
    );
}
