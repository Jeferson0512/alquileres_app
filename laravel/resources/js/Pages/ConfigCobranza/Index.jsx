import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Index({ config }) {
    const { auth } = usePage().props;
    const puede = auth.permissions.includes('config_cobranza.editar');
    const [qrError, setQrError] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        monto_minimo_luz: config.monto_minimo_luz,
        minimo_kwh_aviso: config.minimo_kwh_aviso,
        yape_titular: config.yape_titular ?? '',
        yape_numero: config.yape_numero ?? '',
        yape_qr: config.yape_qr ?? '',
        banco_nombre: config.banco_nombre ?? '',
        banco_titular: config.banco_titular ?? '',
        banco_cuenta: config.banco_cuenta ?? '',
        banco_cci: config.banco_cci ?? '',
        mensaje_base: config.mensaje_base ?? '',
    });

    const qrInputRef = useRef(null);
    const qrForm = useForm({ qr: null });

    const submit = (e) => {
        e.preventDefault();
        put(route('config-cobranza.update'));
    };

    const submitQr = (e) => {
        e.preventDefault();
        if (!qrForm.data.qr) return;
        qrForm.post(route('config-cobranza.qr'), {
            forceFormData: true,
            onSuccess: () => {
                qrForm.reset('qr');
                if (qrInputRef.current) qrInputRef.current.value = '';
            },
        });
    };

    const field = (key, label, type = 'text') => (
        <div>
            <label className="block text-xs font-medium text-gray-500">{label}</label>
            <input
                type={type}
                value={data[key]}
                disabled={!puede}
                onChange={(e) => setData(key, e.target.value)}
                className="mt-1 w-full rounded-md border-gray-300 text-sm disabled:bg-gray-50"
            />
            {errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>}
        </div>
    );

    return (
        <AdminLayout title="Config. cobranza">
            <Head title="Config. cobranza" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                <form onSubmit={submit} className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Umbrales de luz</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('monto_minimo_luz', 'Monto mínimo de luz (S/)', 'number')}
                            {field('minimo_kwh_aviso', 'kWh mínimo de aviso', 'number')}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Yape</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('yape_titular', 'Titular')}
                            {field('yape_numero', 'Número')}
                        </div>

                        {puede && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <label className="block text-xs font-medium text-gray-500">QR de pago</label>
                                <div className="mt-1 flex items-center gap-3">
                                    <input
                                        ref={qrInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(e) => qrForm.setData('qr', e.target.files?.[0] ?? null)}
                                        className="block flex-1 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-primary-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-dark"
                                    />
                                    <button
                                        type="button"
                                        onClick={submitQr}
                                        disabled={qrForm.processing || !qrForm.data.qr}
                                        className="shrink-0 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                                    >
                                        Subir QR
                                    </button>
                                </div>
                                {qrForm.errors.qr && <p className="mt-1 text-xs text-danger">{qrForm.errors.qr}</p>}
                                <p className="mt-1 text-xs text-gray-400">PNG, JPG o WEBP, máx. 5 MB. Es el mismo QR que verán todos los inquilinos en su portal.</p>
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Transferencia bancaria</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {field('banco_nombre', 'Banco')}
                            {field('banco_titular', 'Titular')}
                            {field('banco_cuenta', 'Cuenta')}
                            {field('banco_cci', 'CCI')}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-gray-800">Mensaje base para avisos</h3>
                        {field('mensaje_base', 'Mensaje')}
                    </div>

                    {puede && (
                        <button type="submit" disabled={processing} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                            Guardar
                        </button>
                    )}
                </form>

                <aside className="space-y-4">
                    <section className="rounded-lg border border-gray-200 bg-gradient-to-br from-surface-dark to-primary-dark p-5 text-white">
                        <p className="text-xs uppercase tracking-wide text-white/70">Así lo verá el inquilino</p>

                        <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/10 p-3">
                            {config.yape_qr && !qrError ? (
                                <img
                                    src={`/storage/${config.yape_qr}`}
                                    alt="QR de Yape"
                                    onError={() => setQrError(true)}
                                    className="h-16 w-16 shrink-0 rounded-md bg-white object-contain p-1"
                                />
                            ) : (
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-white/10 text-center text-[10px] text-white/50">
                                    {config.yape_qr ? 'QR no disponible, vuelve a subirlo' : 'Sin QR'}
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-white/60">Yape</p>
                                <p className="font-semibold">{data.yape_titular || 'Sin configurar'}</p>
                                <p className="text-sm text-white/80">{data.yape_numero || '—'}</p>
                            </div>
                        </div>

                        <div className="mt-3 rounded-lg bg-white/10 p-3">
                            <p className="text-xs text-white/60">Transferencia</p>
                            <p className="font-semibold">{data.banco_nombre || 'Sin configurar'}</p>
                            <p className="text-xs text-white/80">Titular: {data.banco_titular || '—'}</p>
                            <p className="text-xs text-white/80">Cuenta: {data.banco_cuenta || '—'}</p>
                            <p className="text-xs text-white/80">CCI: {data.banco_cci || '—'}</p>
                        </div>

                        {data.mensaje_base && (
                            <p className="mt-3 text-xs italic text-white/70">"{data.mensaje_base}"</p>
                        )}
                    </section>

                    <section className="rounded-lg border border-gray-200 bg-white p-5">
                        <h3 className="mb-2 text-sm font-semibold text-gray-800">¿Dónde se usa esto?</h3>
                        <ul className="space-y-2 text-xs text-gray-500">
                            <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />Se muestra en el aviso de cobro que le compartes a cada inquilino.</li>
                            <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />"kWh mínimo de aviso" oculta el consumo si es muy bajo, para no alarmar sin motivo.</li>
                            <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />"Monto mínimo de luz" agrega un ajuste si el cobro de luz calculado queda por debajo de este piso.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </AdminLayout>
    );
}
