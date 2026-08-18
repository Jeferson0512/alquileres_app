<x-error-page
    code="429"
    icon="alert"
    tone="warning"
    heading="Demasiados intentos"
    message="Hiciste varios intentos seguidos en poco tiempo. Esperá un momento y volvé a intentarlo."
>
    <a href="/dashboard" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
        Volver al Dashboard
    </a>
</x-error-page>
