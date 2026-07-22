import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyForm = {
    id_inmueble: 1, codigo_unidad: '', nombre_unidad: '', piso: 1, tipo_unidad: 'CUARTO',
    tiene_medidor: 'SI', medidor_codigo: '', tarifa_alquiler_base: 0, observacion: '', estado: 'ACTIVO',
};

export default function Index({ unidades, tipos }) {
    const { flash, auth } = usePage().props;
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (permiso) => auth.permissions.includes(permiso);

    const startEdit = (u) => {
        setEditing(u.id_unidad);
        setData({ ...emptyForm, ...u });
    };

    const startNew = () => {
        setEditing('new');
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            post(route('unidades.store'), { onSuccess: () => setEditing(null) });
        } else {
            patch(route('unidades.update', editing), { onSuccess: () => setEditing(null) });
        }
    };

    const desactivar = (u) => {
        if (confirm(`¿Desactivar la unidad ${u.codigo_unidad}?`)) {
            router.delete(route('unidades.destroy', u.id_unidad));
        }
    };

    return (
        <AdminLayout title="Unidades">
            <Head title="Unidades" />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}

            <div className="mb-4 flex justify-end">
                {puede('unidades.crear') && (
                    <button type="button" onClick={startNew} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Nueva unidad
                    </button>
                )}
            </div>

            {editing && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Código *</label>
                        <input value={data.codigo_unidad} onChange={(e) => setData('codigo_unidad', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.codigo_unidad && <p className="mt-1 text-xs text-danger">{errors.codigo_unidad}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Nombre *</label>
                        <input value={data.nombre_unidad} onChange={(e) => setData('nombre_unidad', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.nombre_unidad && <p className="mt-1 text-xs text-danger">{errors.nombre_unidad}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Piso *</label>
                        <input type="number" value={data.piso} onChange={(e) => setData('piso', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Tipo</label>
                        <select value={data.tipo_unidad} onChange={(e) => setData('tipo_unidad', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Tiene medidor</label>
                        <select value={data.tiene_medidor} onChange={(e) => setData('tiene_medidor', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="SI">Sí</option>
                            <option value="NO">No</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Cód. medidor</label>
                        <input value={data.medidor_codigo ?? ''} onChange={(e) => setData('medidor_codigo', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Alquiler base (S/)</label>
                        <input type="number" step="0.01" value={data.tarifa_alquiler_base} onChange={(e) => setData('tarifa_alquiler_base', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Estado</label>
                        <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">Inactivo</option>
                        </select>
                    </div>
                    <div className="col-span-2 flex gap-2 sm:col-span-4">
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
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Código</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Nombre</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Piso</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Tipo</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Alquiler base</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {unidades.map((u) => (
                            <tr key={u.id_unidad}>
                                <td className="px-4 py-2 font-medium text-gray-800">{u.codigo_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{u.nombre_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{u.piso}</td>
                                <td className="px-4 py-2 text-gray-500">{u.tipo_unidad}</td>
                                <td className="px-4 py-2 text-right text-gray-500">S/ {Number(u.tarifa_alquiler_base).toFixed(2)}</td>
                                <td className="px-4 py-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.estado === 'ACTIVO' ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {puede('unidades.editar') && (
                                        <button onClick={() => startEdit(u)} className="mr-3 text-sm font-medium text-primary hover:text-primary-dark">Editar</button>
                                    )}
                                    {puede('unidades.editar') && u.estado === 'ACTIVO' && (
                                        <button onClick={() => desactivar(u)} className="text-sm font-medium text-danger hover:opacity-75">Desactivar</button>
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
