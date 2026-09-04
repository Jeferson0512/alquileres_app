<?php

namespace App\Services;

use App\Models\OcupacionUnidad;
use App\Models\TrasladoOcupacion;
use App\Models\Unidad;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

class ReporteOcupacionService
{
    private const MESES_CORTOS = [
        1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic',
    ];

    /**
     * @param  Collection  $periodos  periodos del rango, ordenados asc por fecha
     */
    public function build(Collection $periodos): array
    {
        // startOfDay() en ambos extremos, nunca endOfDay(): con un limite en
        // 23:59:59.999999 diffInDays() deja de contar dias de calendario y
        // devuelve segundos/86400 como float (92.999999... en vez de 93),
        // que luego revienta cualquier uso como entero (offsets, dias_rango).
        $rangoInicio = $periodos->first()->fecha_inicio->copy()->startOfDay();
        $rangoFin = $periodos->last()->fecha_fin->copy()->startOfDay();
        $diasRango = (int) $rangoInicio->diffInDays($rangoFin) + 1;

        $unidades = Unidad::where('estado', 'ACTIVO')->orderBy('codigo_unidad')->get(['id_unidad', 'codigo_unidad']);

        $ocupaciones = OcupacionUnidad::with('persona:id_persona,nombres,apellidos')
            ->where('fecha_inicio', '<=', $rangoFin)
            ->where(function ($q) use ($rangoInicio) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $rangoInicio);
            })
            ->orderBy('fecha_inicio')
            ->get();

        $ocupacionesPorUnidad = $ocupaciones->groupBy('id_unidad');

        $idsOcupacionRelevantes = $ocupaciones->pluck('id_ocupacion')->all();
        $traslados = TrasladoOcupacion::whereIn('id_ocupacion_origen', $idsOcupacionRelevantes)
            ->orWhereIn('id_ocupacion_destino', $idsOcupacionRelevantes)
            ->get();
        $trasladoPorOrigen = $traslados->keyBy('id_ocupacion_origen');
        $trasladoPorDestino = $traslados->keyBy('id_ocupacion_destino');

        $timeline = [];
        $diasOcupadosTotal = 0;

        foreach ($unidades as $unidad) {
            $tramos = $ocupacionesPorUnidad->get($unidad->id_unidad, collect());
            $segmentos = [];
            $diasOcupadosUnidad = 0;

            foreach ($tramos as $ocupacion) {
                $desde = Carbon::parse($ocupacion->fecha_inicio)->max($rangoInicio);
                $hasta = $ocupacion->fecha_fin ? Carbon::parse($ocupacion->fecha_fin)->min($rangoFin) : $rangoFin;
                if ($desde->gt($hasta)) {
                    continue;
                }

                $dias = (int) $desde->diffInDays($hasta) + 1;
                $diasOcupadosUnidad += $dias;

                $esTraslado = $trasladoPorDestino->has($ocupacion->id_ocupacion) || $trasladoPorOrigen->has($ocupacion->id_ocupacion);
                $segmentos[] = [
                    'tipo' => $esTraslado ? 'traslado' : 'ocupada',
                    'desde_offset' => (int) $rangoInicio->diffInDays($desde),
                    'dias' => $dias,
                    'persona' => trim($ocupacion->persona->nombres.' '.$ocupacion->persona->apellidos),
                ];
            }

            // Huecos entre segmentos (y antes/despues) = vacante.
            $conVacantes = $this->rellenarVacantes($segmentos, $diasRango);

            $timeline[] = [
                'unidad' => $unidad->codigo_unidad,
                'segmentos' => $conVacantes,
                'dias_ocupados' => $diasOcupadosUnidad,
                'tasa_ocupacion' => round($diasOcupadosUnidad / $diasRango * 100, 1),
            ];
            $diasOcupadosTotal += $diasOcupadosUnidad;
        }

        $tasaOcupacionPromedio = $unidades->count() > 0
            ? round($diasOcupadosTotal / ($diasRango * $unidades->count()) * 100, 1)
            : 0;

        $eventos = $this->eventosDeContrato($ocupaciones, $trasladoPorOrigen, $rangoInicio, $rangoFin);

        $motivoCounts = collect($eventos)->countBy('evento');

        return [
            'kpis' => [
                'tasa_ocupacion' => $tasaOcupacionPromedio,
                'tasa_vacancia' => round(100 - $tasaOcupacionPromedio, 1),
                'eventos_total' => count($eventos),
                'mayor_rotacion' => collect($timeline)->sortBy('tasa_ocupacion')->first()['unidad'] ?? '—',
            ],
            'timeline' => $timeline,
            'dias_rango' => $diasRango,
            'rango_fechas' => [
                'inicio' => $rangoInicio->day.' '.self::MESES_CORTOS[$rangoInicio->month],
                'fin' => $rangoFin->day.' '.self::MESES_CORTOS[$rangoFin->month],
            ],
            'serie_periodo' => $periodos->map(function ($p) {
                $inicio = $p->fecha_inicio->copy()->startOfDay();
                $fin = $p->fecha_fin->copy()->startOfDay();
                $dias = (int) $inicio->diffInDays($fin) + 1;
                $ocupadosPeriodo = OcupacionUnidad::where('fecha_inicio', '<=', $fin)
                    ->where(function ($q) use ($inicio) {
                        $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $inicio);
                    })
                    ->get()
                    ->sum(function ($o) use ($inicio, $fin) {
                        $desde = Carbon::parse($o->fecha_inicio)->max($inicio);
                        $hasta = $o->fecha_fin ? Carbon::parse($o->fecha_fin)->min($fin) : $fin;

                        return $desde->gt($hasta) ? 0 : (int) $desde->diffInDays($hasta) + 1;
                    });
                $unidadesCount = Unidad::where('estado', 'ACTIVO')->count();

                return [
                    'label' => self::MESES_CORTOS[$p->mes].' '.$p->anio,
                    'tasa' => $unidadesCount > 0 ? round($ocupadosPeriodo / ($dias * $unidadesCount) * 100, 1) : 0,
                ];
            })->values()->all(),
            'motivo_salida' => [
                'Renovación' => $motivoCounts->get('Renovación', 0),
                'Traslado' => $motivoCounts->get('Traslado', 0),
                'Fin sin renovar' => $motivoCounts->get('Fin sin renovar', 0),
            ],
            'eventos' => $eventos,
        ];
    }

    private function rellenarVacantes(array $segmentos, int $diasRango): array
    {
        usort($segmentos, fn ($a, $b) => $a['desde_offset'] <=> $b['desde_offset']);
        $resultado = [];
        $cursor = 0;

        foreach ($segmentos as $seg) {
            if ($seg['desde_offset'] > $cursor) {
                $resultado[] = ['tipo' => 'vacante', 'desde_offset' => $cursor, 'dias' => $seg['desde_offset'] - $cursor, 'persona' => null];
            }
            $resultado[] = $seg;
            $cursor = max($cursor, $seg['desde_offset'] + $seg['dias']);
        }

        if ($cursor < $diasRango) {
            $resultado[] = ['tipo' => 'vacante', 'desde_offset' => $cursor, 'dias' => $diasRango - $cursor, 'persona' => null];
        }

        return $resultado;
    }

    /**
     * Clasifica cada ocupacion finalizada dentro del rango por su motivo real:
     * RENOVACION -> "Renovación"; MUDANZA con fila en traslados_ocupacion ->
     * "Traslado" (la persona sigue en el inmueble, solo cambio de unidad);
     * cualquier otro fin -> "Fin sin renovar" (la persona se fue de verdad).
     */
    private function eventosDeContrato($ocupaciones, $trasladoPorOrigen, Carbon $rangoInicio, Carbon $rangoFin): array
    {
        $eventos = [];

        foreach ($ocupaciones as $ocupacion) {
            if (!$ocupacion->fecha_fin) {
                continue;
            }
            $fin = Carbon::parse($ocupacion->fecha_fin);
            if ($fin->lt($rangoInicio) || $fin->gt($rangoFin)) {
                continue;
            }

            $unidad = Unidad::find($ocupacion->id_unidad)?->codigo_unidad ?? '—';
            $persona = trim($ocupacion->persona->nombres.' '.$ocupacion->persona->apellidos);

            if ($ocupacion->motivo_fin === 'RENOVACION') {
                $eventos[] = ['unidad' => $unidad, 'persona' => $persona, 'evento' => 'Renovación', 'fecha_ts' => $fin->timestamp, 'fecha' => $fin->format('d M Y'), 'detalle' => 'Contrato renovado en la misma unidad'];
            } elseif ($trasladoPorOrigen->has($ocupacion->id_ocupacion)) {
                $traslado = $trasladoPorOrigen->get($ocupacion->id_ocupacion);
                $unidadDestino = $traslado->ocupacionDestino?->unidad?->codigo_unidad ?? '?';
                $eventos[] = ['unidad' => $unidad, 'persona' => $persona, 'evento' => 'Traslado', 'fecha_ts' => $fin->timestamp, 'fecha' => $fin->format('d M Y'), 'detalle' => "Trasladado a la unidad {$unidadDestino}"];
            } else {
                $eventos[] = ['unidad' => $unidad, 'persona' => $persona, 'evento' => 'Fin sin renovar', 'fecha_ts' => $fin->timestamp, 'fecha' => $fin->format('d M Y'), 'detalle' => $ocupacion->motivo_fin_detalle ?: 'Salida del inquilino'];
            }
        }

        usort($eventos, fn ($a, $b) => $a['fecha_ts'] <=> $b['fecha_ts']);

        return array_map(fn ($e) => collect($e)->except('fecha_ts')->all(), $eventos);
    }
}
