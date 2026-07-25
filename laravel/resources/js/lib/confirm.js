import Swal from 'sweetalert2';

/**
 * Reemplaza al confirm() nativo del navegador para acciones destructivas
 * o de cambio de estado. Devuelve una Promise<boolean>.
 */
export default function confirmDialog({ title, text, confirmText = 'Confirmar', danger = true }) {
    return Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: danger ? '#DC2626' : '#2563EB',
        cancelButtonColor: '#6B7280',
        reverseButtons: true,
        focusCancel: true,
    }).then((result) => result.isConfirmed);
}
