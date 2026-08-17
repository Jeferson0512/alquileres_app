<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>{{ $folio ?? 'Recibo' }}</title>
    <style>
        @include('portal._recibo-estilos')
    </style>
</head>
<body>
    @include('portal._recibo-contenido')
</body>
</html>
