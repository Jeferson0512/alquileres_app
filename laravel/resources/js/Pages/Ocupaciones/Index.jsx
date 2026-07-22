import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const emptyForm = {
    id_unidad: '', id_persona: '', fecha_inicio: '', fecha_fin: '',
    monto_alquiler: 0, garantia: 0, estado: 'ACTIVO', observacion: '',
    crear_usuario: false, usuario_password: '',
};

export default function Index({ ocupaciones, unidades, inquilinos }) {
    const { flash, auth } = usePage().props;
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, processing, errors, reset } = useForm(emptyForm);

    const puede = (p) => auth.permissions.includes(p);

    const personaSeleccionada = inquilinos.find((p) => String(p.id_persona) === String(data.id_persona));
    const personaYaTieneUsuario = personaSeleccionada?.user_exists ?? false;

    const startEdit = (o) => {
        setEditing(o.id_ocupacion);
        setData({ ...emptyForm, ...o, fecha_fin: o.fecha_fin ?? '' });
    };

    const startNew = () => { setEditing('new'); reset(); };

    const submit = (e) => {
        e.preventDefault();
        if (editing === 'new') {
            post(route('ocupaciones.store'), { onSuccess: () => setEditing(null) });
        } else {
            patch(route('ocupaciones.update', editing), { onSuccess: () => setEditing(null) });
        }
    };

    const finalizar = (o) => {
        if (confirm(`¿Finalizar la ocupación de ${o.unidad?.codigo_unidad} — ${o.persona?.nombres} ${o.persona?.apellidos}?`)) {
            router.delete(route('ocupaciones.destroy', o.id_ocupacion));
        }
    };

    return (
        <AdminLayout title="Ocupaciones">
            <Head title="Ocupaciones" />

            {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}

            <div className="mb-4 flex justify-end">
                {puede('ocupaciones.crear') && (
                    <button onClick={startNew} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
                        Nueva ocupación
                    </button>
                )}
            </div>

            {editing && (
                <form onSubmit={submit} className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Unidad *</label>
                        <select value={data.id_unidad} onChange={(e) => setData('id_unidad', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="">-- elegir --</option>
                            {unidades.map((u) => <option key={u.id_unidad} value={u.id_unidad}>{u.codigo_unidad} · {u.nombre_unidad}</option>)}
                        </select>
                        {errors.id_unidad && <p className="mt-1 text-xs text-danger">{errors.id_unidad}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Inquilino *</label>
                        <select value={data.id_persona} onChange={(e) => setData('id_persona', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="">-- elegir --</option>
                            {inquilinos.map((p) => <option key={p.id_persona} value={p.id_persona}>{p.nombres} {p.apellidos}</option>)}
                        </select>
                        {errors.id_persona && <p className="mt-1 text-xs text-danger">{errors.id_persona}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha inicio *</label>
                        <input type="date" value={data.fecha_inicio} onChange={(e) => setData('fecha_inicio', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.fecha_inicio && <p className="mt-1 text-xs text-danger">{errors.fecha_inicio}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Fecha fin</label>
                        <input type="date" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Monto alquiler (S/)</label>
                        <input type="number" step="0.01" value={data.monto_alquiler} onChange={(e) => setData('monto_alquiler', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Garantía (S/)</label>
                        <input type="number" step="0.01" value={data.garantia} onChange={(e) => setData('garantia', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Estado</label>
                        <select value={data.estado} onChange={(e) => setData('estado', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="ACTIVO">Activo</option>
                            <option value="FINALIZADO">Finalizado</option>
                            <option value="ANULADO">Anulado</option>
                        </select>
                        {errors.id_unidad && data.estado === 'ACTIVO' && <p className="mt-1 text-xs text-danger">{errors.id_unidad}</p>}
                    </div>
                    {data.id_persona && (
                        <div className="col-span-2 rounded-lg border border-primary-light bg-primary-light/30 p-3 sm:col-span-4">
                            {personaYaTieneUsuario ? (
                                <p className="text-xs text-gray-600">Este inquilino ya tiene una cuenta de acceso al portal.</p>
                            ) : (
                                <>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={data.crear_usuario}
                                            onChange={(e) => setData('crear_usuario', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        Crear también su acceso al portal
                                    </label>
                                    {data.crear_usuario && (
                                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Email de acceso (de su ficha)</label>
                                                {personaSeleccionada?.email ? (
                                                    <p className="mt-1 rounded-md bg-white px-3 py-1.5 text-sm text-gray-700">{personaSeleccionada.email}</p>
                                                ) : (
                                                    <p className="mt-1 text-xs text-danger">Sin email registrado — agrégaselo primero en Inquilinos.</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500">Contraseña inicial *</label>
                                                <input type="password" value={data.usuario_password} onChange={(e) => setData('usuario_password', e.target.value)} disabled={!personaSeleccionada?.email} className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-100" />
                                                {errors.usuario_password && <p className="mt-1 text-xs text-danger">{errors.usuario_password}</p>}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="col-span-2 flex gap-2 sm:col-span-4">
                        <button
                            type="submit"
                            disabled={processing || (data.crear_usuario && !personaSeleccionada?.email)}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                        >
                            Guardar
                        </button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Unidad</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inquilino</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inicio</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Fin</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Alquiler</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ocupaciones.map((o) => (
                            <tr key={o.id_ocupacion}>
                                <td className="px-4 py-2 font-medium text-gray-800">{o.unidad?.codigo_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{o.persona?.nombres} {o.persona?.apellidos}</td>
                                <td className="px-4 py-2 text-gray-500">{o.fecha_inicio}</td>
                                <td className="px-4 py-2 text-gray-500">{o.fecha_fin ?? '-'}</td>
                                <td className="px-4 py-2 text-right text-gray-500">S/ {Number(o.monto_alquiler).toFixed(2)}</td>
                                <td className="px-4 py-2">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${o.estado === 'ACTIVO' ? 'bg-primary-light text-primary-dark' : 'bg-gray-100 text-gray-600'}`}>{o.estado}</span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {puede('ocupaciones.crear') && <button onClick={() => startEdit(o)} className="mr-3 text-sm font-medium text-primary hover:text-primary-dark">Editar</button>}
                                    {puede('ocupaciones.finalizar') && o.estado === 'ACTIVO' && <button onClick={() => finalizar(o)} className="text-sm font-medium text-danger hover:opacity-75">Finalizar</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
