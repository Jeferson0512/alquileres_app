<?php

namespace App\Exports;

use App\Exports\Sheets\ArraySheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class FinancieroExport implements Export, WithMultipleSheets
{
    public function __construct(private readonly array $financiero, private readonly string $rangoLabel)
    {
    }

    public function sheets(): array
    {
        $k = $this->financiero['kpis'];

        $resumen = new ArraySheet('Resumen', ['Indicador', 'Valor'], [
            ['Rango', $this->rangoLabel],
            ['Facturado (S/)', $k['facturado']],
            ['Cobrado (S/)', $k['cobrado']],
            ['Pendiente (S/)', $k['pendiente']],
            ['Tasa de cobranza (%)', $k['tasa_cobranza']],
            ['Morosidad > 60 días (S/)', $k['morosidad_60']],
        ]);

        $porPeriodo = new ArraySheet(
            'Por período',
            ['Período', 'Facturado (S/)', 'Cobrado (S/)', 'Pendiente (S/)'],
            collect($this->financiero['serie_periodo'])->map(fn ($p) => [
                $p['label'], $p['facturado'], $p['cobrado'], round(max($p['facturado'] - $p['cobrado'], 0), 2),
            ])->all(),
        );

        $aging = new ArraySheet(
            'Aging morosidad',
            ['Unidad', 'Inquilino', '0-30 días (S/)', '31-60 días (S/)', '61-90+ días (S/)', 'Total (S/)'],
            collect($this->financiero['aging'])->map(fn ($r) => [
                $r['unidad'], $r['persona'], $r['tramo_0_30'], $r['tramo_31_60'], $r['tramo_61_mas'], $r['total'],
            ])->all(),
        );

        $detalle = new ArraySheet(
            'Detalle por unidad',
            ['Unidad', 'Inquilino', 'Facturado (S/)', 'Cobrado (S/)', 'Pendiente (S/)', 'Estado'],
            collect($this->financiero['rent_roll'])->map(fn ($r) => [
                $r['unidad'], $r['persona'], $r['facturado'], $r['cobrado'], $r['pendiente'],
                $r['pendiente'] <= 0 ? 'Al día' : 'Pendiente',
            ])->all(),
        );

        return [$resumen, $porPeriodo, $aging, $detalle];
    }
}
