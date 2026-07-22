import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Index({ config }) {
    const { flash, auth } = usePage().props;
    const puede = auth.permissions.includes('config_cobranza.editar');

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

    const submit = (e) => {
        e.preventDefault();
        put(route('config-cobranza.update'));
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

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-success">{flash.success}</div>
            )}

            <form onSubmit={submit} className="max-w-3xl space-y-6">
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
        </AdminLayout>
    );
}
