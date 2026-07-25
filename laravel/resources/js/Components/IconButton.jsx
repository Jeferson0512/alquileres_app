const VARIANTS = {
    default: 'text-gray-500 hover:text-gray-700',
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
            className={`inline-flex rounded-md p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant] ?? VARIANTS.default}`}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}
