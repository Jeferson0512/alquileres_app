<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Recibos {{ $anio }}</title>
    <style>
        @include('portal._recibo-estilos')
    </style>
</head>
<body>
    @foreach($recibos as $datos)
        @include('portal._recibo-contenido', $datos)
    @endforeach
</body>
</html>
