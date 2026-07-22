<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AvisoService
{
    /**
     * Ocupaciones ACTIVAS cuyo contrato (fecha_inicio + 6 meses) vence dentro
     * de los proximos 30 dias. Mismo criterio que el legacy
     * api/modules/avisos/index.php: URGENTE si quedan <= 7 dias.
     */
    public function vencimientosContrato(): array
    {
        $rows = DB::table('ocupacion_unidad as o')
            ->join('unidades as u', 'u.id_unidad', '=', 'o.id_unidad')
            ->join('personas as p', 'p.id_persona', '=', 'o.id_persona')
            ->where('o.estado', 'ACTIVO')
            ->get([
                'o.id_ocupacion', 'o.id_unidad', 'o.id_persona', 'o.fecha_inicio',
                'u.codigo_unidad', 'u.nombre_unidad',
                DB::raw("CONCAT(p.nombres, ' ', p.apellidos) as inquilino"),
                DB::raw('DATE_ADD(o.fecha_inicio, INTERVAL 6 MONTH) as fecha_vencimiento_contrato'),
            ]);

        $hoy = new \DateTime(date('Y-m-d'));
        $avisos = [];

        foreach ($rows as $row) {
            $venc = new \DateTime($row->fecha_vencimiento_contrato);
            $diasRestantes = (int) $hoy->diff($venc)->format('%r%a');

            if ($diasRestantes >= 0 && $diasRestantes <= 30) {
                $nivel = $diasRestantes <= 7 ? 'URGENTE' : 'PROXIMO';
                $avisos[] = [
                    'tipo' => 'VENCIMIENTO_CONTRATO',
                    'id_referencia' => (int) $row->id_ocupacion,
                    'id_persona' => (int) $row->id_persona,
                    'id_unidad' => (int) $row->id_unidad,
                    'codigo_unidad' => $row->codigo_unidad,
                    'nombre_unidad' => $row->nombre_unidad,
                    'inquilino' => $row->inquilino,
                    'fecha_vencimiento' => $row->fecha_vencimiento_contrato,
                    'dias_restantes' => $diasRestantes,
                    'nivel' => $nivel,
                    'mensaje' => "Contrato de {$row->inquilino} ({$row->codigo_unidad}) vence en {$diasRestantes} dia(s)",
                ];
            }
        }

        usort($avisos, fn ($a, $b) => $a['dias_restantes'] <=> $b['dias_restantes']);

        return $avisos;
    }
}
