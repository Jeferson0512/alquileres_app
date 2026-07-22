import { Head, Link, useForm, usePage } from '@inertiajs/react';

const TIPO_LABELS = {
    CUARTO: 'Cuarto', MINI_DPTO: 'Mini departamento', DEPARTAMENTO: 'Departamento',
    LOCAL: 'Local', DEPOSITO: 'Depósito', OTRO: 'Otro',
};

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

export default function Landing({ unidadesDisponibles }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', message: '', unit_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('landing.contacto'), { onSuccess: () => reset() });
    };

    return (
        <div className="min-h-screen bg-surface">
            <Head title="Alquileres App" />

            <header className="flex items-center justify-between px-6 py-4">
                <span className="text-lg font-semibold text-primary">Alquileres App</span>
                <Link href={route('login')} className="rounded-lg border border-primary px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary-light">
                    Iniciar sesión
                </Link>
            </header>

            <section className="bg-gradient-to-br from-surface-dark to-primary-dark px-6 py-16 text-center text-white sm:py-24">
                <h1 className="text-3xl font-bold sm:text-4xl">Habitaciones y departamentos en alquiler</h1>
                <p className="mx-auto mt-3 max-w-xl text-white/80">
                    Unidades disponibles ahora mismo. Escríbenos y te contamos los detalles para que puedas venir a conocerlas.
                </p>
            </section>

            <main className="mx-auto max-w-5xl px-6 py-10">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Unidades disponibles</h2>

                {unidadesDisponibles.length === 0 ? (
                    <div className="mb-10 rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
                        No hay unidades disponibles por el momento — escríbenos y te avisamos apenas se libere una.
                    </div>
                ) : (
                    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {unidadesDisponibles.map((u) => (
                            <div key={u.id_unidad} className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium text-primary-dark">
                                        {TIPO_LABELS[u.tipo_unidad] ?? u.tipo_unidad}
                                    </span>
                                    <span className="text-xs text-gray-400">Piso {u.piso}</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">{u.nombre_unidad}</p>
                                <p className="text-xs text-gray-400">Unidad {u.codigo_unidad}</p>
                                <p className="mt-2 text-lg font-bold text-primary">{money(u.tarifa_alquiler_base)} <span className="text-xs font-normal text-gray-400">/ mes</span></p>
                            </div>
                        ))}
                    </div>
                )}

                <h2 className="mb-4 text-xl font-semibold text-gray-800">¿Te interesa? Escríbenos</h2>

                {flash?.success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>}

                <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 sm:p-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Nombre *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Unidad de interés</label>
                        <select value={data.unit_id} onChange={(e) => setData('unit_id', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm">
                            <option value="">Cualquiera</option>
                            {unidadesDisponibles.map((u) => (
                                <option key={u.id_unidad} value={u.id_unidad}>{u.codigo_unidad} — {u.nombre_unidad}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Email</label>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Teléfono</label>
                        <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-gray-500">Mensaje *</label>
                        <textarea rows={3} value={data.message} onChange={(e) => setData('message', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm" />
                        {errors.message && <p className="mt-1 text-xs text-danger">{errors.message}</p>}
                    </div>
                    <p className="text-xs text-gray-400 sm:col-span-2">Déjanos al menos un email o un teléfono para poder contactarte.</p>
                    <div className="sm:col-span-2">
                        <button type="submit" disabled={processing} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 sm:w-auto">
                            Enviar consulta
                        </button>
                    </div>
                </form>
            </main>

            <footer className="px-6 py-6 text-center text-xs text-gray-400">
                Alquileres App
            </footer>
        </div>
    );
}
