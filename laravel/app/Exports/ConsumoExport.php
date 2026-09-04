<?php

namespace App\Exports;

use App\Exports\Sheets\ArraySheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ConsumoExport implements Export, WithMultipleSheets
{
    public function __construct(private readonly array $consumo, private readonly string $rangoLabel)
    {
    }

    public function sheets(): array
    {
        $k = $this->consumo['kpis'];

        $resumen = new ArraySheet('Resumen', ['Indicador', 'Valor'], [
            ['Rango', $this->rangoLabel],
            ['Consumo total (kWh)', $k['consumo_total']],
            ['Promedio por unidad (kWh)', $k['promedio_unidad']],
            ['Mínimo facturable (kWh)', $k['minimo_kwh']],
            ['Unidades bajo el mínimo', implode(', ', $k['unidades_bajo_minimo']) ?: 'Ninguna'],
            ['Mayor consumidor', 'Unidad '.$k['mayor_consumidor']],
        ]);

        $matriz = new ArraySheet(
            'Matriz por unidad',
            array_merge(['Unidad'], $this->consumo['periodos_labels'], ['Promedio (kWh)']),
            collect($this->consumo['matriz'])->map(fn ($m) => array_merge(
                [$m['unidad']],
                array_column($m['valores'], 'kwh'),
                [$m['promedio']],
            ))->all(),
        );

        $ranking = new ArraySheet(
            'Ranking',
            ['Unidad', 'Promedio (kWh)'],
            collect($this->consumo['ranking'])->map(fn ($r) => [$r['unidad'], $r['promedio']])->all(),
        );

        $hojas = [$resumen, $matriz, $ranking];

        if (count($this->consumo['tramos']) > 0) {
            $hojas[] = new ArraySheet(
                'Tramos de traslado',
                ['Inquilino', 'Unidad origen', 'kWh en origen', 'Unidad destino', 'kWh en destino'],
                collect($this->consumo['tramos'])->map(fn ($t) => [
                    $t['persona'], $t['unidad_origen'], $t['kwh_origen'], $t['unidad_destino'], $t['kwh_destino'],
                ])->all(),
            );
        }

        return $hojas;
    }
}
