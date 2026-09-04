import { Check, X } from 'lucide-react';

// Feedback en vivo de si "Confirmar contraseña" coincide con la nueva --
// no espera al submit ni al error del backend. Sin mensaje mientras el
// campo de confirmación está vacío (no tiene sentido decir "no coincide"
// contra nada todavía).
export default function PasswordMatchHint({ password, confirmation }) {
    if (!confirmation) return null;
    const coincide = password === confirmation;

    return (
        <p className={`mt-2 flex items-center gap-1.5 text-xs transition-colors ${coincide ? 'text-success' : 'text-danger'}`}>
            {coincide ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
            {coincide ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
        </p>
    );
}
