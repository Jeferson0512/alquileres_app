import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyForm = {
    nombres: '', apellidos: '', tipo_documento: '', numero_documento: '',
    celular: '', email: '', direccion: '', observacion: '', estado: 'ACTIVO',
};

export default function Index({ inquilinos, filtro }) {
    const { flash, auth } = usePage().props;
    const [q, setQ] = useState(filtro ?? '');
    const [editing, setEditing] = useState(null); // null | 'new' | id_persona

    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (permiso) => auth.permissions.includes(permiso);

    const buscar = (value) => {
        setQ(value);
        router.get(route('inquilinos.index'), { q: value }, { preserveState: true, replace: true });
    };

    const startEdit = (inquilino) => {
        setEditing(inquilino.id_persona);
        setData({ ...emptyForm, ...inquilino });
    };

    const startNew = () => {
        setEditing('new');
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            post(route('inquilinos.store'), { onSuccess: () => setEditing(null) });
        } else {
            patch(route('inquilinos.update', editing), { onSuccess: () => setEditing(null) });
        }
    };

    const desactivar = (inquilino) => {
        if (confirm(`¿Desactivar a ${inquilino.nombres} ${inquilino.apellidos}?`)) {
            router.delete(route('inquilinos.destroy', inquilino.id_persona));
        }
    };

    return (
        <AdminLayout title="Inquilinos">
            <Head title="Inquilinos" />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}

            <div className="mb-4 flex items-center justify-between gap-4">
                <input
                    type="search"
                    placeholder="Buscar por nombre, apellido o documento..."
                    value={q}
                    onChange={(e) => buscar(e.target.value)}
                    className="w-72 rounded-lg border-gray-300 text-sm"
                />
                {puede('inquilinos.crear') && (
                    <button type="button" onClick={startNew} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Nuevo inquilino
                    </button>
                )}
            </div>

            {editing && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Nombres *</label>
                        <input value={data.nombres} onChange={(e) => setData('nombres', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.nombres && <p className="mt-1 text-xs text-danger">{errors.nombres}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Apellidos *</label>
                        <input value={data.apellidos} onChange={(e) => setData('apellidos', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.apellidos && <p className="mt-1 text-xs text-danger">{errors.apellidos}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Documento</label>
                        <div className="mt-1 flex gap-2">
                            <input placeholder="Tipo" value={data.tipo_documento ?? ''} onChange={(e) => setData('tipo_documento', e.target.value)} className="w-1/3 rounded-md border-gray-300 text-sm" />
                            <input placeholder="Número" value={data.numero_documento ?? ''} onChange={(e) => setData('numero_documento', e.target.value)} className="w-2/3 rounded-md border-gray-300 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Celular</label>
                        <input value={data.celular ?? ''} onChange={(e) => setData('celular', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Email</label>
                        <input type="email" value={data.email ?? ''} onChange={(e) => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Estado</label>
                        <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">Inactivo</option>
                        </select>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                        <label className="block text-xs font-medium text-gray-500">Dirección</label>
                        <input value={data.direccion ?? ''} onChange={(e) => setData('direccion', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div className="col-span-2 flex gap-2 sm:col-span-3">
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                            Guardar
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Nombre</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Documento</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Celular</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquilinos.map((i) => (
                            <tr key={i.id_persona}>
                                <td className="px-4 py-2 font-medium text-gray-800">{i.nombres} {i.apellidos}</td>
                                <td className="px-4 py-2 text-gray-500">{i.tipo_documento} {i.numero_documento}</td>
                                <td className="px-4 py-2 text-gray-500">{i.celular ?? '-'}</td>
                                <td className="px-4 py-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${i.estado === 'ACTIVO' ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-600'}`}>
                                        {i.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {puede('inquilinos.editar') && (
                                        <button onClick={() => startEdit(i)} className="mr-3 text-sm font-medium text-primary hover:text-primary-dark">Editar</button>
                                    )}
                                    {puede('inquilinos.eliminar') && i.estado === 'ACTIVO' && (
                                        <button onClick={() => desactivar(i)} className="text-sm font-medium text-danger hover:opacity-75">Desactivar</button>
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
