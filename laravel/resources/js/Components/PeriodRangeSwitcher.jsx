import Dropdown from '@/Components/Dropdown';
import MESES from '@/lib/meses';
import { Calendar, ChevronDown } from 'lucide-react';

const ESTADO_PERIODO_STYLES = {
    ABIERTO: 'bg-primary-light text-primary-dark',
    CERRADO: 'bg-surface-3 text-muted',
    ANULADO: 'bg-danger-tint text-danger',
};

function PeriodoPicker({ periodo, periodos, onChange }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button type="button" className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {MESES[periodo.mes - 1]} {periodo.anio}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-2" />
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="left" width="56" contentClasses="bg-surface py-1.5">
                <div className="max-h-72 overflow-y-auto">
                    {periodos.map((p) => {
                        const active = p.id_periodo === periodo.id_periodo;
                        return (
                            <button
                                key={p.id_periodo}
                                type="button"
                                onClick={() => onChange(p.id_periodo)}
                                className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-sm ${active ? 'bg-primary-light text-primary-dark' : 'text-ink hover:bg-surface-2'}`}
                            >
                                <span>{MESES[p.mes - 1]} {p.anio}</span>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ESTADO_PERIODO_STYLES[p.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {p.estado}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}

export default function PeriodRangeSwitcher({ periodos, desde, hasta, onChange }) {
    const periodoDesde = periodos.find((p) => p.id_periodo === desde);
    const periodoHasta = periodos.find((p) => p.id_periodo === hasta);
    if (!periodoDesde || !periodoHasta) return null;

    return (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Calendar className="h-4 w-4 shrink-0 text-muted-2" />
            <PeriodoPicker periodo={periodoDesde} periodos={periodos} onChange={(id) => onChange(id, hasta)} />
            <span className="text-sm text-muted-2">→</span>
            <PeriodoPicker periodo={periodoHasta} periodos={periodos} onChange={(id) => onChange(desde, id)} />
        </div>
    );
}
