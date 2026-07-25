import IconButton from '@/Components/IconButton';
import Pagination from '@/Components/Pagination';
import StatusBadge from '@/Components/StatusBadge';
import StatusTabs from '@/Components/StatusTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmDialog from '@/lib/confirm';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

const ESTADO_TABS = [
    { value: 'ACTIVO', label: 'Activas' },
    { value: 'INACTIVO', label: 'De baja' },
    { value: 'TODOS', label: 'Todas' },
];

const emptyForm = {
    id_inmueble: 1, codigo_unidad: '', nombre_unidad: '', piso: 1, tipo_unidad: 'CUARTO',
    tiene_medidor: 'SI', medidor_codigo: '', tarifa_alquiler_base: 0, observacion: '', estado: 'ACTIVO',
};

export default function Index({ unidades, tipos, estadoFiltro }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (permiso) => auth.permissions.includes(permiso);

    const cambiarEstado = (estado) => {
        router.get(route('unidades.index'), { estado }, { preserveState: true, replace: true });
    };

    const cambiarPagina = (page) => {
        router.get(route('unidades.index'), { estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });
    };

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

    const toggleEstado = async (u) => {
        const activando = u.estado !== 'ACTIVO';
        const ok = await confirmDialog({
            title: activando ? '¿Reactivar unidad?' : '¿Dar de baja?',
            text: `Unidad ${u.codigo_unidad}`,
            confirmText: activando ? 'Reactivar' : 'Dar de baja',
            danger: !activando,
        });
        if (ok) router.patch(route('unidades.estado', u.id_unidad));
    };

    return (
        <AdminLayout title="Unidades">
            <Head title="Unidades" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <StatusTabs value={estadoFiltro} options={ESTADO_TABS} onChange={cambiarEstado} />
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
                            <option value="INACTIVO">De baja</option>
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
                        {unidades.data.map((u) => (
                            <tr key={u.id_unidad}>
                                <td className="px-4 py-2 font-medium text-gray-800">{u.codigo_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{u.nombre_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{u.piso}</td>
                                <td className="px-4 py-2 text-gray-500">{u.tipo_unidad}</td>
                                <td className="px-4 py-2 text-right text-gray-500">S/ {Number(u.tarifa_alquiler_base).toFixed(2)}</td>
                                <td className="px-4 py-2">
                                    <StatusBadge estado={u.estado} />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {puede('unidades.editar') && (
                                            <IconButton icon={Pencil} label="Editar" variant="primary" onClick={() => startEdit(u)} />
                                        )}
                                        {puede('unidades.editar') && (
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
                <Pagination meta={unidades} onPageChange={cambiarPagina} />
            </div>
        </AdminLayout>
    );
}
