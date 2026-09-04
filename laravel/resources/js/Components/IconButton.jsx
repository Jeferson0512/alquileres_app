const VARIANTS = {
    default: 'text-muted hover:text-ink',
    primary: 'text-primary hover:text-primary-dark',
    danger: 'text-danger hover:opacity-75',
    success: 'text-success hover:opacity-75',
};

export default function IconButton({ icon: Icon, label, onClick, variant = 'default', type = 'button', disabled = false }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            title={label}
            aria-label={label}
            className={`inline-flex rounded-md p-1.5 transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant] ?? VARIANTS.default}`}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}
