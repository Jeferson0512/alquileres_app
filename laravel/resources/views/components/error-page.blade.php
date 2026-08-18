@props([
    'code' => '',
    'heading' => 'Algo no salió como esperábamos',
    'message' => '',
    'icon' => 'alert',
    'tone' => 'primary',
])

@php
    $tones = [
        'primary' => ['bg' => 'bg-primary-light', 'ic' => 'text-primary-dark', 'code' => 'text-primary'],
        'warning' => ['bg' => 'bg-warning-tint', 'ic' => 'text-warning', 'code' => 'text-warning'],
        'danger' => ['bg' => 'bg-danger-tint', 'ic' => 'text-danger', 'code' => 'text-danger'],
    ];
    $t = $tones[$tone] ?? $tones['primary'];

    $icons = [
        'search' => '<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="m21 21-4.3-4.3"/>',
        'lock' => '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
        'alert' => '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
        'wrench' => '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-7 7 3 3 7-7a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2Z"/>',
        'refresh' => '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    ];
@endphp

<!doctype html>
<html lang="es" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $code }} — Alquileres App</title>
    @vite(['resources/css/app.css'])
</head>
<body class="flex h-full min-h-screen flex-col items-center justify-center bg-surface px-4 py-16">
    <div class="w-full max-w-md text-center">
        <div class="mb-8 flex items-center justify-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-sm font-extrabold text-white">A</span>
            <span class="text-lg font-semibold text-primary">Alquileres App</span>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl {{ $t['bg'] }}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7 {{ $t['ic'] }}">
                    {!! $icons[$icon] ?? $icons['alert'] !!}
                </svg>
            </div>

            @if($code)
                <p class="mb-1 font-mono text-xs font-bold uppercase tracking-widest {{ $t['code'] }}">Error {{ $code }}</p>
            @endif
            <h1 class="mb-2 text-xl font-bold text-gray-900">{{ $heading }}</h1>
            <p class="mb-6 text-sm leading-relaxed text-gray-500">{{ $message }}</p>

            {{ $slot }}
        </div>

        <p class="mt-6 text-xs text-gray-400">Si el problema sigue, avisale al administrador del sistema.</p>
    </div>
</body>
</html>
