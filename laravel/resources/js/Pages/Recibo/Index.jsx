import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Index({ periodo, periodos, recibo, tieneAnterior }) {
    const { flash, errors, auth } = usePage().props;
    const puede = auth.permissions.includes('recibo.editar');
    const editable = periodo.estado === 'ABIERTO' && puede;

    const { data, setData, post, processing } = useForm({
        numero_suministro: recibo.numero_suministro ?? '',
        fecha_emision: recibo.fecha_emision ?? '',
        fecha_vencimiento: recibo.fecha_vencimiento ?? '',
        lectura_anterior_general: Number(recibo.lectura_anterior_general) || 0,
        lectura_actual_general: Number(recibo.lectura_actual_general) || 0,
        precio_kwh: Number(recibo.precio_kwh) || 0,
        consumo_energia: Number(recibo.consumo_energia) || 0,
        cargo_fijo: Number(recibo.cargo_fijo) || 0,
        mant_reposicion: Number(recibo.mant_reposicion) || 0,
        alumbrado_publico: Number(recibo.alumbrado_publico) || 0,
        subtotal: Number(recibo.subtotal) || 0,
        igv: Number(recibo.igv) || 0,
        electrificacion_rural: Number(recibo.electrificacion_rural) || 0,
        ajuste_redondeo_anterior: Number(recibo.ajuste_redondeo_anterior) || 0,
        ajuste_redondeo_actual: Number(recibo.ajuste_redondeo_actual) || 0,
        total_recibo: Number(recibo.total_recibo) || 0,
        observacion: recibo.observacion ?? '',
    });

    // Replica autoCalcular() de public/assets/js/modules/recibo.js
    useEffect(() => {
        const consumoKwh = Math.max(data.lectura_actual_general - data.lectura_anterior_general, 0);
        const consumoEnergia = consumoKwh * data.precio_kwh;
        const subtotal = consumoEnergia + Number(data.cargo_fijo) + Number(data.mant_reposicion) + Number(data.alumbrado_publico);
        const igv = subtotal * 0.18;
        const total = subtotal + igv + Number(data.electrificacion_rural) + Number(data.ajuste_redondeo_anterior) + Number(data.ajuste_redondeo_actual);

        if (consumoEnergia.toFixed(2) !== Number(data.consumo_energia).toFixed(2)) setData('consumo_energia', Number(consumoEnergia.toFixed(2)));
        if (subtotal.toFixed(2) !== Number(data.subtotal).toFixed(2)) setData('subtotal', Number(subtotal.toFixed(2)));
        if (igv.toFixed(2) !== Number(data.igv).toFixed(2)) setData('igv', Number(igv.toFixed(2)));
        if (total.toFixed(2) !== Number(data.total_recibo).toFixed(2)) setData('total_recibo', Number(total.toFixed(2)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.lectura_anterior_general, data.lectura_actual_general, data.precio_kwh, data.cargo_fijo, data.mant_reposicion, data.alumbrado_publico, data.electrificacion_rural, data.ajuste_redondeo_anterior, data.ajuste_redondeo_actual]);

    const cambiarPeriodo = (id) => {
        router.get(route('recibo.index'), { periodo_id: id }, { preserveState: true });
    };

    const copiarAnterior = () => {
        router.post(route('recibo.copiar-anterior'), { periodo_id: periodo.id_periodo });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('recibo.store') + `?periodo_id=${periodo.id_periodo}`);
    };

    const num = (key, label, step = '0.01') => (
        <div>
            <label className="block text-xs font-medium text-gray-500">{label}</label>
            <input
                type="number"
                step={step}
                value={data[key]}
                disabled={!editable}
                onChange={(e) => setData(key, parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-50"
            />
            {errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>}
        </div>
    );

    const consumoKwh = Math.max(data.lectura_actual_general - data.lectura_anterior_general, 0);

    return (
        <AdminLayout title="Recibo de luz">
            <Head title="Recibo de luz" />

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}
            {errors?.general && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">{errors.general}</div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <select value={periodo.id_periodo} onChange={(e) => cambiarPeriodo(e.target.value)} className="rounded-lg border-gray-300 text-sm">
                    {periodos.map((p) => (
                        <option key={p.id_periodo} value={p.id_periodo}>{p.mes}/{p.anio} ({p.estado})</option>
                    ))}
                </select>
                <p className="text-sm text-gray-500">Nº recibo: <span className="font-medium text-gray-700">{recibo.numero_recibo}</span></p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Nº suministro</label>
                            <input value={data.numero_suministro} disabled={!editable} onChange={(e) => setData('numero_suministro', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Fecha emisión</label>
                            <input type="date" value={data.fecha_emision ?? ''} disabled={!editable} onChange={(e) => setData('fecha_emision', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Fecha vencimiento</label>
                            <input type="date" value={data.fecha_vencimiento ?? ''} disabled={!editable} onChange={(e) => setData('fecha_vencimiento', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-50" />
                        </div>
                        {num('precio_kwh', 'Precio kWh', '0.0001')}
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-4">
                        {num('lectura_anterior_general', 'Lectura anterior')}
                        {num('lectura_actual_general', 'Lectura actual')}
                        <div>
                            <label className="block text-xs font-medium text-gray-500">Consumo (kWh)</label>
                            <input value={consumoKwh.toFixed(2)} readOnly className="mt-1 w-full rounded-md border-gray-200 bg-gray-50 text-sm" />
                        </div>
                        {num('consumo_energia', 'Consumo energía (S/)')}
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-5 sm:grid-cols-4">
                        {num('cargo_fijo', 'Cargo fijo')}
                        {num('mant_reposicion', 'Mant. reposición')}
                        {num('alumbrado_publico', 'Alumbrado público')}
                        {num('electrificacion_rural', 'Electrificación rural')}
                        {num('ajuste_redondeo_anterior', 'Ajuste redondeo anterior')}
                        {num('ajuste_redondeo_actual', 'Ajuste redondeo actual')}
                        {num('subtotal', 'Subtotal')}
                        {num('igv', 'IGV (18%)')}
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <label className="block text-xs font-medium text-gray-500">Observación</label>
                        <input value={data.observacion ?? ''} disabled={!editable} onChange={(e) => setData('observacion', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-50" />
                    </div>

                    {editable && (
                        <div className="flex gap-2">
                            <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                                Guardar recibo del mes
                            </button>
                            {tieneAnterior && (
                                <button type="button" onClick={copiarAnterior} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                    Copiar desde mes anterior
                                </button>
                            )}
                        </div>
                    )}
                </form>

                <aside className="space-y-4">
                    <section className="rounded-lg border border-gray-200 bg-gradient-to-br from-primary-dark to-primary p-5 text-white">
                        <p className="text-xs uppercase tracking-wide text-white/70">Total del recibo</p>
                        <p className="mt-1 text-3xl font-bold">S/ {Number(data.total_recibo).toFixed(2)}</p>
                        <p className="mt-1 text-xs text-white/70">{periodo.mes}/{periodo.anio} · {periodo.estado}</p>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Resumen</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Consumo</span><strong className="text-gray-800">{consumoKwh.toFixed(2)} kWh</strong></div>
                            <div className="flex justify-between"><span className="text-gray-500">Consumo energía</span><strong className="text-gray-800">S/ {Number(data.consumo_energia).toFixed(2)}</strong></div>
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><strong className="text-gray-800">S/ {Number(data.subtotal).toFixed(2)}</strong></div>
                            <div className="flex justify-between"><span className="text-gray-500">IGV (18%)</span><strong className="text-gray-800">S/ {Number(data.igv).toFixed(2)}</strong></div>
                        </div>
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-2 text-sm font-semibold text-gray-800">¿Cómo funciona?</h3>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Registra la lectura general y los cargos fijos del recibo real de la eléctrica.</li>
                            <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />El consumo y los totales se calculan solos mientras escribes.</li>
                            <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Luego, en Liquidación, este total se reparte entre las unidades según su consumo.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </AdminLayout>
    );
}
