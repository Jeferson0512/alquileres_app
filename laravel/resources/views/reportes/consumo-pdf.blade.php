<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte de consumo de luz</title>
    <style>@include('reportes._estilos')</style>
</head>
<body>
    @include('reportes._header', ['tituloReporte' => 'Reporte de consumo de luz', 'eyebrow' => 'Medición · Energía'])
    @include('reportes._footer', ['tituloReporte' => 'Consumo de luz'])

    @php $k = $consumo['kpis']; @endphp

    @include('reportes._section', ['n' => 1, 'label' => 'Resumen del período'])
    <table class="kv-table">
        <tr>
            <td class="k">Consumo total</td>
            <td class="v">{{ number_format($k['consumo_total'], 1) }} kWh</td>
            <td class="k">Promedio por unidad</td>
            <td class="v">{{ number_format($k['promedio_unidad'], 1) }} kWh<span class="sub">por período</span></td>
        </tr>
        <tr>
            <td class="k">Bajo el mínimo facturable</td>
            <td class="v">
                @if(count($k['unidades_bajo_minimo']) > 0)
                    {{ count($k['unidades_bajo_minimo']) }} unidad{{ count($k['unidades_bajo_minimo']) === 1 ? '' : 'es' }}
                    <span class="sub">{{ implode(', ', $k['unidades_bajo_minimo']) }} · &lt; {{ $k['minimo_kwh'] }} kWh</span>
                @else
                    Ninguna
                @endif
            </td>
            <td class="k">Mayor consumidor</td>
            <td class="v">Unidad {{ $k['mayor_consumidor'] }}</td>
        </tr>
    </table>

    @include('reportes._section', ['n' => 2, 'label' => 'Consumo total del inmueble por período'])
    <div class="chart-box">
        <div class="chart-title">kWh por período</div>
        <img src="{{ \App\Support\PdfChart::barrasAgrupadas(
            $consumo['periodos_labels'],
            [['data' => $consumo['total_por_periodo']]],
            ['#2563EB'],
        ) }}" width="460" height="150">
    </div>

    @include('reportes._section', ['n' => 3, 'label' => 'Ranking de consumo'])
    <div class="chart-box">
        <div class="chart-title">kWh, promedio del rango</div>
        <img src="{{ \App\Support\PdfChart::barrasHorizontales(
            array_column($consumo['ranking'], 'unidad'),
            array_column($consumo['ranking'], 'promedio'),
            '#D97706',
        ) }}" width="460" height="{{ 20 * count($consumo['ranking']) }}">
    </div>

    @include('reportes._section', ['n' => 4, 'label' => 'Detalle por unidad y período'])
    <table class="data-table">
        <thead>
            <tr>
                <th>Unidad</th>
                @foreach($consumo['periodos_labels'] as $label)
                    <th class="num">{{ $label }}</th>
                @endforeach
                <th class="num">Promedio</th>
            </tr>
        </thead>
        <tbody>
            @foreach($consumo['matriz'] as $m)
                <tr>
                    <td class="mono">{{ $m['unidad'] }}</td>
                    @foreach($m['valores'] as $v)
                        <td class="num" style="{{ $v['bajo_minimo'] ? 'color:#D97706;font-weight:bold;' : ($v['anomalia'] ? 'color:#DC2626;font-weight:bold;' : '') }}">
                            {{ $v['kwh'] }}{!! $v['bajo_minimo'] ? ' <span class="glyph">⚠</span>' : ($v['anomalia'] ? ' <span class="glyph">▲</span>' : '') !!}
                        </td>
                    @endforeach
                    <td class="num muted">{{ $m['promedio'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <div class="note-box" style="margin-top:6px;"><span class="glyph">⚠</span> bajo el mínimo facturable ({{ $k['minimo_kwh'] }} kWh) &nbsp;&middot;&nbsp; <span class="glyph">▲</span> se aleja de su propio promedio en ese período</div>

    @if(count($consumo['tramos']) > 0)
        @include('reportes._section', ['n' => 5, 'label' => 'Consumo por tramo de ocupación'])
        <table class="data-table">
            <thead>
                <tr><th>Inquilino</th><th>Unidad origen</th><th class="num">kWh en origen</th><th>Unidad destino</th><th class="num">kWh en destino</th></tr>
            </thead>
            <tbody>
                @foreach($consumo['tramos'] as $t)
                    <tr>
                        <td>{{ $t['persona'] }}</td>
                        <td class="mono">{{ $t['unidad_origen'] }}</td>
                        <td class="num">{{ $t['kwh_origen'] }} kWh</td>
                        <td class="mono">{{ $t['unidad_destino'] }}</td>
                        <td class="num">{{ $t['kwh_destino'] }} kWh</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif
</body>
</html>
