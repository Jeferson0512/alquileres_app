<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de ocupación</title>
    <style>@include('reportes._estilos')</style>
</head>
<body>
    @include('reportes._header', ['tituloReporte' => 'Reporte de ocupación', 'eyebrow' => 'Operación · Contratos'])
    @include('reportes._footer', ['tituloReporte' => 'Ocupación'])

    @php $k = $ocupacion['kpis']; @endphp

    @include('reportes._section', ['n' => 1, 'label' => 'Resumen del período'])
    <table class="kv-table">
        <tr>
            <td class="k">Ocupación promedio</td>
            <td class="v">{{ $k['tasa_ocupacion'] }}%</td>
            <td class="k">Tasa de vacancia</td>
            <td class="v">{{ $k['tasa_vacancia'] }}%</td>
        </tr>
        <tr>
            <td class="k">Eventos de contrato</td>
            <td class="v">{{ $k['eventos_total'] }}</td>
            <td class="k">Mayor rotación</td>
            <td class="v">Unidad {{ $k['mayor_rotacion'] }}</td>
        </tr>
    </table>

    @include('reportes._section', ['n' => 2, 'label' => 'Tasa de ocupación por período'])
    <div class="chart-box">
        <div class="chart-title">% de ocupación</div>
        <img src="{{ \App\Support\PdfChart::barrasAgrupadas(
            array_column($ocupacion['serie_periodo'], 'label'),
            [['data' => array_column($ocupacion['serie_periodo'], 'tasa')]],
            ['#16A34A'],
        ) }}" width="460" height="150">
    </div>

    @include('reportes._section', ['n' => 3, 'label' => 'Historial de ocupación por unidad'])
    <table class="data-table">
        <thead>
            <tr><th>Unidad</th><th>Inquilino(s) en el rango</th><th class="num">Días ocupados</th><th class="num">Días del rango</th><th class="num">Ocupación</th></tr>
        </thead>
        <tbody>
            @foreach($ocupacion['timeline'] as $t)
                @php
                    $personas = collect($t['segmentos'])->pluck('persona')->filter()->unique()->values()->all();
                @endphp
                <tr>
                    <td class="mono">{{ $t['unidad'] }}</td>
                    <td>{{ count($personas) > 0 ? implode(' → ', $personas) : '—' }}</td>
                    <td class="num">{{ $t['dias_ocupados'] }}</td>
                    <td class="num">{{ $ocupacion['dias_rango'] }}</td>
                    <td class="num">{{ $t['tasa_ocupacion'] }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @include('reportes._section', ['n' => 4, 'label' => 'Eventos de contrato en el rango'])
    @if(count($ocupacion['eventos']) > 0)
        <table class="data-table">
            <thead>
                <tr><th>Unidad</th><th>Inquilino</th><th>Evento</th><th>Fecha</th><th>Detalle</th></tr>
            </thead>
            <tbody>
                @foreach($ocupacion['eventos'] as $e)
                    <tr>
                        <td class="mono">{{ $e['unidad'] }}</td>
                        <td>{{ $e['persona'] }}</td>
                        <td>
                            @if($e['evento'] === 'Renovación') <span class="pill success">{{ $e['evento'] }}</span>
                            @elseif($e['evento'] === 'Traslado') <span class="pill info">{{ $e['evento'] }}</span>
                            @else <span class="pill danger">{{ $e['evento'] }}</span>
                            @endif
                        </td>
                        <td class="mono">{{ $e['fecha'] }}</td>
                        <td class="muted">{{ $e['detalle'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-state">Sin eventos de contrato en el rango seleccionado.</div>
    @endif
</body>
</html>
