const VARIANTS = {
    success: 'bg-green-50 text-success dark:bg-green-400/10',
    warning: 'bg-amber-50 text-warning dark:bg-amber-400/10',
    danger: 'bg-red-50 text-danger dark:bg-red-400/10',
    info: 'bg-blue-50 text-primary dark:bg-blue-400/10 dark:text-blue-400',
    gray: 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400',
};

export default function Badge({ variant = 'gray', children }) {
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANTS[variant] ?? VARIANTS.gray}`}>
            {children}
        </span>
    );
}
