import Swal from 'sweetalert2';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (el) => {
        el.addEventListener('mouseenter', Swal.stopTimer);
        el.addEventListener('mouseleave', Swal.resumeTimer);
    },
});

// Colores exactos de la paleta de marca (docs/requerimientos-proyecto.md, S7)
// -- SweetAlert2 no lee Tailwind, así que van en hex literal.
const toast = {
    success: (message) => message && Toast.fire({ icon: 'success', title: message, iconColor: '#16A34A' }),
    error: (message) => message && Toast.fire({ icon: 'error', title: message, iconColor: '#DC2626' }),
    warning: (message) => message && Toast.fire({ icon: 'warning', title: message, iconColor: '#D97706' }),
    info: (message) => message && Toast.fire({ icon: 'info', title: message, iconColor: '#2563EB' }),
};

export default toast;
