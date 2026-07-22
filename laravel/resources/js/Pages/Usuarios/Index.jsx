import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ usuarios, roles }) {
    const { flash, auth } = usePage().props;
    const [creating, setCreating] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', password: '', rol: roles[roles.length - 1] ?? '',
    });

    const puede = (p) => auth.permissions.includes(p);

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

    return (
        <AdminLayout title="Usuarios">
            <Head title="Usuarios" />

            {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}

            <div className="mb-4 flex items-center justify-between">
                {puede('usuarios.asignar_rol') && (
                    <Link href={route('usuarios.roles')} className="text-sm font-medium text-primary hover:text-primary-dark">
                        Roles y permisos →
                    </Link>
                )}
                {puede('usuarios.crear') && !creating && (
                    <button onClick={() => setCreating(true)} className="ml-auto rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Nuevo usuario
                    </button>
                )}
            </div>

            {creating && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
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
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Contraseña *</label>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Rol *</label>
                        <select value={data.rol} onChange={(e) => setData('rol', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {errors.rol && <p className="mt-1 text-xs text-danger">{errors.rol}</p>}
                    </div>
                    <div className="col-span-2 flex gap-2 sm:col-span-4">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">Guardar</button>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
