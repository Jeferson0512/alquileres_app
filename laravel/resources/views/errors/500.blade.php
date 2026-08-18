<x-error-page
    code="500"
    icon="alert"
    tone="danger"
    heading="Algo falló de nuestro lado"
    message="Ocurrió un error inesperado. Ya quedó registrado en el sistema — probá de nuevo en un momento, y si sigue pasando avisá al administrador."
>
    <a href="/dashboard" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
        Volver al Dashboard
    </a>
</x-error-page>
