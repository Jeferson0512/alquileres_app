import Swal from 'sweetalert2';

/**
 * Reemplaza al prompt() nativo del navegador para pedir un texto corto
 * (ej. motivo de una anulación) antes de continuar. Devuelve la Promise
 * con el string ingresado, o null si se canceló / se dejó vacío.
 */
export default async function promptDialog({ title, inputLabel, confirmText = 'Confirmar' }) {
    const { value } = await Swal.fire({
        title,
        input: 'text',
        inputLabel,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#64748B',
        inputValidator: (v) => (!v || !v.trim() ? 'Este campo es obligatorio' : undefined),
    });

    return value ? value.trim() : null;
}
