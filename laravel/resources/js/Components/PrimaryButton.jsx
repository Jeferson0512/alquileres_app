export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out hover:bg-primary-dark focus:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:bg-primary-dark ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
