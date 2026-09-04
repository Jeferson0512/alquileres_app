import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Equivalente a Components/TextInput.jsx pero con soporte real de modo
 * oscuro -- el admin no lo necesita (100% claro a propósito), el Portal sí
 * tiene un toggle real. Mismas clases que ya se repetían sueltas en
 * Portal/Index.jsx y CompletarPerfil.jsx, ahora en un solo lugar.
 */
export default forwardRef(function PortalTextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 '
                + className
            }
            ref={localRef}
        />
    );
});
