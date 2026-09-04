<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Una hoja generica reutilizable en vez de una clase de export por cada
 * combinacion reporte+hoja (serian 7 casi identicas entre Financiero,
 * Ocupacion y Consumo) -- recibe titulo/encabezados/filas ya armados por el
 * controller y solo se encarga del estilo (header azul de marca, igual al
 * de los PDFs).
 */
class ArraySheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    public function __construct(
        private readonly string $titulo,
        private readonly array $encabezados,
        private readonly array $filas,
    ) {
    }

    public function array(): array
    {
        return $this->filas;
    }

    public function headings(): array
    {
        return $this->encabezados;
    }

    public function title(): string
    {
        return mb_substr($this->titulo, 0, 31);
    }

    public function styles(Worksheet $sheet): array
    {
        $ultimaColumna = $sheet->getHighestColumn();
        $sheet->getStyle('A1:'.$ultimaColumna.'1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2563EB']],
        ]);
        $sheet->freezePane('A2');

        return [];
    }
}
