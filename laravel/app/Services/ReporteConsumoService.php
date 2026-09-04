<?php

namespace App\Services;

use App\Models\ConfigCobranza;
use App\Models\TrasladoOcupacion;
use App\Models\Unidad;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ReporteConsumoService
{
    private const MESES_CORTOS = [
        1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
    ];

    /** Umbral de desviacion contra el propio promedio de la unidad para
     * resaltarla como posible anomalia -- comparacion estadistica simple,
     * no la deteccion real que se construira para innovador-4 (v3). */
    private const UMBRAL_ANOMALIA = 0.35;

    /**
     * @param  Collection  $periodos  periodos del rango, ordenados asc por fecha
     */
    public function build(Collection $periodos): array
    {
        $idsPeriodo = $periodos->pluck('id_periodo')->all();
        $unidades = Unidad::where('estado', 'ACTIVO')->orderBy('codigo_unidad')->get(['id_unidad', 'codigo_unidad', 'id_inmueble']);

        $minimoKwh = (float) (ConfigCobranza::where('id_inmueble', $unidades->first()?->id_inmueble)->value('minimo_kwh_aviso') ?? 13.5);

        $consumoPorUnidadPeriodo = DB::table('cobros_mensuales')
            ->whereIn('id_periodo', $idsPeriodo)
            ->where('estado_pago', '!=', 'ANULADO')
            ->groupBy('id_unidad', 'id_periodo')
            ->get(['id_unidad', 'id_periodo', DB::raw('SUM(consumo_kwh) as kwh')])
            ->groupBy('id_unidad');

        $matriz = [];
        $totalPorPeriodo = array_fill(0, $periodos->count(), 0.0);

        foreach ($unidades as $unidad) {
            $porPeriodo = $consumoPorUnidadPeriodo->get($unidad->id_unidad, collect())->keyBy('id_periodo');
            $valores = $periodos->map(fn ($p) => round((float) ($porPeriodo[$p->id_periodo]->kwh ?? 0), 1))->values()->all();

            foreach ($valores as $i => $v) {
                $totalPorPeriodo[$i] += $v;
            }

            $promedio = count($valores) > 0 ? array_sum($valores) / count($valores) : 0;

            $matriz[] = [
                'unidad' => $unidad->codigo_unidad,
                'valores' => array_map(function ($v) use ($promedio, $minimoKwh) {
                    $bajoMinimo = $v < $minimoKwh;
                    $anomalia = !$bajoMinimo && $promedio > 0 && abs($v - $promedio) / $promedio > self::UMBRAL_ANOMALIA;

                    return ['kwh' => $v, 'bajo_minimo' => $bajoMinimo, 'anomalia' => $anomalia];
                }, $valores),
                'promedio' => round($promedio, 1),
            ];
        }

        $ranking = collect($matriz)
            ->sortByDesc('promedio')
            ->take(6)
            ->map(fn ($m) => ['unidad' => $m['unidad'], 'promedio' => $m['promedio']])
            ->values()
            ->all();

        $ultimoIndex = $periodos->count() - 1;
        $distribucionUltimoPeriodo = collect($matriz)
            ->map(fn ($m) => ['unidad' => $m['unidad'], 'kwh' => $m['valores'][$ultimoIndex]['kwh'] ?? 0])
            ->filter(fn ($m) => $m['kwh'] > 0)
            ->values()
            ->all();

        $consumoTotal = array_sum($totalPorPeriodo);
        $bajoMinimo = collect($matriz)->filter(fn ($m) => collect($m['valores'])->every(fn ($v) => $v['bajo_minimo']))->pluck('unidad')->all();
        $mayorConsumidor = collect($matriz)->sortByDesc('promedio')->first();

        return [
            'kpis' => [
                'consumo_total' => round($consumoTotal, 1),
                'promedio_unidad' => $unidades->count() > 0 ? round($consumoTotal / ($unidades->count() * $periodos->count()), 1) : 0,
                'minimo_kwh' => round($minimoKwh, 1),
                'unidades_bajo_minimo' => $bajoMinimo,
                'mayor_consumidor' => $mayorConsumidor['unidad'] ?? '—',
            ],
            'periodos_labels' => $periodos->map(fn ($p) => self::MESES_CORTOS[$p->mes].' '.$p->anio)->values()->all(),
            'matriz' => $matriz,
            'total_por_periodo' => array_map(fn ($v) => round($v, 1), $totalPorPeriodo),
            'ranking' => $ranking,
            'distribucion_ultimo_periodo' => $distribucionUltimoPeriodo,
            'tramos' => $this->consumoPorTramoDeTraslado($idsPeriodo),
        ];
    }

    /**
     * Para traslados ocurridos dentro del rango, desglosa el consumo del
     * periodo entre la unidad de origen y la de destino -- aprovecha
     * directo liquidacion_luz_tramo de la Fase 2, sin calculo nuevo.
     */
    private function consumoPorTramoDeTraslado(array $idsPeriodo): array
    {
        $traslados = TrasladoOcupacion::whereHas('ocupacionOrigen.cobros', fn ($q) => $q->whereIn('id_periodo', $idsPeriodo))
            ->orWhereHas('ocupacionDestino.cobros', fn ($q) => $q->whereIn('id_periodo', $idsPeriodo))
            ->with(['ocupacionOrigen.unidad', 'ocupacionOrigen.persona', 'ocupacionDestino.unidad'])
            ->get();

        $resultado = [];
        foreach ($traslados as $traslado) {
            $origen = $traslado->ocupacionOrigen;
            $destino = $traslado->ocupacionDestino;
            if (!$origen || !$destino) {
                continue;
            }

            $tramos = DB::table('liquidacion_luz_tramo')
                ->whereIn('id_ocupacion', [$origen->id_ocupacion, $destino->id_ocupacion])
                ->whereIn('id_periodo', $idsPeriodo)
                ->get();

            foreach ($tramos->groupBy('id_periodo') as $filas) {
                $tramoOrigen = $filas->firstWhere('id_ocupacion', $origen->id_ocupacion);
                $tramoDestino = $filas->firstWhere('id_ocupacion', $destino->id_ocupacion);
                if (!$tramoOrigen && !$tramoDestino) {
                    continue;
                }

                $resultado[] = [
                    'persona' => trim($origen->persona->nombres.' '.$origen->persona->apellidos),
                    'unidad_origen' => $origen->unidad->codigo_unidad,
                    'unidad_destino' => $destino->unidad->codigo_unidad,
                    'kwh_origen' => round((float) ($tramoOrigen->consumo_kwh ?? 0), 1),
                    'kwh_destino' => round((float) ($tramoDestino->consumo_kwh ?? 0), 1),
                ];
            }
        }

        return $resultado;
    }
}
