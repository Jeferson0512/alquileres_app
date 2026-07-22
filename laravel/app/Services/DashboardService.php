<?php

namespace App\Services;

use App\Models\Periodo;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function stats(Periodo $periodo): array
    {
        return [
            'total_ocupados' => (int) DB::table('ocupacion_unidad')->where('estado', 'ACTIVO')->count(),
            'total_alquiler' => (float) DB::table('ocupacion_unidad')->where('estado', 'ACTIVO')->sum('monto_alquiler'),
            'total_luz' => (float) DB::table('liquidacion_luz_detalle')
                ->where('id_periodo', $periodo->id_periodo)
                ->where('estado', '!=', 'ANULADO')
                ->sum('total_pagar_luz'),
            'total_cobrar' => (float) DB::table('cobros_mensuales')
                ->where('id_periodo', $periodo->id_periodo)
                ->where('estado_pago', '!=', 'ANULADO')
                ->sum('total_cobrar'),
        ];
    }

    /**
     * Total cobrado (no anulado) de los ultimos $meses periodos, del mas
     * antiguo al mas reciente -- para el grafico de tendencia del Dashboard.
     */
    public function tendenciaMensual(int $meses = 6): array
    {
        $periodos = DB::table('periodos')
            ->orderByDesc('anio')->orderByDesc('mes')
            ->limit($meses)
            ->get(['id_periodo', 'anio', 'mes']);

        return $periodos->reverse()->values()->map(function ($periodo) {
            $total = (float) DB::table('cobros_mensuales')
                ->where('id_periodo', $periodo->id_periodo)
                ->where('estado_pago', '!=', 'ANULADO')
                ->sum('total_cobrar');

            return [
                'periodo_id' => $periodo->id_periodo,
                'label' => sprintf('%02d/%d', $periodo->mes, $periodo->anio),
                'total' => round($total, 2),
            ];
        })->all();
    }
}
