import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

export default function PerfilCampos({ campos }) {
    const toggle = (campo) => {
        router.patch(route('usuarios.perfil-campos.update', campo.id), { required: !campo.required }, { preserveScroll: true });
    };

    return (
        <AdminLayout title="Campos del perfil de inquilino">
            <Head title="Campos del perfil" />

            <div className="mb-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark">
                Estos son los datos que un inquilino debe completar antes de poder usar su portal. Marca cuáles son obligatorios — los que no marques quedan como opcionales.
            </div>

            <div className="overflow-hidden rounded-[13px] border border-border bg-surface shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surface-2">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Campo</th>
                            <th className="px-4 py-2.5 text-center text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Obligatorio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {campos.map((campo) => (
                            <tr key={campo.id}>
                                <td className="px-4 py-2.5 font-semibold text-ink">{campo.label}</td>
                                <td className="px-4 py-2.5 text-center">
                                    <label className="inline-flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={campo.required}
                                            onChange={() => toggle(campo)}
                                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                        />
                                        <span className="text-xs text-muted">{campo.required ? 'Obligatorio' : 'Opcional'}</span>
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
