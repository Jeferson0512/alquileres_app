import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight, Building2, CheckCircle2, Clock, Home as HomeIcon,
    MapPin, MessageCircle, Send, ShieldCheck, Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const TIPO_LABELS = {
    CUARTO: 'Cuarto', MINI_DPTO: 'Mini departamento', DEPARTAMENTO: 'Departamento',
    LOCAL: 'Local', DEPOSITO: 'Depósito', OTRO: 'Otro',
};
const TIPO_ICONS = { CUARTO: HomeIcon, MINI_DPTO: Building2, DEPARTAMENTO: Building2 };

function money(value) {
    return `S/ ${Number(value ?? 0).toFixed(0)}`;
}

/** Revela una sección con fade-in-up la primera vez que entra en el viewport. */
function useReveal() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.15 },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, visible];
}

function Reveal({ as: Tag = 'div', className = '', delay = 0, children }) {
    const [ref, visible] = useReveal();
    return (
        <Tag
            ref={ref}
            className={`${className} ${visible ? 'animate-fade-in-up' : 'opacity-0'}`}
            style={{ animationDelay: visible ? `${delay}ms` : undefined }}
        >
            {children}
        </Tag>
    );
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

    const consultarUnidad = (idUnidad) => {
        setData('unit_id', String(idUnidad));
        document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-surface">
            <Head title="Alquileres App — Habitaciones y departamentos" />

            {/* Navbar */}
            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-surface-dark/70 backdrop-blur-lg">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <span className="flex items-center gap-2 text-lg font-bold text-white">
                        <Sparkles className="h-5 w-5 text-primary" strokeWidth={2.5} />
                        Alquileres App
                    </span>
                    <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 sm:flex">
                        <a href="#unidades" className="hover:text-white">Unidades</a>
                        <a href="#contacto" className="hover:text-white">Contacto</a>
                    </nav>
                    <Link href={route('login')} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark">
                        Iniciar sesión
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-surface-dark px-6 pt-20">
                <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle,#334155_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="absolute -left-24 top-1/4 -z-10 h-72 w-72 animate-blob rounded-full bg-primary/40 blur-3xl" />
                <div className="absolute right-0 top-1/3 -z-10 h-96 w-96 animate-blob rounded-full bg-blue-400/20 blur-3xl [animation-delay:2s]" />
                <div className="absolute bottom-0 left-1/3 -z-10 h-72 w-72 animate-blob rounded-full bg-indigo-500/20 blur-3xl [animation-delay:4s]" />

                <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                    <Reveal>
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary-light backdrop-blur">
                            <Sparkles className="h-3.5 w-3.5" /> {unidadesDisponibles.length} unidades disponibles ahora
                        </span>
                        <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Tu próximo hogar,{' '}
                            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary-light bg-clip-text text-transparent">
                                a un mensaje de distancia
                            </span>
                        </h1>
                        <p className="mt-5 max-w-lg text-lg text-white/70">
                            Cuartos y departamentos amoblados, con atención directa y respuesta rápida. Cuéntanos qué buscas y coordinamos tu visita.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <a href="#unidades" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark">
                                Ver unidades disponibles
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </a>
                            <a href="#contacto" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                                <MessageCircle className="h-4 w-4" /> Escríbenos
                            </a>
                        </div>
                    </Reveal>

                    <Reveal delay={150} className="grid grid-cols-2 gap-4">
                        {[
                            { icon: ShieldCheck, label: 'Contratos claros', desc: 'Sin sorpresas en el recibo' },
                            { icon: Clock, label: 'Respuesta rápida', desc: 'Te contactamos en el día' },
                            { icon: HomeIcon, label: 'Listo para vivir', desc: 'Unidades amobladas' },
                            { icon: MapPin, label: 'Buena ubicación', desc: 'Cerca de todo lo que necesitas' },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg transition hover:bg-white/10">
                                <Icon className="h-6 w-6 text-primary-light" />
                                <p className="mt-3 text-sm font-semibold text-white">{label}</p>
                                <p className="mt-1 text-xs text-white/60">{desc}</p>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* Unidades disponibles */}
            <section id="unidades" className="mx-auto max-w-6xl px-6 py-20">
                <Reveal className="mb-10 text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Disponibilidad</span>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900">Unidades disponibles</h2>
                    <p className="mt-2 text-gray-500">Esto es lo que hay libre hoy mismo — se actualiza en tiempo real.</p>
                </Reveal>

                {unidadesDisponibles.length === 0 ? (
                    <Reveal className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                        No hay unidades disponibles por el momento — escríbenos y te avisamos apenas se libere una.
                    </Reveal>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {unidadesDisponibles.map((u, i) => {
                            const Icon = TIPO_ICONS[u.tipo_unidad] ?? HomeIcon;
                            return (
                                <Reveal key={u.id_unidad} delay={i * 80} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-light/60 blur-2xl transition group-hover:bg-primary-light" />
                                    <div className="relative flex items-center justify-between">
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-success">Disponible</span>
                                    </div>
                                    <p className="relative mt-4 text-xs font-medium uppercase tracking-wide text-gray-400">{TIPO_LABELS[u.tipo_unidad] ?? u.tipo_unidad} · Piso {u.piso}</p>
                                    <h3 className="relative text-lg font-bold text-gray-900">{u.nombre_unidad}</h3>
                                    <p className="relative text-xs text-gray-400">Unidad {u.codigo_unidad}</p>
                                    <div className="relative mt-4 flex items-end justify-between border-t border-gray-100 pt-4">
                                        <div>
                                            <p className="text-2xl font-extrabold text-primary">{money(u.tarifa_alquiler_base)}</p>
                                            <p className="text-xs text-gray-400">por mes</p>
                                        </div>
                                        <button type="button" onClick={() => consultarUnidad(u.id_unidad)} className="text-sm font-semibold text-primary hover:text-primary-dark">
                                            Consultar →
                                        </button>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Contacto */}
            <section id="contacto" className="relative overflow-hidden bg-surface-dark px-6 py-20">
                <div className="absolute -left-32 bottom-0 -z-0 h-80 w-80 animate-blob rounded-full bg-primary/20 blur-3xl [animation-delay:1s]" />

                <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                    <Reveal>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-light">Contacto</span>
                        <h2 className="mt-2 text-3xl font-bold text-white">¿Te interesa? Escríbenos</h2>
                        <p className="mt-3 text-white/70">
                            Cuéntanos qué unidad te llama la atención y coordinamos una visita. Respondemos rápido.
                        </p>
                        <ul className="mt-6 space-y-3 text-sm text-white/80">
                            {['Visitas coordinadas a tu horario', 'Contratos simples y transparentes', 'Trato directo, sin intermediarios'].map((item) => (
                                <li key={item} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-light" /> {item}
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal delay={150}>
                        {flash?.success && (
                            <div className="mb-4 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-white">{flash.success}</div>
                        )}
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg sm:grid-cols-2 sm:p-8">
                            <div>
                                <label className="block text-xs font-medium text-white/60">Nombre *</label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-white/20 bg-white/10 text-sm text-white placeholder-white/30 focus:border-primary focus:ring-primary" />
                                {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60">Unidad de interés</label>
                                <select value={data.unit_id} onChange={(e) => setData('unit_id', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-white/20 bg-white/10 text-sm text-white focus:border-primary focus:ring-primary">
                                    <option className="text-gray-900" value="">Cualquiera</option>
                                    {unidadesDisponibles.map((u) => (
                                        <option className="text-gray-900" key={u.id_unidad} value={u.id_unidad}>{u.codigo_unidad} — {u.nombre_unidad}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60">Email</label>
                                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-white/20 bg-white/10 text-sm text-white placeholder-white/30 focus:border-primary focus:ring-primary" />
                                {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-white/60">Teléfono</label>
                                <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-white/20 bg-white/10 text-sm text-white placeholder-white/30 focus:border-primary focus:ring-primary" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-white/60">Mensaje *</label>
                                <textarea rows={3} value={data.message} onChange={(e) => setData('message', e.target.value)}
                                    className="mt-1 w-full rounded-lg border-white/20 bg-white/10 text-sm text-white placeholder-white/30 focus:border-primary focus:ring-primary" />
                                {errors.message && <p className="mt-1 text-xs text-red-300">{errors.message}</p>}
                            </div>
                            <p className="text-xs text-white/40 sm:col-span-2">Déjanos al menos un email o un teléfono para poder contactarte.</p>
                            <div className="sm:col-span-2">
                                <button type="submit" disabled={processing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:opacity-50 sm:w-auto">
                                    <Send className="h-4 w-4" /> Enviar consulta
                                </button>
                            </div>
                        </form>
                    </Reveal>
                </div>
            </section>

            <footer className="border-t border-gray-200 bg-white px-6 py-8 text-center text-xs text-gray-400">
                Alquileres App
            </footer>
        </div>
    );
}
