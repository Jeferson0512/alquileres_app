@php
    $mensaje = $exception->getMessage() ?: null;
@endphp
<x-error-page
    code="503"
    icon="wrench"
    tone="primary"
    heading="En mantenimiento"
    :message="$mensaje ?? 'Estamos actualizando el sistema. Volvé a intentarlo en unos minutos.'"
>
    <button type="button" onclick="location.reload()" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
        Reintentar
    </button>
</x-error-page>
