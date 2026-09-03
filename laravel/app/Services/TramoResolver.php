<?php

namespace App\Services;

use App\Models\LecturaUnidad;
use App\Models\Periodo;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Resuelve, para cada unidad con lectura en el periodo, la cadena de
 * tramos de ocupacion (ver docs/diseno-ocupaciones-parciales.md, S1). Un
 * tramo es la interseccion entre una ocupacion (o un hueco vacante) y el
 * periodo. Con una sola ocupacion cubriendo todo el periodo -- el caso de
 * hoy, siempre -- devuelve un unico tramo identico al periodo completo:
 * no cambia nada para ese caso.
 *
 * Es la UNICA pieza que cruza ocupaciones x periodo x lecturas_corte;
 * nada mas en el codigo debe reconstruir esta logica por su cuenta.
 *
 * Invariantes que garantiza (probadas en TramoResolverTest):
 * - Los tramos de una unidad cubren exactamente [periodo.fecha_inicio,
 *   periodo.fecha_fin], sin huecos ni solapes.
 * - Sum(consumo_kwh de los tramos con lectura conocida) == lectura_actual
 *   - lectura_anterior, cuando no hay ningun tramo CORTE_PENDIENTE.
 */
class TramoResolver
{
    /**
     * @return array<int, array<string, mixed>> lista plana de tramos (cada
     *   uno con su id_unidad) para todas las unidades con lectura en el
     *   periodo, o solo para $idUnidad si se pasa.
     */
    public function tramosParaPeriodo(Periodo $periodo, ?int $idUnidad = null): array
    {
        $lecturas = LecturaUnidad::where('id_periodo', $periodo->id_periodo)
            ->when($idUnidad, fn ($q) => $q->where('id_unidad', $idUnidad))
            ->get();

        if ($lecturas->isEmpty()) {
            return [];
        }

        $idsUnidad = $lecturas->pluck('id_unidad')->all();

        $ocupacionesPorUnidad = DB::table('ocupacion_unidad')
            ->whereIn('id_unidad', $idsUnidad)
            ->where('estado', '!=', 'ANULADO')
            ->where('fecha_inicio', '<=', $periodo->fecha_fin)
            ->where(function ($q) use ($periodo) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $periodo->fecha_inicio);
            })
            ->orderBy('fecha_inicio')->orderBy('id_ocupacion')
            ->get()
            ->groupBy('id_unidad');

        $cortesPorUnidad = DB::table('lecturas_corte')
            ->where('id_periodo', $periodo->id_periodo)
            ->whereIn('id_unidad', $idsUnidad)
            ->get()
            ->groupBy('id_unidad');

        $tramos = [];
        foreach ($lecturas as $lectura) {
            $ocupaciones = $ocupacionesPorUnidad->get($lectura->id_unidad, collect());
            $cortesUnidad = $cortesPorUnidad->get($lectura->id_unidad, collect());
            $cortesPorFecha = $cortesUnidad->keyBy(fn ($c) => $c->fecha_corte);
            $fechasManual = $cortesUnidad->where('origen', 'MANUAL')->pluck('fecha_corte')->all();

            $segmentos = $this->segmentar($periodo, $ocupaciones, $fechasManual);
            $tramos = array_merge($tramos, $this->asignarLecturas($lectura, $segmentos, $cortesPorFecha));
        }

        return $tramos;
    }

    /**
     * Recorta cada ocupacion al rango del periodo y rellena los huecos
     * (inicio, entre ocupaciones, final) con tramos vacantes
     * (id_ocupacion null). Sin ocupaciones, devuelve un unico tramo
     * vacante del periodo completo.
     *
     * Publico porque LecturaService::sincronizar() tambien lo usa -- solo
     * necesita las fechas de las fronteras (para crear los placeholders de
     * lecturas_corte), no las lecturas todavia. sincronizar() nunca pasa
     * $fechasCorteManual: el auto-detectado es solo por cambio de
     * ocupacion, nunca por un corte que un admin ya registro a mano.
     *
     * @param  string[]  $fechasCorteManual  fechas 'Y-m-d' de cortes con
     *   origen=MANUAL -- parten un segmento en dos aunque la ocupacion no
     *   haya cambiado (ej. lectura de control a mitad de contrato). Ver
     *   partirEnFechasManuales().
     */
    public function segmentar(Periodo $periodo, Collection $ocupaciones, array $fechasCorteManual = []): array
    {
        $segmentos = [];
        $cursor = Carbon::parse($periodo->fecha_inicio);
        $finPeriodo = Carbon::parse($periodo->fecha_fin);

        foreach ($ocupaciones as $ocupacion) {
            $desde = Carbon::parse($ocupacion->fecha_inicio)->max($cursor);
            $hasta = $ocupacion->fecha_fin ? Carbon::parse($ocupacion->fecha_fin)->min($finPeriodo) : $finPeriodo->copy();

            if ($desde->gt($hasta) || $desde->gt($finPeriodo)) {
                // Ya cubierto por una ocupacion anterior procesada (datos
                // con solape residual) o fuera de rango -- se ignora en vez
                // de adivinar cual de las dos vale.
                continue;
            }

            // Renovacion sin cambio de terminos (misma persona, mismo
            // alquiler, sin hueco con el tramo anterior) -- no hay nada
            // que partir, se extiende el tramo anterior en vez de abrir
            // uno nuevo. Exigir un corte ahi no cambiaria ni un centavo,
            // solo trabajo extra. Si el alquiler SI cambio (decision 5.9)
            // o es otra persona, se sigue partiendo como antes.
            $anterior = end($segmentos);
            $esRenovacionSinCambios = $anterior !== false
                && $anterior['id_ocupacion'] !== null
                && $desde->equalTo($cursor)
                && (int) $anterior['id_persona'] === (int) $ocupacion->id_persona
                && round((float) $anterior['monto_alquiler'], 2) === round((float) $ocupacion->monto_alquiler, 2);

            if ($esRenovacionSinCambios) {
                $ultimoIndice = count($segmentos) - 1;
                $segmentos[$ultimoIndice]['hasta'] = $hasta->copy();
                $segmentos[$ultimoIndice]['id_ocupacion'] = $ocupacion->id_ocupacion; // la mas reciente = "de cierre" del tramo fusionado
            } else {
                if ($desde->gt($cursor)) {
                    $segmentos[] = ['desde' => $cursor->copy(), 'hasta' => $desde->copy()->subDay(), 'id_ocupacion' => null, 'id_persona' => null, 'monto_alquiler' => null];
                }

                $segmentos[] = ['desde' => $desde->copy(), 'hasta' => $hasta->copy(), 'id_ocupacion' => $ocupacion->id_ocupacion, 'id_persona' => $ocupacion->id_persona, 'monto_alquiler' => (float) $ocupacion->monto_alquiler];
            }

            $cursor = $hasta->copy()->addDay();
        }

        if ($cursor->lte($finPeriodo)) {
            $segmentos[] = ['desde' => $cursor->copy(), 'hasta' => $finPeriodo->copy(), 'id_ocupacion' => null, 'id_persona' => null, 'monto_alquiler' => null];
        }

        return $fechasCorteManual === [] ? $segmentos : $this->partirEnFechasManuales($segmentos, $fechasCorteManual);
    }

    /**
     * Segunda pasada: parte cada segmento en las fechas de corte manual que
     * caigan estrictamente dentro de el. Los pedazos resultantes conservan
     * el mismo id_ocupacion/id_persona del segmento original -- un corte
     * manual nunca representa un cambio de inquilino, solo una lectura
     * intermedia dentro de la misma ocupacion.
     */
    private function partirEnFechasManuales(array $segmentos, array $fechasCorteManual): array
    {
        sort($fechasCorteManual);
        $resultado = [];

        foreach ($segmentos as $seg) {
            $desdeStr = $seg['desde']->toDateString();
            $hastaStr = $seg['hasta']->toDateString();
            $puntos = array_values(array_filter($fechasCorteManual, fn ($f) => $f >= $desdeStr && $f < $hastaStr));

            if ($puntos === []) {
                $resultado[] = $seg;
                continue;
            }

            $cursor = $seg['desde']->copy();
            foreach ($puntos as $fecha) {
                $fin = Carbon::parse($fecha);
                $resultado[] = ['desde' => $cursor->copy(), 'hasta' => $fin->copy(), 'id_ocupacion' => $seg['id_ocupacion'], 'id_persona' => $seg['id_persona']];
                $cursor = $fin->copy()->addDay();
            }
            $resultado[] = ['desde' => $cursor->copy(), 'hasta' => $seg['hasta']->copy(), 'id_ocupacion' => $seg['id_ocupacion'], 'id_persona' => $seg['id_persona']];
        }

        return $resultado;
    }

    /**
     * Encadena las lecturas a los segmentos: P0 = lectura_anterior, Pf =
     * lectura_actual, y cada frontera interna toma el lecturas_corte cuya
     * fecha_corte coincide con el cierre del segmento saliente. Un corte
     * interno sin cargar (o inexistente todavia) marca ese tramo como
     * CORTE_PENDIENTE en vez de adivinar un valor.
     */
    private function asignarLecturas(LecturaUnidad $lectura, array $segmentos, Collection $cortesPorFecha): array
    {
        $ultimoIndice = count($segmentos) - 1;
        $tramos = [];
        $lecturaDesde = (float) $lectura->lectura_anterior; // arranca conocido: P0

        foreach ($segmentos as $i => $seg) {
            $fechaHasta = $seg['hasta']->toDateString();
            $corteHastaId = null;
            $sinCorte = false;

            if ($i === $ultimoIndice) {
                $lecturaHasta = (float) $lectura->lectura_actual;
            } else {
                $corte = $cortesPorFecha->get($fechaHasta);
                if (!$corte || $corte->lectura_corte === null) {
                    $sinCorte = true;
                    $lecturaHasta = null;
                } else {
                    $lecturaHasta = (float) $corte->lectura_corte;
                    $corteHastaId = $corte->id;
                }
            }

            // Si ya venia arrastrando un hueco (una frontera anterior sin
            // corte cargado), este tramo tambien queda pendiente aunque su
            // propio corte de salida si este cargado -- no se puede saber
            // el consumo sin saber donde arranco.
            $pendiente = $sinCorte || $lecturaDesde === null;
            $consumo = (!$pendiente && $lecturaHasta !== null) ? round(max($lecturaHasta - $lecturaDesde, 0), 2) : null;
            $inconsistente = !$pendiente && $lecturaHasta !== null && $lecturaHasta < $lecturaDesde;

            $tramos[] = [
                'id_unidad' => $lectura->id_unidad,
                'id_lectura' => $lectura->id_lectura,
                'fecha_desde' => $seg['desde']->toDateString(),
                'fecha_hasta' => $fechaHasta,
                'dias' => (int) $seg['desde']->diffInDays($seg['hasta']) + 1,
                'id_ocupacion' => $seg['id_ocupacion'],
                'id_persona' => $seg['id_persona'],
                'lectura_desde' => $lecturaDesde,
                'lectura_hasta' => $lecturaHasta,
                'consumo_kwh' => $consumo,
                'id_corte_hasta' => $corteHastaId,
                'estado' => $pendiente ? 'CORTE_PENDIENTE' : ($inconsistente ? 'INCONSISTENTE' : 'OK'),
            ];

            $lecturaDesde = $lecturaHasta; // null se propaga si este tramo quedo pendiente
        }

        return $tramos;
    }
}
