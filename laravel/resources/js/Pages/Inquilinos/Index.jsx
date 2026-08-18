import Badge from '@/Components/Badge';
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
import { iniciales } from '@/lib/iniciales';
import confirmDialog from '@/lib/confirm';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Ban, CheckCircle2, HelpCircle, Pencil, Plus, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';

const ESTADO_TABS = [
    { value: 'ACTIVO', label: 'Activos' },
    { value: 'INACTIVO', label: 'De baja' },
    { value: 'TODOS', label: 'Todos' },
];

const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE', 'RUC'];

// Espejo de InquilinoController::FORMATOS_DOCUMENTO -- guía al usuario antes
// de enviar el formulario, pero la validación real (la que manda) sigue
// siendo la del backend.
const FORMATOS_DOCUMENTO = {
    DNI: { maxLength: 8, soloNumeros: true, placeholder: '12345678', ayuda: 'Exactamente 8 dígitos.' },
    RUC: { maxLength: 11, soloNumeros: true, placeholder: '20123456789', ayuda: 'Exactamente 11 dígitos.' },
    CE: { maxLength: 12, soloNumeros: false, placeholder: 'AB1234567', ayuda: 'Entre 6 y 12 caracteres alfanuméricos.' },
    PASAPORTE: { maxLength: 12, soloNumeros: false, placeholder: 'A1234567', ayuda: 'Entre 5 y 12 caracteres alfanuméricos.' },
};

const emptyForm = {
    nombres: '', apellidos: '', tipo_documento: 'DNI', numero_documento: '',
    celular: '', email: '', direccion: '', observacion: '',
};

