import { Check, X } from 'lucide-react';

// Debe reflejar exactamente Password::defaults() en AppServiceProvider::boot().
const REQUISITOS = [
    { key: 'length', label: 'Al menos 8 caracteres', test: (v) => v.length >= 8 },
    { key: 'mixed', label: 'Una mayúscula y una minúscula', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
    { key: 'number', label: 'Al menos un número', test: (v) => /[0-9]/.test(v) },
];

export default function PasswordRequirements({ password, className = '' }) {
    return (
        <ul className={`mt-2 space-y-1 text-xs ${className}`}>
            {REQUISITOS.map((requisito) => {
                const cumple = requisito.test(password);
                return (
                    <li
                        key={requisito.key}
                        className={`flex items-center gap-1.5 transition-colors ${cumple ? 'text-success' : 'text-danger'}`}
                    >
                        {cumple ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                        {requisito.label}
                    </li>
                );
            })}
        </ul>
    );
}
