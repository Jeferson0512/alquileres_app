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
     * Facturado vs. realmente cobrado (no anulado) de los ultimos $meses
     * periodos, del mas antiguo al mas reciente -- para el grafico de
     * tendencia del Dashboard.
     */
    public function tendenciaMensual(int $meses = 6): array
    {
        $periodos = DB::table('periodos')
            ->orderByDesc('anio')->orderByDesc('mes')
            ->limit($meses)
            ->get(['id_periodo', 'anio', 'mes']);

        return $periodos->reverse()->values()->map(function ($periodo) {
            $facturado = (float) DB::table('cobros_mensuales')
                ->where('id_periodo', $periodo->id_periodo)
                ->where('estado_pago', '!=', 'ANULADO')
                ->sum('total_cobrar');

            $cobrado = (float) DB::table('pagos as pg')
                ->join('cobros_mensuales as c', 'c.id_cobro', '=', 'pg.id_cobro')
                ->where('c.id_periodo', $periodo->id_periodo)
                ->where('c.estado_pago', '!=', 'ANULADO')
                ->where('pg.estado', 'REGISTRADO')
                ->sum('pg.monto_pagado');

            return [
                'periodo_id' => $periodo->id_periodo,
                'label' => sprintf('%02d/%d', $periodo->mes, $periodo->anio),
                'facturado' => round($facturado, 2),
                'cobrado' => round($cobrado, 2),
                'pendiente' => round(max($facturado - $cobrado, 0), 2),
            ];
        })->all();
    }

    /**
     * Consumo (kWh) por unidad del periodo inmediatamente anterior --
     * para comparar "subió o bajó" contra el periodo actual en el
     * Dashboard. Devuelve [id_unidad => consumo_kwh].
     */
    public function consumoPorUnidadPeriodoAnterior(Periodo $periodo): array
    {
        $anterior = $periodo->anterior();
        if (!$anterior) {
            return [];
        }

        return DB::table('liquidacion_luz_detalle')
            ->where('id_periodo', $anterior->id_periodo)
            ->where('estado', '!=', 'ANULADO')
            ->pluck('consumo_kwh', 'id_unidad')
            ->map(fn ($v) => (float) $v)
            ->all();
    }
}
