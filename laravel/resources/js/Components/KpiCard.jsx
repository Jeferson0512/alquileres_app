import { ArrowDown, ArrowUp, Info, Minus } from 'lucide-react';

const TONES = {
    primary: 'bg-primary-light text-primary-dark',
    success: 'bg-success-tint text-success',
    warning: 'bg-warning-tint text-warning',
    danger: 'bg-danger-tint text-danger',
    muted: 'bg-surface-3 text-muted',
    // Unico acento fuera de la paleta de marca -- ya existia en el Dashboard
    // original (Cobro teorico del mes) para distinguirlo de "Luz distribuida"
    // sin sumar un quinto color a la paleta oficial.
    purple: 'bg-purple-100 text-purple-600',
};

const DELTA_STYLES = {
    up: { color: 'text-success', Icon: ArrowUp },
    down: { color: 'text-danger', Icon: ArrowDown },
    flat: { color: 'text-muted-2', Icon: Minus },
};

export default function KpiCard({ label, value, icon: Icon, tone = 'primary', delta, deltaDirection = 'flat', desc }) {
    const deltaStyle = DELTA_STYLES[deltaDirection] ?? DELTA_STYLES.flat;
    const DeltaIcon = deltaStyle.Icon;

    return (
        <article className="rounded-[13px] border border-border bg-surface p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                    <span>{label}</span>
                    {desc && (
                        <span className="group relative inline-flex">
                            <Info tabIndex={0} className="h-3.5 w-3.5 cursor-help normal-case text-muted-2 outline-none hover:text-muted focus:text-muted" />
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 w-44 -translate-x-1/2 rounded-md bg-ink px-2 py-1.5 text-center text-[11px] font-normal normal-case leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                {desc}
                            </span>
                        </span>
                    )}
                </span>
                {Icon && (
                    <span className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg ${TONES[tone] ?? TONES.primary}`}>
                        <Icon className="h-3.5 w-3.5" />
                    </span>
                )}
            </div>
            <p className="font-mono text-[1.32rem] font-semibold tracking-tight text-ink">{value}</p>
            {delta !== undefined && delta !== null && (
                <div className={`mt-1.5 flex items-center gap-1 text-xs font-bold ${deltaStyle.color}`}>
                    <DeltaIcon className="h-3 w-3" />
                    <span>{delta}</span>
                </div>
            )}
        </article>
    );
}
