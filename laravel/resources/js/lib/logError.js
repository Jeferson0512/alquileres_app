// Envía errores del navegador a storage/logs/frontend.log (ver
// ClientLogController) -- separado del canal de errores de Laravel para
// poder distinguir "se rompió algo en el navegador del usuario" de "se
// rompió algo en el servidor" sin mezclar ambos en el mismo archivo.
export default function logError(error, context = {}) {
    const payload = {
        message: error?.message ?? String(error),
        stack: error?.stack ?? null,
        url: window.location.href,
        context,
    };

    // sendBeacon no bloquea la navegación si el error ocurre justo antes de
    // salir de la página; fetch(keepalive) es el resto de los casos.
    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon('/log-frontend-error', blob);
            return;
        }
    } catch {
        // sigue al fetch de abajo
    }

    fetch('/log-frontend-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
    }).catch(() => {
        // si ni siquiera esto llega, no hay nada más que hacer del lado del cliente
    });
}
