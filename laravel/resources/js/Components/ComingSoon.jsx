import { Construction } from 'lucide-react';

/**
 * Placeholder para una vista todavía no construida o en rediseño activo.
 * Uso: <AdminLayout title="Reportes"><ComingSoon /></AdminLayout>
 * o con mensaje propio: <ComingSoon title="..." message="..." />
 */
export default function ComingSoon({
    title = 'Estamos trabajando en esto',
    message = 'Esta sección está en construcción — todavía no tiene una vista propia. Volvé a pasar más adelante.',
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
                <Construction className="h-7 w-7 text-primary-dark" />
            </span>
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
            <p className="mt-1.5 max-w-sm text-sm text-gray-500">{message}</p>
        </div>
    );
}
