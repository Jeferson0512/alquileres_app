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
    { value: 'ACTIVO', label: 'Activos' },
    { value: 'INACTIVO', label: 'De baja' },
    { value: 'TODOS', label: 'Todos' },
];

const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'RUC'];

const emptyForm = {
    nombres: '', apellidos: '', tipo_documento: 'DNI', numero_documento: '',
    celular: '', email: '', direccion: '', observacion: '', estado: 'ACTIVO',
};

export default function Index({ inquilinos, filtro, estadoFiltro }) {
    const { auth } = usePage().props;
    const [q, setQ] = useState(filtro ?? '');
    const [editing, setEditing] = useState(null); // null | 'new' | id_persona

    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (permiso) => auth.permissions.includes(permiso);

    const buscar = (value) => {
        setQ(value);
        router.get(route('inquilinos.index'), { q: value, estado: estadoFiltro }, { preserveState: true, replace: true });
    };

    const cambiarEstado = (estado) => {
        router.get(route('inquilinos.index'), { q, estado }, { preserveState: true, replace: true });
    };

    const cambiarPagina = (page) => {
        router.get(route('inquilinos.index'), { q, estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });
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

    const toggleEstado = async (inquilino) => {
        const activando = inquilino.estado !== 'ACTIVO';
        const ok = await confirmDialog({
            title: activando ? '¿Reactivar inquilino?' : '¿Dar de baja?',
            text: `${inquilino.nombres} ${inquilino.apellidos}`,
            confirmText: activando ? 'Reactivar' : 'Dar de baja',
            danger: !activando,
        });
        if (ok) router.patch(route('inquilinos.estado', inquilino.id_persona));
    };

    return (
        <AdminLayout title="Inquilinos">
            <Head title="Inquilinos" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                    <StatusTabs value={estadoFiltro} options={ESTADO_TABS} onChange={cambiarEstado} />
                    <input
                        type="search"
                        placeholder="Buscar por nombre, apellido o documento..."
                        value={q}
                        onChange={(e) => buscar(e.target.value)}
                        className="w-72 rounded-lg border-gray-300 text-sm"
                    />
                </div>
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
                        <label className="block text-xs font-medium text-gray-500">Documento *</label>
                        <div className="mt-1 flex gap-2">
                            <select value={data.tipo_documento} onChange={(e) => setData('tipo_documento', e.target.value)} className="w-1/3 rounded-md border-gray-300 text-sm">
                                {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input placeholder="Número" value={data.numero_documento ?? ''} onChange={(e) => setData('numero_documento', e.target.value)} className="w-2/3 rounded-md border-gray-300 text-sm" />
                        </div>
                        {errors.tipo_documento && <p className="mt-1 text-xs text-danger">{errors.tipo_documento}</p>}
                        {errors.numero_documento && <p className="mt-1 text-xs text-danger">{errors.numero_documento}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Celular</label>
                        <input value={data.celular ?? ''} onChange={(e) => setData('celular', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Email *</label>
                        <input type="email" value={data.email ?? ''} onChange={(e) => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Estado</label>
                        <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">De baja</option>
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
                        {inquilinos.data.map((i) => (
                            <tr key={i.id_persona}>
                                <td className="px-4 py-2 font-medium text-gray-800">{i.nombres} {i.apellidos}</td>
                                <td className="px-4 py-2 text-gray-500">{i.tipo_documento} {i.numero_documento}</td>
                                <td className="px-4 py-2 text-gray-500">{i.celular ?? '-'}</td>
                                <td className="px-4 py-2">
                                    <StatusBadge estado={i.estado} />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {puede('inquilinos.editar') && (
                                            <IconButton icon={Pencil} label="Editar" variant="primary" onClick={() => startEdit(i)} />
                                        )}
                                        {puede('inquilinos.eliminar') && (
                                            <IconButton
                                                icon={i.estado === 'ACTIVO' ? ToggleRight : ToggleLeft}
                                                label={i.estado === 'ACTIVO' ? 'Dar de baja' : 'Reactivar'}
                                                variant={i.estado === 'ACTIVO' ? 'success' : 'default'}
                                                onClick={() => toggleEstado(i)}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination meta={inquilinos} onPageChange={cambiarPagina} />
            </div>
        </AdminLayout>
    );
}
