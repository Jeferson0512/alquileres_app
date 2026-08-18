import IconButton from '@/Components/IconButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/StatusBadge';
import StatusTabs from '@/Components/StatusTabs';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import confirmDialog from '@/lib/confirm';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Ban, Bed, Building2, Gauge, Home, Package, Pencil, Plus, RotateCcw, Trees, Warehouse } from 'lucide-react';
import { useState } from 'react';

const ESTADO_TABS = [
    { value: 'ACTIVO', label: 'Activas' },
    { value: 'INACTIVO', label: 'De baja' },
    { value: 'TODOS', label: 'Todas' },
];

const TIPO_INFO = {
    CUARTO: { label: 'Cuarto', icon: Bed },
    MINI_DPTO: { label: 'Mini dpto.', icon: Home },
    DEPARTAMENTO: { label: 'Departamento', icon: Home },
    LOCAL: { label: 'Local', icon: Building2 },
    DEPOSITO: { label: 'Depósito', icon: Package },
    AREA_COMUN: { label: 'Área común', icon: Trees },
    MEDIDOR_GENERAL: { label: 'Medidor general', icon: Gauge },
    OTRO: { label: 'Otro', icon: Warehouse },
};

const emptyForm = {
    id_inmueble: 1, codigo_unidad: '', nombre_unidad: '', piso: 1, tipo_unidad: 'CUARTO',
    tiene_medidor: 'SI', medidor_codigo: '', tarifa_alquiler_base: '', observacion: '',
};

const ORDINALES = {
    1: 'Primer', 2: 'Segundo', 3: 'Tercer', 4: 'Cuarto', 5: 'Quinto',
    6: 'Sexto', 7: 'Séptimo', 8: 'Octavo', 9: 'Noveno', 10: 'Décimo',
};

// Sigue el patrón real ya usado en los datos (código = piso + correlativo de
// 2 dígitos, ej. piso 2 -> 201, 202...) -- mira TODOS los códigos del piso,
// incluidas las unidades dadas de baja, para no repetir un código ya usado.
function sugerirParaPiso(piso, todosCodigos) {
    const prefijo = String(piso);
    const secuencias = todosCodigos
        .filter((c) => String(c.piso) === prefijo)
        .map((c) => {
            const resto = String(c.codigo_unidad).startsWith(prefijo) ? String(c.codigo_unidad).slice(prefijo.length) : null;
            return resto && /^\d+$/.test(resto) ? parseInt(resto, 10) : NaN;
        })
        .filter((n) => !isNaN(n));
    const siguiente = (secuencias.length ? Math.max(...secuencias) : 0) + 1;
    return {
        codigo: `${prefijo}${String(siguiente).padStart(2, '0')}`,
        nombre: `${ORDINALES[piso] ?? `Piso ${piso}`} Piso`,
    };
}

