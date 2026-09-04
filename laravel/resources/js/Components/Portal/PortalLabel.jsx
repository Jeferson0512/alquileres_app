export default function PortalLabel({ value, className = '', children, ...props }) {
    return (
        <label
            {...props}
            className={'block text-xs font-medium text-gray-500 dark:text-slate-400 ' + className}
        >
            {value ? value : children}
        </label>
    );
}
