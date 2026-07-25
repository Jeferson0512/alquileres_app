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

const toast = {
    success: (message) => message && Toast.fire({ icon: 'success', title: message }),
    error: (message) => message && Toast.fire({ icon: 'error', title: message }),
    warning: (message) => message && Toast.fire({ icon: 'warning', title: message }),
    info: (message) => message && Toast.fire({ icon: 'info', title: message }),
};

export default toast;
