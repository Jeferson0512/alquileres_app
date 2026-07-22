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
}
