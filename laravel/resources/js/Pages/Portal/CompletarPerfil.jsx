import PasswordRequirements from '@/Components/PasswordRequirements';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';

const TYPES = { celular: 'tel', email: 'email', direccion: 'text' };

function CambiarPasswordForm() {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('portal.perfil.password'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Contraseña actual</label>
                <input
                    ref={currentPasswordInput}
                    type="password"
                    value={data.current_password}
                    onChange={(e) => setData('current_password', e.target.value)}
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                {errors.current_password && <p className="mt-1 text-xs text-danger">{errors.current_password}</p>}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Nueva contraseña</label>
                <input
                    ref={passwordInput}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                <PasswordRequirements password={data.password} />
                {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">Confirmar contraseña</label>
                <input
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    autoComplete="new-password"
                    className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
                {errors.password_confirmation && <p className="mt-1 text-xs text-danger">{errors.password_confirmation}</p>}
            </div>

            <div className="flex items-center gap-3">
                <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                    Cambiar contraseña
                </button>
                {recentlySuccessful && <span className="text-sm text-gray-500 dark:text-slate-400">Guardado.</span>}
            </div>
        </form>
    );
}

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
                <div className="mb-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark dark:bg-blue-400/10 dark:text-blue-300">
                    Antes de continuar, necesitamos que completes estos datos. Los marcados con * son obligatorios.
                </div>
            ) : (
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-slate-400">Actualiza tus datos de contacto cuando lo necesites.</p>
                    <Link href={route('portal.index')} className="text-sm font-medium text-primary hover:text-primary-dark dark:text-blue-400">
                        Volver
                    </Link>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                {campos.map((campo) => (
                    <div key={campo.code}>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400">
                            {campo.label} {campo.required ? '*' : <span className="text-gray-400 dark:text-slate-500">(opcional)</span>}
                        </label>
                        <input
                            type={TYPES[campo.code] ?? 'text'}
                            value={data[campo.code]}
                            onChange={(e) => setData(campo.code, e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                        />
                        {errors[campo.code] && <p className="mt-1 text-xs text-danger">{errors[campo.code]}</p>}
                    </div>
                ))}

                <button type="submit" disabled={processing} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                    {incompleto ? 'Guardar y continuar' : 'Guardar cambios'}
                </button>
            </form>

            {!incompleto && (
                <>
                    <h2 className="mb-2 mt-6 text-sm font-semibold text-gray-800 dark:text-slate-100">Contraseña</h2>
                    <CambiarPasswordForm />
                </>
            )}
        </PortalLayout>
    );
}
