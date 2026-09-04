export default function StatusTabs({ value, options, onChange }) {
    return (
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1 text-sm">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                        value === opt.value ? 'bg-primary-light text-primary-dark' : 'text-muted hover:bg-surface-2'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
