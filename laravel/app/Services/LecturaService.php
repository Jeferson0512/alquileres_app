<?php

namespace App\Services;

use App\Models\LecturaUnidad;
use App\Models\OcupacionUnidad;
use App\Models\Periodo;
use App\Models\Unidad;
use Illuminate\Support\Facades\DB;

class LecturaService
{
    /**
     * Replica lecturas/sync.php: para cada unidad ACTIVA, busca la ocupacion
     * vigente en el rango de fechas del periodo, toma la ultima lectura_actual
     * registrada en un periodo anterior como lectura_anterior, y crea o
     * actualiza la fila de lecturas_unidad de este periodo.
     */
    public function sincronizar(Periodo $periodo): array
    {
        $periodo->assertEditable();

        $insertados = 0;
        $actualizados = 0;

        DB::transaction(function () use ($periodo, &$insertados, &$actualizados) {
            $unidades = Unidad::where('estado', 'ACTIVO')->orderBy('id_unidad')->get(['id_unidad']);

            foreach ($unidades as $unidad) {
                $idUnidad = $unidad->id_unidad;

                $ocupacion = OcupacionUnidad::where('id_unidad', $idUnidad)
                    ->where('estado', '!=', 'ANULADO')
                    ->where('fecha_inicio', '<=', $periodo->fecha_fin)
                    ->where(function ($q) use ($periodo) {
                        $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $periodo->fecha_inicio);
                    })
                    ->orderByDesc('fecha_inicio')->orderByDesc('id_ocupacion')
                    ->first();

                $anterior = LecturaUnidad::where('id_unidad', $idUnidad)
                    ->whereHas('periodo', fn ($q) => $q->where('fecha_fin', '<=', $periodo->fecha_inicio)->where('id_periodo', '!=', $periodo->id_periodo))
                    ->join('periodos as p_prev', 'p_prev.id_periodo', '=', 'lecturas_unidad.id_periodo')
                    ->orderByDesc('p_prev.fecha_fin')->orderByDesc('lecturas_unidad.id_lectura')
                    ->value('lecturas_unidad.lectura_actual');

                $lecturaAnterior = $anterior !== null ? (float) $anterior : 0.0;

                $lectura = LecturaUnidad::where('id_periodo', $periodo->id_periodo)
                    ->where('id_unidad', $idUnidad)
                    ->first();

                if ($lectura) {
                    $lectura->update([
                        'id_ocupacion' => $ocupacion?->id_ocupacion,
                        'lectura_anterior' => $lecturaAnterior,
                        'lectura_actual' => max($lectura->lectura_actual, $lecturaAnterior),
                    ]);
                    $actualizados++;
                    continue;
                }

                LecturaUnidad::create([
                    'id_periodo' => $periodo->id_periodo,
                    'id_unidad' => $idUnidad,
                    'id_ocupacion' => $ocupacion?->id_ocupacion,
                    'lectura_anterior' => $lecturaAnterior,
                    'lectura_actual' => $lecturaAnterior,
                    'fecha_lectura' => $periodo->fecha_fin,
                    'estado' => 'REGISTRADO',
                ]);
                $insertados++;
            }
        });

        return ['insertados' => $insertados, 'actualizados' => $actualizados];
    }

    /**
     * Filas para la pantalla de Lecturas: consumo calculado + el estado de
     * auditoria (compara lectura_anterior contra la ultima lectura_actual real
     * del periodo previo, igual que lecturas/index.php).
     */
    public function filasParaPeriodo(Periodo $periodo): array
    {
        $rows = LecturaUnidad::query()
            ->select([
                'lecturas_unidad.id_lectura', 'unidades.id_unidad', 'unidades.codigo_unidad',
                'unidades.nombre_unidad', 'unidades.piso',
                'lecturas_unidad.lectura_anterior', 'lecturas_unidad.lectura_actual',
                'ocupacion_unidad.monto_alquiler',
                DB::raw("CONCAT(COALESCE(personas.nombres,''), ' ', COALESCE(personas.apellidos,'')) as inquilino"),
            ])
            ->join('unidades', 'unidades.id_unidad', '=', 'lecturas_unidad.id_unidad')
            ->leftJoin('ocupacion_unidad', 'ocupacion_unidad.id_ocupacion', '=', 'lecturas_unidad.id_ocupacion')
            ->leftJoin('personas', 'personas.id_persona', '=', 'ocupacion_unidad.id_persona')
            ->where('lecturas_unidad.id_periodo', $periodo->id_periodo)
            ->orderBy('unidades.codigo_unidad')
            ->get();

        return $rows->map(function ($row) use ($periodo) {
            $referencia = LecturaUnidad::join('periodos', 'periodos.id_periodo', '=', 'lecturas_unidad.id_periodo')
                ->where('lecturas_unidad.id_unidad', $row->id_unidad)
                ->where('periodos.fecha_fin', '<', $periodo->fecha_inicio)
                ->orderByDesc('periodos.fecha_fin')->orderByDesc('lecturas_unidad.id_lectura')
                ->value('lecturas_unidad.lectura_actual');

            $auditoria = 'SIN_HISTORICO';
            if ($referencia !== null) {
                $actual = round((float) $row->lectura_anterior, 2);
                $esperado = round((float) $referencia, 2);
                $auditoria = abs($actual - $esperado) < 0.01 ? 'OK' : 'REVISAR';
            }

            return [
                'id_lectura' => $row->id_lectura,
                'id_unidad' => $row->id_unidad,
                'codigo_unidad' => $row->codigo_unidad,
                'nombre_unidad' => $row->nombre_unidad,
                'piso' => $row->piso,
                'lectura_anterior' => (float) $row->lectura_anterior,
                'lectura_actual' => (float) $row->lectura_actual,
                'consumo' => round(max($row->lectura_actual - $row->lectura_anterior, 0), 2),
                'lectura_referencia_anterior' => $referencia !== null ? round((float) $referencia, 2) : null,
                'auditoria_lectura_anterior' => $auditoria,
                'inquilino' => trim($row->inquilino),
                'monto_alquiler' => $row->monto_alquiler,
            ];
        })->all();
    }
}
