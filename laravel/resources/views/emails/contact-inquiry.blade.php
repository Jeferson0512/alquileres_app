<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #0f172a; max-width: 560px; margin: 0 auto;">
    <h2 style="color: #2563EB;">Nueva consulta desde el landing page</h2>

    <p><strong>Nombre:</strong> {{ $inquiry->name }}</p>
    @if($inquiry->email)
        <p><strong>Email:</strong> {{ $inquiry->email }}</p>
    @endif
    @if($inquiry->phone)
        <p><strong>Teléfono:</strong> {{ $inquiry->phone }}</p>
    @endif
    @if($inquiry->unidad)
        <p><strong>Unidad de interés:</strong> {{ $inquiry->unidad->codigo_unidad }} — {{ $inquiry->unidad->nombre_unidad }}</p>
    @endif

    <p><strong>Mensaje:</strong></p>
    <p style="background: #F8FAFC; padding: 12px; border-radius: 8px;">{{ $inquiry->message }}</p>

    <p style="color: #64748b; font-size: 13px;">Revisa el detalle completo en el panel: Usuarios &gt; Consultas.</p>
</body>
</html>