function InquilinoModal({ show, onClose, inquilino }) {
    const editando = inquilino ?? null;
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        ...emptyForm,
        ...editando,
        estado: editando?.estado ?? 'ACTIVO',
    });

    const formatoDoc = FORMATOS_DOCUMENTO[data.tipo_documento];

    const cambiarTipoDocumento = (tipo) => {
        setData((prev) => ({ ...prev, tipo_documento: tipo, numero_documento: '' }));
    };

    const cambiarNumeroDocumento = (value) => {
        const limpio = formatoDoc.soloNumeros ? value.replace(/\D/g, '') : value.replace(/[^A-Za-z0-9]/g, '');
        setData('numero_documento', limpio.slice(0, formatoDoc.maxLength));
    };

    const cambiarCelular = (value) => {
        setData('celular', value.replace(/\D/g, '').slice(0, 9));
    };

    const submit = (e) => {
        e.preventDefault();
        const onSuccess = () => { reset(); onClose(); };
        if (editando) {
            patch(route('inquilinos.update', editando.id_persona), { onSuccess });
        } else {
            post(route('inquilinos.store'), { onSuccess });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900">
                    {editando ? `Editar inquilino · ${editando.nombres} ${editando.apellidos}` : 'Nuevo inquilino'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    {editando ? 'El estado de baja/reactivación se cambia desde la tabla, no acá.' : 'Datos básicos de contacto y documento de identidad.'}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="nombres" value="Nombres *" />
                        <TextInput id="nombres" className="mt-1 block w-full" value={data.nombres} onChange={(e) => setData('nombres', e.target.value)} isFocused />
                        <InputError className="mt-1" message={errors.nombres} />
                    </div>
                    <div>
                        <InputLabel htmlFor="apellidos" value="Apellidos *" />
                        <TextInput id="apellidos" className="mt-1 block w-full" value={data.apellidos} onChange={(e) => setData('apellidos', e.target.value)} />
                        <InputError className="mt-1" message={errors.apellidos} />
                    </div>

                    <div>
                        <InputLabel htmlFor="tipo_documento" value="Tipo de documento *" />
                        <select
                            id="tipo_documento"
                            value={data.tipo_documento}
                            onChange={(e) => cambiarTipoDocumento(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        >
                            {TIPOS_DOCUMENTO.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <InputError className="mt-1" message={errors.tipo_documento} />
                    </div>
                    <div>
                        <InputLabel htmlFor="numero_documento" value="Número de documento *" />
                        <TextInput
                            id="numero_documento"
                            className="mt-1 block w-full"
                            inputMode={formatoDoc.soloNumeros ? 'numeric' : 'text'}
                            maxLength={formatoDoc.maxLength}
                            placeholder={formatoDoc.placeholder}
                            value={data.numero_documento}
                            onChange={(e) => cambiarNumeroDocumento(e.target.value)}
                        />
                        {!errors.numero_documento && <p className="mt-1 text-xs text-gray-400">{formatoDoc.ayuda}</p>}
                        <InputError className="mt-1" message={errors.numero_documento} />
                    </div>

                    <div>
                        <InputLabel htmlFor="celular" value="Celular" />
                        <TextInput
                            id="celular"
                            className="mt-1 block w-full"
                            inputMode="numeric"
                            maxLength={9}
                            placeholder="987654321"
                            value={data.celular ?? ''}
                            onChange={(e) => cambiarCelular(e.target.value)}
                        />
                        <InputError className="mt-1" message={errors.celular} />
                    </div>
                    <div>
                        <InputLabel htmlFor="email" value="Correo electrónico *" />
                        <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email ?? ''} onChange={(e) => setData('email', e.target.value)} />
                        <InputError className="mt-1" message={errors.email} />
                    </div>

                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="direccion" value="Dirección (opcional)" />
                        <TextInput id="direccion" className="mt-1 block w-full" value={data.direccion ?? ''} onChange={(e) => setData('direccion', e.target.value)} />
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
                    <PrimaryButton disabled={processing}>{editando ? 'Guardar cambios' : 'Crear inquilino'}</PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

function PortalBadge({ conAcceso }) {
    return conAcceso ? (
        <Badge variant="info">
            <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Con acceso</span>
        </Badge>
    ) : (
        <Badge variant="gray">
            <span className="inline-flex items-center gap-1"><HelpCircle className="h-3 w-3" /> Sin acceso</span>
        </Badge>
    );
}

export default function Index({ inquilinos, filtro, estadoFiltro, totalActivos, totalRegistrados }) {
    const { auth } = usePage().props;
    const [q, setQ] = useState(filtro ?? '');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null);

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

    const abrirNuevo = () => { setEditando(null); setModalAbierto(true); };
    const abrirEditar = (i) => { setEditando(i); setModalAbierto(true); };

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
        <AdminLayout
            title="Inquilinos"
            description={`${totalActivos} activos de ${totalRegistrados} registrados`}
            actions={puede('inquilinos.crear') && (
                <button
                    type="button"
                    onClick={abrirNuevo}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                >
                    <Plus className="h-4 w-4" /> Nuevo inquilino
                </button>
            )}
        >
            <Head title="Inquilinos" />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <StatusTabs value={estadoFiltro} options={ESTADO_TABS} onChange={cambiarEstado} />
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Buscar por nombre, apellido o documento..."
                        value={q}
                        onChange={(e) => buscar(e.target.value)}
                        className="w-72 rounded-lg border-gray-300 py-2 pl-8 text-sm shadow-sm focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Inquilino</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Documento</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Celular</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Portal</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inquilinos.data.map((i) => (
                            <tr key={i.id_persona}>
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-xs font-bold text-primary-dark">
                                            {iniciales(`${i.nombres} ${i.apellidos}`)}
                                        </span>
                                        <div>
                                            <div className="font-medium text-gray-800">{i.nombres} {i.apellidos}</div>
                                            <div className="text-xs text-gray-400">
                                                {i.ocupacion_activa?.unidad
                                                    ? `Unidad ${i.ocupacion_activa.unidad.codigo_unidad}`
                                                    : 'Sin unidad asignada'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 font-mono text-xs text-gray-500">{i.tipo_documento} {i.numero_documento}</td>
                                <td className="px-4 py-2 text-gray-500">{i.celular ?? '-'}</td>
                                <td className="px-4 py-2"><PortalBadge conAcceso={i.user_exists} /></td>
                                <td className="px-4 py-2"><StatusBadge estado={i.estado} /></td>
                                <td className="px-4 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {puede('inquilinos.editar') && (
                                            <IconButton icon={Pencil} label="Editar" variant="primary" onClick={() => abrirEditar(i)} />
                                        )}
                                        {puede('inquilinos.eliminar') && (
                                            <IconButton
                                                icon={i.estado === 'ACTIVO' ? Ban : RotateCcw}
                                                label={i.estado === 'ACTIVO' ? 'Dar de baja' : 'Reactivar'}
                                                variant={i.estado === 'ACTIVO' ? 'danger' : 'success'}
                                                onClick={() => toggleEstado(i)}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {inquilinos.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                                    Sin inquilinos que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination meta={inquilinos} onPageChange={cambiarPagina} />
            </div>

            <InquilinoModal key={editando?.id_persona ?? 'nuevo'} show={modalAbierto} onClose={() => setModalAbierto(false)} inquilino={editando} />
        </AdminLayout>
    );
}
