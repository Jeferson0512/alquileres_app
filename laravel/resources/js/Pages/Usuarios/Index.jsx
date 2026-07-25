import IconButton from '@/Components/IconButton';
import StatusBadge from '@/Components/StatusBadge';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-4 text-base font-semibold text-gray-800">Editar usuario</h3>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Nombre *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Email *</label>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                    </div>
                    {errors.general && <p className="text-xs text-danger">{errors.general}</p>}
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">Guardar</button>
                        <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordModal({ usuario, onClose }) {
    const { data, setData, patch, processing, errors, reset } = useForm({ password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        patch(route('usuarios.password', usuario.id), { onSuccess: onClose, onError: () => setData('password', '') });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
                <h3 className="mb-1 text-base font-semibold text-gray-800">Cambiar contraseña</h3>
                <p className="mb-4 text-sm text-gray-500">{usuario.name}</p>
                <p className="mb-4 rounded-lg bg-primary-light px-3 py-2 text-xs text-primary-dark">
                    Esto reemplaza la contraseña sin pedir la actual — úsalo cuando el usuario la olvidó y no puede entrar él mismo a cambiarla.
                </p>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Contraseña nueva *</label>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">Guardar</button>
                        <button type="button" onClick={() => { reset(); onClose(); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
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
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Rol *</label>
                        <select value={data.rol} onChange={(e) => setData('rol', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {errors.rol && <p className="mt-1 text-xs text-danger">{errors.rol}</p>}
                        {!esInquilino && (
                            <p className="mt-1 text-xs text-gray-400">Elige "Inquilino" para vincular esta cuenta a un inquilino ya registrado.</p>
                        )}
                    </div>

                    {esInquilino ? (
                        <div className="col-span-2 sm:col-span-3">
                            <label className="block text-xs font-medium text-gray-500">Inquilino (persona) *</label>
                            <select value={data.id_persona} onChange={(e) => setData('id_persona', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                                <option value="">-- elegir --</option>
                                {personasDisponibles.map((p) => (
                                    <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellidos}</option>
                                ))}
                            </select>
                            {errors.id_persona && <p className="mt-1 text-xs text-danger">{errors.id_persona}</p>}
                            {personasDisponibles.length === 0 && (
                                <p className="mt-1 text-xs text-warning">No hay inquilinos sin cuenta todavía — todos ya tienen acceso o falta crear su ocupación.</p>
                            )}

                            {personaSeleccionada && (
                                <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-surface p-3">
                                    <div>
                                        <p className="text-xs text-gray-400">Nombre (de su ficha)</p>
                                        <p className="text-sm font-medium text-gray-800">{personaSeleccionada.nombres} {personaSeleccionada.apellidos}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Email (de su ficha)</p>
                                        {personaSeleccionada.email ? (
                                            <p className="text-sm font-medium text-gray-800">{personaSeleccionada.email}</p>
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
                                <label className="block text-xs font-medium text-gray-500">Nombre *</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                                {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Email *</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                                {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-500">Contraseña *</label>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
                    </div>

                    <div className="col-span-2 flex gap-2 sm:col-span-4">
                        <button
                            type="submit"
                            disabled={processing || (esInquilino && personaSeleccionada && !personaSeleccionada.email)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                        >
                            Guardar
                        </button>
                        <button type="button" onClick={() => { setCreating(false); reset(); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Nombre</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Rol</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {usuarios.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-2 font-medium text-gray-800">{u.name}</td>
                                <td className="px-4 py-2 text-gray-500">{u.email}</td>
                                <td className="px-4 py-2">
                                    {puede('usuarios.asignar_rol') ? (
                                        <select
                                            value={u.rol ?? ''}
                                            onChange={(e) => cambiarRol(u, e.target.value)}
                                            className="rounded-md border-gray-300 text-sm"
                                        >
                                            <option value="">Sin rol</option>
                                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    ) : (
                                        <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">{u.rol ?? 'Sin rol'}</span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <StatusBadge estado={u.estado} />
                                </td>
                                <td className="px-4 py-2 text-right">
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
