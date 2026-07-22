import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-gray-700">
                    Migración en curso — este dashboard todavía es un placeholder.
                    El sidebar de la izquierda ya refleja los módulos y permisos
                    reales del rol logueado.
                </p>
            </div>
        </AdminLayout>
    );
}
