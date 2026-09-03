<div class="recibo">

    <div class="receipt-head">
        <table>
            <tr>
                <td style="width: 55%;">
                    <span class="mark">A</span>
                    <span class="brand-name">{{ $emisor['nombre'] }}</span>
                    @if($emisor['direccion'])
                        <p class="brand-sub">{{ $emisor['direccion'] }}</p>
                    @endif
                </td>
                <td style="width: 45%; text-align: right;">
                    <span class="receipt-stamp {{ strtolower($estado) }}">{{ $estadoLabel }}</span>
                    <p class="doc-kind">Recibo de cobro</p>
                    <p class="folio">{{ $folio }}</p>
                    <p class="emitted">Emitido el {{ $fechaEmision }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="rule"></div>

    <div class="parties-box">
        <table>
            <tr>
                <td style="width: 50%;">
                    <p class="p-label">Inquilino</p>
                    <p class="p-value">{{ $inquilino['nombre'] }}</p>
                </td>
                <td style="width: 50%;">
                    <p class="p-label">Unidad &middot; Periodo</p>
                    <p class="p-value">{{ $unidad['codigo'] }} &mdash; {{ $unidad['nombre'] }}</p>
                    <p class="p-meta">{{ $periodoTexto }}</p>
                </td>
            </tr>
        </table>
    </div>

    @if($notaTraslado)
        <div class="transfer-box">{{ $notaTraslado }}</div>
    @endif

    <div class="receipt-body">
        <table class="concepts">
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th>Detalle</th>
                    <th class="num">Monto</th>
                </tr>
            </thead>
            <tbody>
                @foreach($conceptos as $c)
                    <tr>
                        <td class="concept">{{ $c['nombre'] }}</td>
                        <td class="detail">{{ $c['detalle'] }}</td>
                        <td class="num">S/ {{ number_format($c['monto'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        @if($deudaAnterior > 0)
            <div class="debt-box">
                <table>
                    <tr>
                        <td>Deuda de periodos anteriores</td>
                        <td class="r">S/ {{ number_format($deudaAnterior, 2) }}</td>
                    </tr>
                </table>
            </div>
        @endif

        <table class="totals">
            <tr>
                <td>Subtotal del periodo</td>
                <td class="r">S/ {{ number_format($subtotalPeriodo, 2) }}</td>
            </tr>
            @if($pagadoTotal > 0)
                <tr>
                    <td>Pagado a cuenta</td>
                    <td class="r">S/ {{ number_format($pagadoTotal, 2) }}</td>
                </tr>
            @endif
            <tr class="grand">
                <td>{{ $saldoTotal > 0 ? 'Saldo a pagar' : 'Total cancelado' }}</td>
                <td class="r">S/ {{ number_format($saldoTotal > 0 ? $saldoTotal : $subtotalPeriodo, 2) }}</td>
            </tr>
        </table>

        @if($saldoTotal > 0 && ($pago['yape_numero'] || $pago['banco_nombre']))
            <div class="pay-box">
                <table>
                    <tr>
                        @if($pago['yape_numero'])
                            <td style="width: 44px;"><span class="qr-mark">Y</span></td>
                            <td>
                                <p class="who">Yape &mdash; {{ $pago['yape_titular'] }}</p>
                                <p class="meta">{{ $pago['yape_numero'] }} &middot; sube tu comprobante desde el portal despu&eacute;s de pagar</p>
                            </td>
                        @elseif($pago['banco_nombre'])
                            <td>
                                <p class="who">{{ $pago['banco_nombre'] }} &mdash; {{ $pago['banco_titular'] }}</p>
                                <p class="meta">Cuenta: {{ $pago['banco_cuenta'] }} &middot; CCI: {{ $pago['banco_cci'] }}</p>
                            </td>
                        @endif
                    </tr>
                </table>
            </div>
        @endif
    </div>

    <div class="footer">
        Documento informativo generado por el sistema, no reemplaza una factura o boleta electr&oacute;nica SUNAT.
        @if($folioEsReal) Folio interno de control: {{ $folio }}. @endif
    </div>

</div>
