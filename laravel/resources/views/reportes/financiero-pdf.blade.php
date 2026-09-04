<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte financiero</title>
    <style>@include('reportes._estilos')</style>
</head>
<body>
    @include('reportes._header', ['tituloReporte' => 'Reporte financiero', 'eyebrow' => 'Cobranza · Ingresos'])
    @include('reportes._footer', ['tituloReporte' => 'Financiero'])

    @php $k = $financiero['kpis']; @endphp

    @include('reportes._section', ['n' => 1, 'label' => 'Resumen del período'])
    <table class="kv-table">
        <tr>
            <td class="k">Facturado</td>
            <td class="v">S/ {{ number_format($k['facturado'], 2) }}</td>
            <td class="k">Cobrado</td>
            <td class="v">S/ {{ number_format($k['cobrado'], 2) }}<span class="sub">{{ $k['tasa_cobranza'] }}% del facturado</span></td>
        </tr>
        <tr>
            <td class="k">Pendiente</td>
            <td class="v">S/ {{ number_format($k['pendiente'], 2) }}</td>
            <td class="k">Morosidad &gt; 60 días</td>
            <td class="v">S/ {{ number_format($k['morosidad_60'], 2) }}</td>
        </tr>
    </table>

    @include('reportes._section', ['n' => 2, 'label' => 'Facturado vs. cobrado por período'])
    <div class="chart-box">
        <div class="chart-title">S/ por período</div>
        <img src="{{ \App\Support\PdfChart::barrasAgrupadas(
            array_column($financiero['serie_periodo'], 'label'),
            [
                ['data' => array_column($financiero['serie_periodo'], 'facturado')],
                ['data' => array_column($financiero['serie_periodo'], 'cobrado')],
            ],
            ['#BFDBFE', '#2563EB'],
        ) }}" width="460" height="150">
        <div class="chart-legend">
            <span class="sw"><span class="dot" style="background:#BFDBFE;"></span>Facturado</span>
            <span class="sw"><span class="dot" style="background:#2563EB;"></span>Cobrado</span>
        </div>
    </div>
    <table class="data-table">
        <thead>
            <tr><th>Período</th><th class="num">Facturado</th><th class="num">Cobrado</th><th class="num">Pendiente</th></tr>
        </thead>
        <tbody>
            @foreach($financiero['serie_periodo'] as $p)
                <tr>
                    <td>{{ $p['label'] }}</td>
                    <td class="num">S/ {{ number_format($p['facturado'], 2) }}</td>
                    <td class="num">S/ {{ number_format($p['cobrado'], 2) }}</td>
                    <td class="num">S/ {{ number_format(max($p['facturado'] - $p['cobrado'], 0), 2) }}</td>
                </tr>
            @endforeach
            <tr class="total">
                <td>Total del rango</td>
                <td class="num">S/ {{ number_format($k['facturado'], 2) }}</td>
                <td class="num">S/ {{ number_format($k['cobrado'], 2) }}</td>
                <td class="num">S/ {{ number_format($k['pendiente'], 2) }}</td>
            </tr>
        </tbody>
    </table>

    @if(count($financiero['desglose_concepto']) > 0)
        @include('reportes._section', ['n' => 3, 'label' => 'Facturado por concepto'])
        <table class="data-table">
            <thead><tr><th>Concepto</th><th class="num">Monto</th><th class="num">% del total</th></tr></thead>
            <tbody>
                @foreach($financiero['desglose_concepto'] as $c)
                    <tr>
                        <td>{{ $c['concepto'] }}</td>
                        <td class="num">S/ {{ number_format($c['monto'], 2) }}</td>
                        <td class="num">{{ $c['porcentaje'] }}%</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    @include('reportes._section', ['n' => 4, 'label' => 'Aging de morosidad por inquilino'])
    @if(count($financiero['aging']) > 0)
        <table class="data-table">
            <thead>
                <tr><th>Unidad</th><th>Inquilino</th><th class="num">0–30 días</th><th class="num">31–60 días</th><th class="num">61–90+ días</th><th class="num">Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
                @foreach($financiero['aging'] as $r)
                    <tr>
                        <td class="mono">{{ $r['unidad'] }}</td>
                        <td>{{ $r['persona'] }}</td>
                        <td class="num">{{ $r['tramo_0_30'] > 0 ? 'S/ '.number_format($r['tramo_0_30'], 2) : '—' }}</td>
                        <td class="num">{{ $r['tramo_31_60'] > 0 ? 'S/ '.number_format($r['tramo_31_60'], 2) : '—' }}</td>
                        <td class="num">{{ $r['tramo_61_mas'] > 0 ? 'S/ '.number_format($r['tramo_61_mas'], 2) : '—' }}</td>
                        <td class="num">S/ {{ number_format($r['total'], 2) }}</td>
                        <td>
                            @if($r['tramo_61_mas'] > 0) <span class="pill danger">Crítico</span>
                            @elseif($r['tramo_31_60'] > 0) <span class="pill warning">Atrasado</span>
                            @else <span class="pill gray">Reciente</span>
                            @endif
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-state">Sin deudores en el rango seleccionado.</div>
    @endif

    @include('reportes._section', ['n' => 5, 'label' => 'Detalle por unidad'])
    <table class="data-table">
        <thead>
            <tr><th>Unidad</th><th>Inquilino</th><th class="num">Facturado</th><th class="num">Cobrado</th><th class="num">Pendiente</th><th>Estado</th></tr>
        </thead>
        <tbody>
            @foreach($financiero['rent_roll'] as $r)
                <tr>
                    <td class="mono">{{ $r['unidad'] }}</td>
                    <td>{{ $r['persona'] }}</td>
                    <td class="num">S/ {{ number_format($r['facturado'], 2) }}</td>
                    <td class="num">S/ {{ number_format($r['cobrado'], 2) }}</td>
                    <td class="num">S/ {{ number_format($r['pendiente'], 2) }}</td>
                    <td>
                        @if($r['pendiente'] <= 0) <span class="pill success">Al día</span>
                        @else <span class="pill warning">Pendiente</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
