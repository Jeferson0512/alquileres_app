import InputError from '@/Components/InputError';
import PasswordMatchHint from '@/Components/PasswordMatchHint';
import PasswordRequirements from '@/Components/PasswordRequirements';
import PortalLabel from '@/Components/Portal/PortalLabel';
import PortalTextInput from '@/Components/Portal/PortalTextInput';
import { iniciales } from '@/lib/iniciales';
import PortalLayout from '@/Layouts/PortalLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { KeyRound, UserRound } from 'lucide-react';
import { useRef } from 'react';

const TYPES = { celular: 'tel', email: 'email', direccion: 'text' };

function Section({ icon: Icon, title, description, children }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <header className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary-dark dark:bg-blue-400/10 dark:text-blue-300">
                    <Icon className="h-4 w-4" />
                </span>
                <div>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-slate-100">{title}</h2>
                    {description && <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>}
                </div>
            </header>
            {children}
        </div>
    );
}

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
        <Section icon={KeyRound} title="Contraseña" description="Usa una contraseña larga y difícil de adivinar.">
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <PortalLabel htmlFor="current_password" value="Contraseña actual" />
                    <PortalTextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        type="password"
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        autoComplete="current-password"
                        className="mt-1"
                    />
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div>
                    <PortalLabel htmlFor="password" value="Nueva contraseña" />
                    <PortalTextInput
                        id="password"
                        ref={passwordInput}
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        autoComplete="new-password"
                        className="mt-1"
                    />
                    <PasswordRequirements password={data.password} />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <PortalLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                    <PortalTextInput
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        autoComplete="new-password"
                        className="mt-1"
                    />
                    <PasswordMatchHint password={data.password} confirmation={data.password_confirmation} />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                    >
                        Cambiar contraseña
                    </button>
                    {recentlySuccessful && <span className="text-sm text-gray-500 dark:text-slate-400">Guardado.</span>}
                </div>
            </form>
        </Section>
    );
}

export default function CompletarPerfil({ persona, campos, incompleto }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
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

            <div className="mb-4 flex items-center gap-3.5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-lg font-extrabold text-primary-dark dark:bg-blue-400/10 dark:text-blue-300">
                    {iniciales(user.name)}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-extrabold text-gray-800 dark:text-slate-100">{user.name}</div>
                    <div className="truncate text-sm text-gray-500 dark:text-slate-400">{user.email}</div>
                </div>
                {!incompleto && (
                    <Link href={route('portal.index')} className="shrink-0 text-sm font-medium text-primary hover:text-primary-dark dark:text-blue-400">
                        Volver
                    </Link>
                )}
            </div>

            {incompleto && (
                <div className="mb-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark dark:bg-blue-400/10 dark:text-blue-300">
                    Antes de continuar, necesitamos que completes estos datos. Los marcados con * son obligatorios.
                </div>
            )}

            <div className="space-y-4">
                <Section icon={UserRound} title="Datos de contacto" description="Los usamos para avisos de cobros y vencimientos.">
                    <form onSubmit={submit} className="space-y-4">
                        {campos.map((campo) => (
                            <div key={campo.code}>
                                <PortalLabel htmlFor={campo.code}>
                                    {campo.label} {campo.required ? '*' : <span className="text-gray-400 dark:text-slate-500">(opcional)</span>}
                                </PortalLabel>
                                <PortalTextInput
                                    id={campo.code}
                                    type={TYPES[campo.code] ?? 'text'}
                                    value={data[campo.code]}
                                    onChange={(e) => setData(campo.code, e.target.value)}
                                    className="mt-1"
                                />
                                <InputError message={errors[campo.code]} className="mt-1" />
                            </div>
                        ))}

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                            >
                                {incompleto ? 'Guardar y continuar' : 'Guardar cambios'}
                            </button>
                            {recentlySuccessful && <span className="text-sm text-gray-500 dark:text-slate-400">Guardado.</span>}
                        </div>
                    </form>
                </Section>

                {!incompleto && <CambiarPasswordForm />}
            </div>
        </PortalLayout>
    );
}
