import '../css/app.css';

import logError from '@/lib/logError';
import toast from '@/lib/toast';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

router.on('success', (event) => {
    const flash = event.detail.page.props.flash ?? {};
    toast.success(flash.success);
    toast.error(flash.error);
    toast.warning(flash.warning);
    toast.info(flash.info);
});

// JS no controlado (excepciones fuera de un try/catch, promesas
// rechazadas sin .catch) -- sin esto, esos errores solo aparecían en la
// consola del navegador del usuario y nunca llegaban a nosotros.
window.addEventListener('error', (event) => {
    logError(event.error ?? event.message, { type: 'window.onerror' });
});
window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { type: 'unhandledrejection' });
});

// Excepciones JS lanzadas durante una visita Inertia.
router.on('exception', (event) => {
    logError(event.detail.exception, { type: 'inertia.exception' });
});

// El servidor respondió algo que no es una respuesta Inertia válida -- el
// caso típico es una página de error de Laravel (500/404 en HTML crudo)
// como la que se ve cuando un endpoint revienta fuera del ciclo normal de
// Inertia. Sin esto, ese error solo quedaba visible en la pantalla del
// usuario y nunca llegaba a nuestros logs.
router.on('invalid', (event) => {
    const response = event.detail.response;
    logError(`Respuesta no válida de Inertia (status ${response?.status})`, {
        type: 'inertia.invalid',
        status: response?.status,
        requestUrl: response?.config?.url,
    });
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
