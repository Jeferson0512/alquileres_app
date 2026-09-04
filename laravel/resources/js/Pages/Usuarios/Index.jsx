import IconButton from '@/Components/IconButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/StatusBadge';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmDialog from '@/lib/confirm';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { KeyRound, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

function EditarModal({ usuario, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({ name: usuario.name, email: usuario.email });

    const submit = (e) => {
        e.preventDefault();
        patch(route('usuarios.update', usuario.id), { onSuccess: onClose });
    };

    return (
        <Modal show onClose={onClose} maxWidth="sm">
            <form onSubmit={submit} className="p-5">
                <h3 className="mb-4 text-base font-bold text-ink">Editar usuario</h3>
                <div className="space-y-3">
                    <div>
                        <InputLabel htmlFor="usuario_name" value="Nombre *" />
                        <TextInput id="usuario_name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError className="mt-1" message={errors.name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="usuario_email" value="Email *" />
                        <TextInput id="usuario_email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <InputError className="mt-1" message={errors.email} />
                    </div>
                    <InputError message={errors.general} />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function PasswordModal({ usuario, onClose }) {
    const { data, setData, patch, processing, errors, reset } = useForm({ password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        patch(route('usuarios.password', usuario.id), { onSuccess: onClose, onError: () => setData('password', '') });
    };

    return (
        <Modal show onClose={() => { reset(); onClose(); }} maxWidth="sm">
            <form onSubmit={submit} className="p-5">
                <h3 className="mb-1 text-base font-bold text-ink">Cambiar contraseña</h3>
                <p className="mb-4 text-sm text-muted">{usuario.name}</p>
                <p className="mb-4 rounded-lg bg-primary-light px-3 py-2 text-xs text-primary-dark">
                    Esto reemplaza la contraseña sin pedir la actual — úsalo cuando el usuario la olvidó y no puede entrar él mismo a cambiarla.
                </p>
                <div>
                    <InputLabel htmlFor="usuario_password" value="Contraseña nueva *" />
                    <TextInput id="usuario_password" type="password" className="mt-1 block w-full" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    <InputError className="mt-1" message={errors.password} />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={() => { reset(); onClose(); }}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Index({ usuarios, roles, personasDisponibles }) {
    const { auth } = usePage().props;
    const [creating, setCreating] = useState(false);
    const [editando, setEditando] = useState(null);
    const [cambiandoPassword, setCambiandoPassword] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', rol: roles[roles.length - 1] ?? '', id_persona: '',
    });

    const puede = (p) => auth.permissions.includes(p);
    const esInquilino = data.rol === 'Inquilino';
    const personaSeleccionada = personasDisponibles.find((p) => String(p.id_persona) === String(data.id_persona));

    const submit = (e) => {
        e.preventDefault();
        post(route('usuarios.store'), {
            onSuccess: () => { setCreating(false); reset(); },
        });
    };

    const cambiarRol = (usuario, rol) => {
        if (rol === usuario.rol) return;
        router.patch(route('usuarios.asignar-rol', usuario.id), { rol });
    };

    const toggleEstado = async (usuario) => {
        const activando = usuario.estado !== 'ACTIVO';
        const ok = await confirmDialog({
            title: activando ? '¿Reactivar usuario?' : '¿Dar de baja?',
            text: usuario.name,
            confirmText: activando ? 'Reactivar' : 'Dar de baja',
            danger: !activando,
        });
        if (ok) router.patch(route('usuarios.estado', usuario.id));
    };

    return (
        <AdminLayout title="Usuarios">
            <Head title="Usuarios" />

            <div className="mb-4 flex items-center justify-end">
                {puede('usuarios.crear') && !creating && (
                    <button onClick={() => setCreating(true)} className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Nuevo usuario
                    </button>
                )}
            </div>

            {creating && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-[13px] border border-border bg-surface p-4 shadow-sm sm:grid-cols-4">
                    <div>
                        <InputLabel htmlFor="nuevo_rol" value="Rol *" />
                        <select id="nuevo_rol" value={data.rol} onChange={(e) => setData('rol', e.target.value)} className="mt-1 w-full rounded-md border-border bg-surface text-sm text-ink shadow-sm focus:border-primary focus:ring-primary">
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.rol} />
                        {!esInquilino && (
                            <p className="mt-1 text-xs text-muted-2">Elige "Inquilino" para vincular esta cuenta a un inquilino ya registrado.</p>
                        )}
                    </div>

                    {esInquilino ? (
                        <div className="col-span-2 sm:col-span-3">
                            <InputLabel htmlFor="nuevo_persona" value="Inquilino (persona) *" />
                            <select id="nuevo_persona" value={data.id_persona} onChange={(e) => setData('id_persona', e.target.value)} className="mt-1 w-full rounded-md border-border bg-surface text-sm text-ink shadow-sm focus:border-primary focus:ring-primary">
                                <option value="">-- elegir --</option>
                                {personasDisponibles.map((p) => (
                                    <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellidos}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.id_persona} />
                            {personasDisponibles.length === 0 && (
                                <p className="mt-1 text-xs text-warning">No hay inquilinos sin cuenta todavía — todos ya tienen acceso o falta crear su ocupación.</p>
                            )}

                            {personaSeleccionada && (
                                <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-surface-2 p-3">
                                    <div>
                                        <p className="text-xs text-muted-2">Nombre (de su ficha)</p>
                                        <p className="text-sm font-medium text-ink">{personaSeleccionada.nombres} {personaSeleccionada.apellidos}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-2">Email (de su ficha)</p>
                                        {personaSeleccionada.email ? (
                                            <p className="text-sm font-medium text-ink">{personaSeleccionada.email}</p>
                                        ) : (
                                            <p className="text-xs text-danger">Sin email — agrégalo primero en Inquilinos.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div>
                                <InputLabel htmlFor="nuevo_name" value="Nombre *" />
                                <TextInput id="nuevo_name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                <InputError className="mt-1" message={errors.name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="nuevo_email" value="Email *" />
                                <TextInput id="nuevo_email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                <InputError className="mt-1" message={errors.email} />
                            </div>
                        </>
                    )}

                    <div>
                        <InputLabel htmlFor="nuevo_password" value="Contraseña *" />
                        <TextInput id="nuevo_password" type="password" className="mt-1 block w-full" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        <InputError className="mt-1" message={errors.password} />
                    </div>

                    <div className="col-span-2 flex gap-2 sm:col-span-4">
                        <PrimaryButton
                            disabled={processing || (esInquilino && personaSeleccionada && !personaSeleccionada.email)}
                        >
                            Guardar
                        </PrimaryButton>
                        <SecondaryButton type="button" onClick={() => { setCreating(false); reset(); }}>Cancelar</SecondaryButton>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto rounded-[13px] border border-border bg-surface shadow-sm">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-surface-2">
                        <tr>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Email</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Rol</th>
                            <th className="px-4 py-2.5 text-left text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Estado</th>
                            <th className="px-4 py-2.5 text-right text-[0.7rem] font-bold uppercase tracking-wide text-muted-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {usuarios.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-2.5 font-semibold text-ink">{u.name}</td>
                                <td className="px-4 py-2.5 text-muted">{u.email}</td>
                                <td className="px-4 py-2.5">
                                    {puede('usuarios.asignar_rol') ? (
                                        <select
                                            value={u.rol ?? ''}
                                            onChange={(e) => cambiarRol(u, e.target.value)}
                                            className="rounded-md border-border bg-surface text-sm text-ink"
                                        >
                                            <option value="">Sin rol</option>
                                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    ) : (
                                        <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">{u.rol ?? 'Sin rol'}</span>
                                    )}
                                </td>
                                <td className="px-4 py-2.5">
                                    <StatusBadge estado={u.estado} />
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {puede('usuarios.asignar_rol') && u.id_persona === null && (
                                            <IconButton icon={Pencil} label="Editar nombre/email" onClick={() => setEditando(u)} />
                                        )}
                                        {puede('usuarios.asignar_rol') && (
                                            <IconButton icon={KeyRound} label="Cambiar contraseña" onClick={() => setCambiandoPassword(u)} />
                                        )}
                                        {puede('usuarios.asignar_rol') && u.id !== auth.user.id && (
                                            <IconButton
                                                icon={u.estado === 'ACTIVO' ? ToggleRight : ToggleLeft}
                                                label={u.estado === 'ACTIVO' ? 'Dar de baja' : 'Reactivar'}
                                                variant={u.estado === 'ACTIVO' ? 'success' : 'default'}
                                                onClick={() => toggleEstado(u)}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editando && <EditarModal usuario={editando} onClose={() => setEditando(null)} />}
            {cambiandoPassword && <PasswordModal usuario={cambiandoPassword} onClose={() => setCambiandoPassword(null)} />}
        </AdminLayout>
    );
}
