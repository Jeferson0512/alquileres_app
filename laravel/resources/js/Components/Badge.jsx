const VARIANTS = {
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
    info: 'bg-blue-50 text-primary',
    gray: 'bg-gray-100 text-gray-500',
};

export default function Badge({ variant = 'gray', children }) {
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant] ?? VARIANTS.gray}`}>
            {children}
        </span>
    );
}
