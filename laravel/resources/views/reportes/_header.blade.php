{{--
    $tituloReporte, $eyebrow, $inmueble, $rangoLabel, $generadoEl (todos string)
--}}
<div class="doc-header">
    <table>
        <tr>
            <td style="width:55%;">
                <div class="brand"><span class="accent">Alquileres</span> App</div>
                <div class="brand-sub">{{ $inmueble->nombre }}</div>
            </td>
            <td style="width:45%;">
                <div class="doc-eyebrow">{{ $eyebrow }}</div>
                <div class="doc-title">{{ $tituloReporte }}</div>
                <div class="doc-pills">
                    <span class="pill-tag">{{ $rangoLabel }}</span>
                    <span class="pill-tag solid">{{ $generadoEl }}</span>
                </div>
            </td>
        </tr>
    </table>
</div>
