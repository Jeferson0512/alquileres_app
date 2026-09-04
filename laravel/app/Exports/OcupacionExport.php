<?php

namespace App\Exports;

use App\Exports\Sheets\ArraySheet;
use Maatwebsite\Excel\Concerns\Export;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class OcupacionExport implements Export, WithMultipleSheets
{
    public function __construct(private readonly array $ocupacion, private readonly string $rangoLabel)
    {
    }

    public function sheets(): array
    {
        $k = $this->ocupacion['kpis'];

        $resumen = new ArraySheet('Resumen', ['Indicador', 'Valor'], [
            ['Rango', $this->rangoLabel],
            ['Ocupación promedio (%)', $k['tasa_ocupacion']],
            ['Tasa de vacancia (%)', $k['tasa_vacancia']],
            ['Eventos de contrato', $k['eventos_total']],
            ['Mayor rotación', 'Unidad '.$k['mayor_rotacion']],
        ]);

        $historial = new ArraySheet(
            'Historial por unidad',
            ['Unidad', 'Inquilino(s) en el rango', 'Días ocupados', 'Días del rango', 'Ocupación (%)'],
            collect($this->ocupacion['timeline'])->map(function ($t) {
                $personas = collect($t['segmentos'])->pluck('persona')->filter()->unique()->values()->implode(' -> ');

                return [$t['unidad'], $personas ?: '—', $t['dias_ocupados'], $this->ocupacion['dias_rango'], $t['tasa_ocupacion']];
            })->all(),
        );

        $eventos = new ArraySheet(
            'Eventos de contrato',
            ['Unidad', 'Inquilino', 'Evento', 'Fecha', 'Detalle'],
            collect($this->ocupacion['eventos'])->map(fn ($e) => [
                $e['unidad'], $e['persona'], $e['evento'], $e['fecha'], $e['detalle'],
            ])->all(),
        );

        return [$resumen, $historial, $eventos];
    }
}
