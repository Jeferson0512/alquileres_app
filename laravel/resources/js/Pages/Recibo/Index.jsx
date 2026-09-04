import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Copy } from 'lucide-react';
import { useEffect } from 'react';

// Cambiar de periodo navega con preserveState (para no perder scroll/UI),
// así que esta instancia del componente sigue montada -- pero useForm() solo
// lee su valor inicial una vez. Sin remount, el formulario se queda pegado
// en los datos del periodo anterior aunque lleguen props nuevas del server.
// index.jsx delega en este componente con key={periodo.id_periodo} para
// forzar el remount y que useForm se re-inicialice con el recibo correcto.
function ReciboForm({ periodo, periodos, recibo, tieneAnterior }) {
    const { errors, auth } = usePage().props;
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

    // Replica autoCalcular() de public/assets/js/modules/recibo.js -- misma
    // formula real, nada nuevo: consumo = lectura actual - anterior; energia
    // = consumo * precio; subtotal = energia + cargos fijos; IGV = 18% del
    // subtotal; total = subtotal + IGV + electrificacion + redondeos.
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

    const campo = (key, label, step = '0.01') => (
        <div>
            <InputLabel htmlFor={key} value={label} />
            <TextInput
                id={key}
                type="number"
                step={step}
                value={data[key]}
                disabled={!editable}
                onChange={(e) => setData(key, parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full disabled:bg-surface-2"
            />
            <InputError className="mt-1" message={errors[key]} />
        </div>
    );

    const consumoKwh = Math.max(data.lectura_actual_general - data.lectura_anterior_general, 0);
    const money = (v) => `S/ ${Number(v).toFixed(2)}`;

    return (
        <AdminLayout
            title="Recibo de luz"
            description={`${periodo.mes}/${periodo.anio} · suministro ${data.numero_suministro || '—'}`}
            periodo={periodo}
            periodos={periodos}
            onPeriodoChange={cambiarPeriodo}
            actions={editable && (
                <div className="flex gap-2">
                    {tieneAnterior && (
                        <SecondaryButton type="button" onClick={copiarAnterior}>
                            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar desde mes anterior
                        </SecondaryButton>
                    )}
                    <PrimaryButton type="submit" form="recibo-form" disabled={processing}>Guardar recibo del mes</PrimaryButton>
                </div>
            )}
        >
            <Head title="Recibo de luz" />

            {errors?.general && (
                <div className="mb-4 rounded-lg bg-danger-tint px-4 py-3 text-sm text-danger">{errors.general}</div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[13px] border border-primary-dark bg-gradient-to-br from-primary-dark to-primary p-5 text-white shadow-sm">
                <div>
                    <p className="text-xs uppercase tracking-wide text-white/70">Total del recibo</p>
                    <p className="mt-1 font-mono text-3xl font-bold">{money(data.total_recibo)}</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-xs font-semibold">{recibo.numero_recibo}</span>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-2 overflow-x-auto rounded-[13px] border border-border bg-surface p-3 text-xs shadow-sm">
                <span className="shrink-0 rounded-md bg-surface-2 px-2.5 py-1.5 font-mono font-medium text-muted">Lect. anterior {Number(data.lectura_anterior_general).toFixed(1)}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                <span className="shrink-0 rounded-md bg-surface-2 px-2.5 py-1.5 font-mono font-medium text-muted">Lect. actual {Number(data.lectura_actual_general).toFixed(1)}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                <span className="shrink-0 rounded-md bg-surface-2 px-2.5 py-1.5 font-mono font-medium text-muted">{consumoKwh.toFixed(1)} kWh × S/ {Number(data.precio_kwh).toFixed(4)}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                <span className="shrink-0 rounded-md bg-surface-2 px-2.5 py-1.5 font-medium text-muted">+ cargos fijos</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                <span className="shrink-0 rounded-md bg-surface-2 px-2.5 py-1.5 font-medium text-muted">+ IGV 18%</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                <span className="shrink-0 rounded-md bg-primary-light px-2.5 py-1.5 font-mono font-bold text-primary-dark">{money(data.total_recibo)}</span>
            </div>

            <form id="recibo-form" onSubmit={submit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-[13px] border border-border bg-surface p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-ink">Datos del recibo</h3>
                        <span className="text-xs text-muted-2">se recalcula al tipear</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <InputLabel htmlFor="numero_suministro" value="Nº suministro" />
                            <TextInput id="numero_suministro" value={data.numero_suministro} disabled={!editable} onChange={(e) => setData('numero_suministro', e.target.value)} className="mt-1 block w-full disabled:bg-surface-2" />
                            <InputError className="mt-1" message={errors.numero_suministro} />
                        </div>
                        {campo('precio_kwh', 'Precio kWh', '0.0001')}
                        {campo('lectura_anterior_general', 'Lectura anterior')}
                        {campo('lectura_actual_general', 'Lectura actual')}
                        {campo('cargo_fijo', 'Cargo fijo')}
                        {campo('mant_reposicion', 'Mant. y reposición')}
                        {campo('alumbrado_publico', 'Alumbrado público')}
                        {campo('electrificacion_rural', 'Electrificación rural')}
                        {campo('ajuste_redondeo_anterior', 'Ajuste redondeo anterior')}
                        {campo('ajuste_redondeo_actual', 'Ajuste redondeo actual')}
                        <div>
                            <InputLabel htmlFor="fecha_emision" value="Fecha emisión" />
                            <TextInput id="fecha_emision" type="date" value={data.fecha_emision ?? ''} disabled={!editable} onChange={(e) => setData('fecha_emision', e.target.value)} className="mt-1 block w-full disabled:bg-surface-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="fecha_vencimiento" value="Fecha vencimiento" />
                            <TextInput id="fecha_vencimiento" type="date" value={data.fecha_vencimiento ?? ''} disabled={!editable} onChange={(e) => setData('fecha_vencimiento', e.target.value)} className="mt-1 block w-full disabled:bg-surface-2" />
                        </div>
                        <div className="col-span-2">
                            <InputLabel htmlFor="observacion" value="Observación" />
                            <TextInput id="observacion" value={data.observacion ?? ''} disabled={!editable} onChange={(e) => setData('observacion', e.target.value)} className="mt-1 block w-full disabled:bg-surface-2" />
                        </div>
                    </div>
                </div>

                <div className="rounded-[13px] border border-border bg-surface p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-ink">Desglose calculado</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted">Consumo ({consumoKwh.toFixed(1)} kWh)</span><span className="font-mono font-medium text-ink">{money(data.consumo_energia)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Cargo fijo</span><span className="font-mono font-medium text-ink">{money(data.cargo_fijo)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Mant. y reposición</span><span className="font-mono font-medium text-ink">{money(data.mant_reposicion)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Alumbrado público</span><span className="font-mono font-medium text-ink">{money(data.alumbrado_publico)}</span></div>
                        <div className="flex justify-between border-t border-border pt-2"><span className="text-muted">Subtotal</span><span className="font-mono font-medium text-ink">{money(data.subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">IGV (18%)</span><span className="font-mono font-medium text-ink">{money(data.igv)}</span></div>
                        <div className="flex justify-between"><span className="text-muted">Electrificación rural</span><span className="font-mono font-medium text-ink">{money(data.electrificacion_rural)}</span></div>
                        {(Number(data.ajuste_redondeo_anterior) !== 0 || Number(data.ajuste_redondeo_actual) !== 0) && (
                            <div className="flex justify-between"><span className="text-muted">Ajustes de redondeo</span><span className="font-mono font-medium text-ink">{money(Number(data.ajuste_redondeo_anterior) + Number(data.ajuste_redondeo_actual))}</span></div>
                        )}
                        <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-ink"><span>Total del recibo</span><span className="font-mono">{money(data.total_recibo)}</span></div>
                    </div>

                    <div className="mt-5 rounded-lg bg-surface-2 p-3 text-xs text-muted">
                        Este total se reparte entre las unidades según su consumo en <strong className="text-ink">Liquidación</strong> — acá solo se registra el recibo real de la eléctrica.
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

export default function Index({ periodo, periodos, recibo, tieneAnterior }) {
    return <ReciboForm key={periodo.id_periodo} periodo={periodo} periodos={periodos} recibo={recibo} tieneAnterior={tieneAnterior} />;
}
