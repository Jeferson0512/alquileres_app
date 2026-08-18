<x-error-page
    code="403"
    icon="lock"
    tone="warning"
    heading="No tenés permiso para ver esto"
    message="Tu usuario no tiene el permiso necesario para esta sección. Si pensás que deberías tenerlo, pedile a un administrador que revise tu rol."
>
    <a href="/dashboard" class="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
        Volver al Dashboard
    </a>
</x-error-page>
