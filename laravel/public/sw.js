// Service worker del Portal de Inquilinos (Mi Alquiler).
//
// No precachea los bundles de Vite por nombre -- esos archivos cambian de
// hash en cada build, mantener una lista fija se rompe solo. En cambio usa
// un cache "runtime": la primera vez que se pide un archivo estatico se
// guarda una copia; la proxima vez que no haya red, esa copia sirve.
//
// Alcance: solo /portal (ver manifest.json "scope"). El panel admin no
// registra este service worker -- ver app.blade.php.

const CACHE_NAME = 'mi-alquiler-v1';
const RUNTIME_CACHE = 'mi-alquiler-runtime-v1';

const PRECACHE_URLS = [
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
                    .map((key) => caches.delete(key)),
            ))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) {
        return;
    }

    // Nunca cachear llamadas a la API/Inertia -- necesitan datos frescos
    // siempre (saldos, estados de pago). Solo se cachean archivos estaticos.
    if (!url.pathname.startsWith('/build/') && !url.pathname.startsWith('/icons/') && url.pathname !== '/manifest.json') {
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) {
                return cached;
            }

            return fetch(request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
                }
                return response;
            });
        }),
    );
});
