import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted dark:border-slate-800 dark:text-slate-400">
            <span>
                Mostrando {meta.from ?? 0}–{meta.to ?? 0} de {meta.total}
            </span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                    className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                <span className="px-1">
                    Página {meta.current_page} de {meta.last_page}
                </span>
                <button
                    type="button"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                    className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-medium hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:hover:bg-slate-800"
                >
                    Siguiente <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
