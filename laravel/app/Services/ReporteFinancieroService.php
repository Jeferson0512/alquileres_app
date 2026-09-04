<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ReporteFinancieroService
{
    private const AGING_TRAMOS = [30, 60, 90];

    private const MESES_CORTOS = [
        1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
    ];

    /**
     * @param  Collection  $periodos  periodos del rango, ordenados asc por fecha
     */
    public function build(Collection $periodos): array
    {
        $idsPeriodo = $periodos->pluck('id_periodo')->all();

        $porPeriodo = DB::table('cobros_mensuales as c')
            ->whereIn('c.id_periodo', $idsPeriodo)
            ->where('c.estado_pago', '!=', 'ANULADO')
            ->groupBy('c.id_periodo')
            ->get(['c.id_periodo', DB::raw('SUM(c.total_cobrar) as facturado')])
            ->keyBy('id_periodo');

        $cobradoPorPeriodo = DB::table('pagos as pg')
            ->join('cobros_mensuales as c', 'c.id_cobro', '=', 'pg.id_cobro')
            ->whereIn('c.id_periodo', $idsPeriodo)
            ->where('pg.estado', 'REGISTRADO')
            ->groupBy('c.id_periodo')
            ->get(['c.id_periodo', DB::raw('SUM(pg.monto_pagado) as cobrado')])
            ->keyBy('id_periodo');

        $seriePeriodo = $periodos->map(fn ($p) => [
            'label' => self::MESES_CORTOS[$p->mes].' '.$p->anio,
            'facturado' => round((float) ($porPeriodo[$p->id_periodo]->facturado ?? 0), 2),
            'cobrado' => round((float) ($cobradoPorPeriodo[$p->id_periodo]->cobrado ?? 0), 2),
        ])->values()->all();

        $facturadoTotal = array_sum(array_column($seriePeriodo, 'facturado'));
        $cobradoTotal = array_sum(array_column($seriePeriodo, 'cobrado'));

        [$aging, $rentRoll] = $this->agingYDetalle($idsPeriodo);

        $morosidad60 = array_sum(array_map(fn ($r) => $r['tramo_31_60'] + $r['tramo_61_mas'], $aging));

        return [
            'kpis' => [
                'facturado' => round($facturadoTotal, 2),
                'cobrado' => round($cobradoTotal, 2),
                'pendiente' => round(max($facturadoTotal - $cobradoTotal, 0), 2),
                'tasa_cobranza' => $facturadoTotal > 0 ? round($cobradoTotal / $facturadoTotal * 100, 1) : 0,
                'morosidad_60' => round($morosidad60, 2),
            ],
            'serie_periodo' => $seriePeriodo,
            'desglose_concepto' => $this->desglosePorConcepto($idsPeriodo),
            'aging' => $aging,
            'rent_roll' => $rentRoll,
        ];
    }

    /**
     * Aging de morosidad (0-30/31-60/61-90+ dias, contra fecha_vencimiento) y
     * detalle "rent roll" por unidad+persona, calculados en la misma pasada
     * porque comparten la misma fuente (saldo pendiente por cobro).
     */
    private function agingYDetalle(array $idsPeriodo): array
    {
        $hoy = Carbon::today();

        $cobros = DB::table('cobros_mensuales as c')
            ->join('unidades as u', 'u.id_unidad', '=', 'c.id_unidad')
            ->join('personas as p', 'p.id_persona', '=', 'c.id_persona')
            ->whereIn('c.id_periodo', $idsPeriodo)
            ->where('c.estado_pago', '!=', 'ANULADO')
            ->get([
                'c.id_cobro', 'c.id_unidad', 'c.id_persona', 'c.total_cobrar', 'c.fecha_vencimiento',
                'u.codigo_unidad', DB::raw("CONCAT(p.nombres, ' ', p.apellidos) as inquilino"),
            ]);

        $pagadoPorCobro = DB::table('pagos')
            ->whereIn('id_cobro', $cobros->pluck('id_cobro'))
            ->where('estado', 'REGISTRADO')
            ->groupBy('id_cobro')
            ->pluck(DB::raw('SUM(monto_pagado)'), 'id_cobro');

        $porUnidadPersona = [];
        foreach ($cobros as $c) {
            $key = $c->id_unidad.':'.$c->id_persona;
            $porUnidadPersona[$key] ??= [
                'unidad' => $c->codigo_unidad, 'persona' => $c->inquilino,
                'facturado' => 0.0, 'cobrado' => 0.0,
                'tramo_0_30' => 0.0, 'tramo_31_60' => 0.0, 'tramo_61_mas' => 0.0,
            ];

            $pagado = round((float) ($pagadoPorCobro[$c->id_cobro] ?? 0), 2);
            $saldo = round(max((float) $c->total_cobrar - $pagado, 0), 2);

            $porUnidadPersona[$key]['facturado'] += (float) $c->total_cobrar;
            $porUnidadPersona[$key]['cobrado'] += $pagado;

            if ($saldo > 0) {
                $dias = Carbon::parse($c->fecha_vencimiento)->diffInDays($hoy, false);
                if ($dias <= self::AGING_TRAMOS[0]) {
                    $porUnidadPersona[$key]['tramo_0_30'] += $saldo;
                } elseif ($dias <= self::AGING_TRAMOS[1]) {
                    $porUnidadPersona[$key]['tramo_31_60'] += $saldo;
                } else {
                    $porUnidadPersona[$key]['tramo_61_mas'] += $saldo;
                }
            }
        }

        $rentRoll = collect($porUnidadPersona)->map(function ($r) {
            $r['facturado'] = round($r['facturado'], 2);
            $r['cobrado'] = round($r['cobrado'], 2);
            $r['pendiente'] = round(max($r['facturado'] - $r['cobrado'], 0), 2);

            return $r;
        })->sortBy('unidad')->values()->all();

        $aging = collect($porUnidadPersona)
            ->map(fn ($r) => [
                'unidad' => $r['unidad'], 'persona' => $r['persona'],
                'tramo_0_30' => round($r['tramo_0_30'], 2),
                'tramo_31_60' => round($r['tramo_31_60'], 2),
                'tramo_61_mas' => round($r['tramo_61_mas'], 2),
                'total' => round($r['tramo_0_30'] + $r['tramo_31_60'] + $r['tramo_61_mas'], 2),
            ])
            ->filter(fn ($r) => $r['total'] > 0)
            ->sortByDesc('total')
            ->values()
            ->all();

        return [$aging, $rentRoll];
    }

    /**
     * Desglose por concepto del ultimo periodo CERRADO dentro del rango (si
     * todos siguen ABIERTOS, usa el ultimo del rango tal cual) -- un periodo
     * a medio cobrar todavia no es representativo de la mezcla real.
     */
    private function desglosePorConcepto(array $idsPeriodo): array
    {
        $idPeriodoRef = DB::table('periodos')
            ->whereIn('id_periodo', $idsPeriodo)
            ->where('estado', 'CERRADO')
            ->orderByDesc('anio')->orderByDesc('mes')
            ->value('id_periodo')
            ?? max($idsPeriodo);

        $filas = DB::table('cobros_mensuales_detalle as d')
            ->join('cobros_mensuales as c', 'c.id_cobro', '=', 'd.id_cobro')
            ->join('conceptos_cobro as cc', 'cc.id_concepto', '=', 'd.id_concepto')
            ->where('c.id_periodo', $idPeriodoRef)
            ->where('c.estado_pago', '!=', 'ANULADO')
            ->groupBy('cc.nombre')
            ->orderByDesc(DB::raw('SUM(d.monto_programado)'))
            ->get(['cc.nombre', DB::raw('SUM(d.monto_programado) as monto')]);

        $total = $filas->sum('monto');
        if ($total <= 0) {
            return [];
        }

        return $filas->map(fn ($f) => [
            'concepto' => $f->nombre,
            'monto' => round((float) $f->monto, 2),
            'porcentaje' => round((float) $f->monto / $total * 100, 1),
        ])->all();
    }
}
