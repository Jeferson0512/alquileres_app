<x-error-page
    code="419"
    icon="clock"
    tone="warning"
    heading="Tu sesión expiró"
    message="Pasó demasiado tiempo desde que abriste esta página. Volvé a intentarlo — tus datos no se guardaron."
>
    <a href="{{ url()->previous() }}" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
        Volver a intentar
    </a>
</x-error-page>
