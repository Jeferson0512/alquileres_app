import PortalLayout from '@/Layouts/PortalLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const TYPES = { celular: 'tel', email: 'email', direccion: 'text' };

export default function CompletarPerfil({ persona, campos, incompleto }) {
    const { data, setData, patch, processing, errors } = useForm({
        celular: persona.celular ?? '',
        email: persona.email ?? '',
        direccion: persona.direccion ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('portal.perfil.actualizar'));
    };

    return (
        <PortalLayout title={incompleto ? 'Completa tu perfil' : 'Mi perfil'}>
            <Head title="Mi perfil" />

            {incompleto ? (
                <div className="mb-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark">
                    Antes de continuar, necesitamos que completes estos datos. Los marcados con * son obligatorios.
                </div>
            ) : (
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Actualiza tus datos de contacto cuando lo necesites.</p>
                    <Link href={route('portal.index')} className="text-sm font-medium text-primary hover:text-primary-dark">
                        Volver
                    </Link>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                {campos.map((campo) => (
                    <div key={campo.code}>
                        <label className="block text-xs font-medium text-gray-500">
                            {campo.label} {campo.required ? '*' : <span className="text-gray-400">(opcional)</span>}
                        </label>
                        <input
                            type={TYPES[campo.code] ?? 'text'}
                            value={data[campo.code]}
                            onChange={(e) => setData(campo.code, e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 text-sm"
                        />
                        {errors[campo.code] && <p className="mt-1 text-xs text-danger">{errors[campo.code]}</p>}
                    </div>
                ))}

                <button type="submit" disabled={processing} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                    {incompleto ? 'Guardar y continuar' : 'Guardar cambios'}
                </button>
            </form>
        </PortalLayout>
    );
}
