import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            // Ademas del entry principal de la SPA, `resources/css/app.css`
            // como entry propio -- lo usan las vistas de error (403/404/419/
            // 429/500/503) y "en construccion", que son Blade puro (no React/
            // Inertia) y necesitan Tailwind sin arrancar toda la app.
            input: ['resources/js/app.jsx', 'resources/css/app.css'],
            refresh: true,
        }),
        react(),
    ],
});
