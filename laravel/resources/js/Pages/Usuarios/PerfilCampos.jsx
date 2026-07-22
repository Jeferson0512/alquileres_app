import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function PerfilCampos({ campos }) {
    const { flash } = usePage().props;

    const toggle = (campo) => {
        router.patch(route('usuarios.perfil-campos.update', campo.id), { required: !campo.required }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Campos del perfil de inquilino">
            <Head title="Campos del perfil" />

            <div className="mb-4">
                <Link href={route('usuarios.index')} className="text-sm font-medium text-primary hover:text-primary-dark">← Volver a Usuarios</Link>
            </div>

            {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}

            <div className="mb-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark">
                Estos son los datos que un inquilino debe completar antes de poder usar su portal. Marca cuáles son obligatorios — los que no marques quedan como opcionales.
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Campo</th>
                            <th className="px-4 py-2 text-center font-medium text-gray-500">Obligatorio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {campos.map((campo) => (
                            <tr key={campo.id}>
                                <td className="px-4 py-2 font-medium text-gray-800">{campo.label}</td>
                                <td className="px-4 py-2 text-center">
                                    <label className="inline-flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={campo.required}
                                            onChange={() => toggle(campo)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-xs text-gray-500">{campo.required ? 'Obligatorio' : 'Opcional'}</span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