function UnidadModal({ show, onClose, unidad, tipos, todosCodigos }) {
    const editando = unidad ?? null;
    const sugerenciaInicial = editando ? null : sugerirParaPiso(emptyForm.piso, todosCodigos);
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        ...emptyForm,
        ...(sugerenciaInicial ? { codigo_unidad: sugerenciaInicial.codigo, nombre_unidad: sugerenciaInicial.nombre } : {}),
        ...editando,
        estado: editando?.estado ?? 'ACTIVO',
    });

    // Solo sugiere en alta -- en edición no queremos pisarle el código/nombre
    // reales a una unidad ya existente solo porque cambió el piso.
    const cambiarPiso = (piso) => {
        if (editando) {
            setData('piso', piso);
            return;
        }
        const sugerencia = sugerirParaPiso(piso, todosCodigos);
        setData((prev) => ({ ...prev, piso, codigo_unidad: sugerencia.codigo, nombre_unidad: sugerencia.nombre }));
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => { reset(); onClose(); };
        if (editando) {
            patch(route('unidades.update', editando.id_unidad), { onSuccess });
        } else {
            post(route('unidades.store'), { onSuccess });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {editando ? `Editar unidad · ${editando.codigo_unidad}` : 'Nueva unidad'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    {editando ? 'El estado de baja/reactivación se cambia desde la tabla, no acá.' : 'Datos de la unidad dentro del inmueble.'}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="codigo_unidad" value="Código *" />
                        <TextInput id="codigo_unidad" className="mt-1 block w-full" maxLength={20} value={data.codigo_unidad} onChange={(e) => setData('codigo_unidad', e.target.value)} isFocused />
                        {!editando && !errors.codigo_unidad && <p className="mt-1 text-xs text-gray-400">Sugerido según el piso — lo podés cambiar.</p>}
                        <InputError className="mt-1" message={errors.codigo_unidad} />
                    </div>
                    <div>
                        <InputLabel htmlFor="nombre_unidad" value="Nombre *" />
                        <TextInput id="nombre_unidad" className="mt-1 block w-full" maxLength={100} value={data.nombre_unidad} onChange={(e) => setData('nombre_unidad', e.target.value)} />
                        {!editando && !errors.nombre_unidad && <p className="mt-1 text-xs text-gray-400">Sugerido — completalo (ej. "{data.nombre_unidad} 3C").</p>}
                        <InputError className="mt-1" message={errors.nombre_unidad} />
                    </div>

                    <div>
                        <InputLabel htmlFor="piso" value="Piso *" />
                        <TextInput id="piso" type="number" min={0} max={50} className="mt-1 block w-full" value={data.piso} onChange={(e) => cambiarPiso(e.target.value)} />
                        <InputError className="mt-1" message={errors.piso} />
                    </div>
                    <div>
                        <InputLabel htmlFor="tipo_unidad" value="Tipo" />
                        <select
                            id="tipo_unidad"
                            value={data.tipo_unidad}
                            onChange={(e) => setData('tipo_unidad', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        >
                            {tipos.map((t) => <option key={t} value={t}>{TIPO_INFO[t]?.label ?? t}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.tipo_unidad} />
                    </div>

                    <div>
                        <InputLabel htmlFor="tiene_medidor" value="Tiene medidor" />
                        <select
                            id="tiene_medidor"
                            value={data.tiene_medidor}
                            onChange={(e) => setData('tiene_medidor', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        >
                            <option value="SI">Sí</option>
                            <option value="NO">No</option>
                        </select>
                    </div>
                    <div>
                        <InputLabel htmlFor="medidor_codigo" value="Código de medidor" />
                        <TextInput
                            id="medidor_codigo"
                            className="mt-1 block w-full"
                            maxLength={50}
                            disabled={data.tiene_medidor === 'NO'}
                            value={data.tiene_medidor === 'NO' ? '' : (data.medidor_codigo ?? '')}
                            onChange={(e) => setData('medidor_codigo', e.target.value)}
                            placeholder={data.tiene_medidor === 'NO' ? 'No aplica' : ''}
                        />
                        <InputError className="mt-1" message={errors.medidor_codigo} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="tarifa_alquiler_base" value="Alquiler base (S/)" />
                        <div className="relative mt-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">S/</span>
                            <TextInput
                                id="tarifa_alquiler_base"
                                type="number"
                                step="0.01"
                                min={0}
                                max={99999.99}
                                className="block w-full pl-8"
                                value={data.tarifa_alquiler_base}
                                onChange={(e) => setData('tarifa_alquiler_base', e.target.value)}
                            />
                        </div>
                        <InputError className="mt-1" message={errors.tarifa_alquiler_base} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="observacion" value="Observación (opcional)" />
                        <textarea
                            id="observacion"
                            rows={2}
                            value={data.observacion ?? ''}
                            onChange={(e) => setData('observacion', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton type="button" onClick={onClose}>Cancelar</SecondaryButton>
                    <PrimaryButton disabled={processing}>{editando ? 'Guardar cambios' : 'Crear unidad'}</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

export default function Index({ unidades, tipos, estadoFiltro, todosCodigos }) {
    const { auth } = usePage().props;
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null);

    const puede = (permiso) => auth.permissions.includes(permiso);

    const cambiarEstado = (estado) => {
        router.get(route('unidades.index'), { estado }, { preserveState: true, replace: true });
    };

    const cambiarPagina = (page) => {
        router.get(route('unidades.index'), { estado: estadoFiltro, page }, { preserveState: true, preserveScroll: true });
    };

    const abrirNueva = () => { setEditando(null); setModalAbierto(true); };
    const abrirEditar = (u) => { setEditando(u); setModalAbierto(true); };

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

    const activas = unidades.data.filter((u) => u.estado === 'ACTIVO');

    return (
        <AdminLayout title="Unidades" description="1 inmueble · catálogo de unidades y su alquiler base">
            <Head title="Unidades" />

            <div className="mb-5 flex items-center justify-end">
                {puede('unidades.crear') && (
                    <button
                        type="button"
                        onClick={abrirNueva}
                        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" /> Nueva unidad
                    </button>
                )}
            </div>

            {estadoFiltro !== 'INACTIVO' && activas.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {activas.map((u) => {
                        const info = TIPO_INFO[u.tipo_unidad] ?? TIPO_INFO.OTRO;
                        const Icon = info.icon;
                        return (
                            <div key={u.id_unidad} className="relative rounded-lg border border-gray-200 bg-white p-3">
                                {(puede('unidades.editar')) && (
                                    <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5">
                                        <IconButton icon={Pencil} label="Editar" variant="primary" onClick={() => abrirEditar(u)} />
                                        <IconButton icon={Ban} label="Dar de baja" variant="danger" onClick={() => toggleEstado(u)} />
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary-dark">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="truncate font-mono text-sm font-bold text-gray-900">{u.codigo_unidad}</div>
                                        <div className="truncate text-xs text-gray-400">{info.label}</div>
                                    </div>
                                </div>
                                <div className="mt-2.5 space-y-0.5 border-t border-gray-100 pt-2 text-xs text-gray-500">
                                    <div>Piso {u.piso} · {u.tiene_medidor === 'SI' ? 'con medidor' : 'sin medidor'}</div>
                                    <div>Alquiler base <strong className="font-semibold text-gray-700">S/ {Number(u.tarifa_alquiler_base).toFixed(2)}</strong></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mb-4">
                <StatusTabs value={estadoFiltro} options={ESTADO_TABS} onChange={cambiarEstado} />
            </div>

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
                                <td className="px-4 py-2 font-mono font-medium text-gray-800">{u.codigo_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{u.nombre_unidad}</td>
                                <td className="px-4 py-2 text-gray-500">{u.piso}</td>
                                <td className="px-4 py-2 text-gray-500">{TIPO_INFO[u.tipo_unidad]?.label ?? u.tipo_unidad}</td>
                                <td className="px-4 py-2 text-right text-gray-500">S/ {Number(u.tarifa_alquiler_base).toFixed(2)}</td>
                                <td className="px-4 py-2">
                                    <StatusBadge estado={u.estado} />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {puede('unidades.editar') && (
                                            <IconButton icon={Pencil} label="Editar" variant="primary" onClick={() => abrirEditar(u)} />
                                        )}
                                        {puede('unidades.editar') && (
                                            <IconButton
                                                icon={u.estado === 'ACTIVO' ? Ban : RotateCcw}
                                                label={u.estado === 'ACTIVO' ? 'Dar de baja' : 'Reactivar'}
                                                variant={u.estado === 'ACTIVO' ? 'danger' : 'success'}
                                                onClick={() => toggleEstado(u)}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {unidades.data.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                                    Sin unidades en este filtro.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination meta={unidades} onPageChange={cambiarPagina} />
            </div>

            <UnidadModal key={editando?.id_unidad ?? 'nueva'} show={modalAbierto} onClose={() => setModalAbierto(false)} unidad={editando} tipos={tipos} todosCodigos={todosCodigos} />
        </AdminLayout>
    );
}
