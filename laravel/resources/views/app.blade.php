<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- Portal de Inquilinos: solo ahi, nunca en el panel admin --}}
        @if(str_starts_with(request()->path(), 'portal'))
            {{-- Serif para el monto del Hero -- mismo look del artifact "Mi Alquiler" --}}
            <link href="https://fonts.bunny.net/css?family=fraunces:500i,600&display=swap" rel="stylesheet" />

            <link rel="manifest" href="/manifest.json">
            <meta name="theme-color" content="#2563EB">
            <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <meta name="apple-mobile-web-app-status-bar-style" content="default">
            <meta name="apple-mobile-web-app-title" content="Mi Alquiler">

            {{-- Aplica el tema ANTES del primer paint -- si esto corriera despues
                 de que React monte, se ve un flash del tema equivocado. Prioridad:
                 preferencia guardada > prefers-color-scheme del sistema. --}}
            <script>
                (function () {
                    var saved = localStorage.getItem('portal-theme');
                    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', dark);
                })();
            </script>
            <script>
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function () {
                        navigator.serviceWorker.register('/sw.js', { scope: '/portal' }).catch(function () {
                            // Silencioso a proposito: sin service worker la app sigue
                            // funcionando normal, solo sin cache offline ni instalacion.
                        });
                    });
                }
            </script>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
