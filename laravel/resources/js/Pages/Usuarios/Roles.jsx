import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Fragment, useState } from 'react';

const ACCION_LABELS = {
    ver: 'Ver', crear: 'Crear', editar: 'Editar', eliminar: 'Eliminar',
    generar: 'Generar', cerrar: 'Cerrar', finalizar: 'Finalizar', anular: 'Anular',
    registrar: 'Registrar', reversar: 'Reversar', sincronizar: 'Sincronizar',
    recalcular: 'Recalcular', enviar: 'Enviar', asignar_rol: 'Asignar rol',
    forzar_actualizacion: 'Forzar actualización',
};

function accionLabel(accion) {
    return ACCION_LABELS[accion] ?? accion;
}

export default function Roles({ grupos, roles, rolePermissions }) {
    const { flash } = usePage().props;
    const [creating, setCreating] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', permisos: [] });

    const tienePermiso = (rol, permiso) => (rolePermissions[rol] || []).includes(permiso);

    const toggle = (rol, permiso, actual) => {
        if (rol === 'Admin') return;
        router.patch(route('usuarios.roles.toggle'), { role: rol, permission: permiso, enabled: !actual }, { preserveScroll: true });
    };

    const togglePermisoNuevoRol = (permiso) => {
        setData('permisos', data.permisos.includes(permiso)
            ? data.permisos.filter((p) => p !== permiso)
            : [...data.permisos, permiso]);
    };

    const crearRol = (e) => {
        e.preventDefault();
        post(route('usuarios.roles.store'), {
            onSuccess: () => { setCreating(false); reset(); },
        });
    };

    return (
        <AdminLayout title="Roles y permisos">
            <Head title="Roles y permisos" />

            <div className="mb-4 flex items-center justify-between">
                <Link href={route('usuarios.index')} className="text-sm font-medium text-primary hover:text-primary-dark">← Volver a Usuarios</Link>
                {!creating && (
                    <button onClick={() => setCreating(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Crear rol
                    </button>
                )}
            </div>

            {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}
            {flash?.errors?.role && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{flash.errors.role}</div>}

            {creating && (
                <form onSubmit={crearRol} className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                    <div className="mb-4 max-w-xs">
                        <label className="block text-xs font-medium text-gray-500">Nombre del rol *</label>
                        <input
                            type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                            placeholder="Ej. Contador"
                            className="mt-1 w-full rounded-md border-gray-300 text-sm"
                        />
                        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                    </div>

                    <p className="mb-2 text-xs font-medium text-gray-500">Permisos iniciales (puedes ajustarlos después en la matriz)</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {grupos.map((grupo) => (
                            <div key={grupo.code} className="rounded-lg border border-gray-100 p-3">
                                <p className={`mb-1.5 text-xs font-semibold text-gray-700 ${grupo.es_submodulo ? 'pl-3' : ''}`}>
                                    {grupo.es_submodulo ? '↳ ' : ''}{grupo.name}
                                </p>
                                <div className="space-y-1">
                                    {grupo.permisos.map((permiso) => (
                                        <label key={permiso.name} className="flex items-center gap-2 text-xs text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={data.permisos.includes(permiso.name)}
                                                onChange={() => togglePermisoNuevoRol(permiso.name)}
                                                className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            {accionLabel(permiso.accion)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">Guardar rol</button>
                        <button type="button" onClick={() => { setCreating(false); reset(); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="mb-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark">
                El rol <strong>Admin</strong> siempre tiene todos los permisos (fijo, no editable) — solo los demás roles se pueden ajustar acá, módulo por módulo y submódulo por submódulo.
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Módulo / acción</th>
                            {roles.map((rol) => (
                                <th key={rol} className="px-4 py-2 text-center font-medium text-gray-500">{rol}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {grupos.map((grupo) => (
                            <Fragment key={grupo.code}>
                                <tr className="bg-gray-50">
                                    <td colSpan={roles.length + 1} className={`px-4 py-1.5 font-semibold text-gray-700 ${grupo.es_submodulo ? 'pl-8' : ''}`}>
                                        {grupo.es_submodulo ? '↳ ' : ''}{grupo.name}
                                    </td>
                                </tr>
                                {grupo.permisos.map((permiso) => (
                                    <tr key={permiso.name}>
                                        <td className={`px-4 py-2 text-gray-600 ${grupo.es_submodulo ? 'pl-12' : 'pl-8'}`}>{accionLabel(permiso.accion)}</td>
                                        {roles.map((rol) => {
                                            const activo = tienePermiso(rol, permiso.name);
                                            const esAdmin = rol === 'Admin';
                                            return (
                                                <td key={rol} className="px-4 py-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={activo}
                                                        disabled={esAdmin}
                                                        onChange={() => toggle(rol, permiso.name, activo)}
                                                        className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${esAdmin ? 'opacity-50' : 'cursor-pointer'}`}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
