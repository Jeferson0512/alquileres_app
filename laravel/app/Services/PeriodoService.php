<?php

namespace App\Services;

use App\Models\Periodo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PeriodoService
{
    /**
     * Replica la logica de api/modules/periodos/index.php (POST):
     * valida año/mes, calcula fechas por defecto, evita duplicados y
     * solapamientos, exige que el periodo nuevo empiece justo el dia
     * siguiente al cierre del ultimo periodo, y cierra ese ultimo
     * periodo automaticamente.
     */
    public function crear(array $datos): Periodo
    {
        $anio = (int) ($datos['anio'] ?? 0);
        $mes = (int) ($datos['mes'] ?? 0);
        $estado = $datos['estado'] ?? 'ABIERTO';
        $observacion = $datos['observacion'] ?? null;

        if ($anio < 2000 || $mes < 1 || $mes > 12) {
            throw ValidationException::withMessages(['anio' => 'Año y mes inválidos']);
        }

        $fechaInicio = $datos['fecha_inicio'] ?? sprintf('%04d-%02d-01', $anio, $mes);
        $fechaInicio = Carbon::parse($fechaInicio)->toDateString();

        $fechaFin = $datos['fecha_fin'] ?? Carbon::parse($fechaInicio)->endOfMonth()->toDateString();
        $fechaFin = Carbon::parse($fechaFin)->toDateString();

        if ($fechaInicio > $fechaFin) {
            throw ValidationException::withMessages(['fecha_fin' => 'La fecha de inicio debe ser anterior o igual a la fecha de fin']);
        }

        if (!in_array($estado, ['ABIERTO', 'CERRADO', 'ANULADO'], true)) {
            $estado = 'ABIERTO';
        }

        if (Periodo::where('anio', $anio)->where('mes', $mes)->exists()) {
            throw ValidationException::withMessages(['mes' => 'Ya existe un periodo para ese año y mes']);
        }

        $solapa = Periodo::whereNot(function ($q) use ($fechaInicio, $fechaFin) {
            $q->where('fecha_fin', '<', $fechaInicio)->orWhere('fecha_inicio', '>', $fechaFin);
        })->exists();

        if ($solapa) {
            throw ValidationException::withMessages(['fecha_inicio' => 'El periodo se superpone con otro periodo existente']);
        }

        $ultimoPeriodo = Periodo::whereIn('estado', ['ABIERTO', 'CERRADO'])
            ->orderByDesc('fecha_fin')
            ->first();

        if ($ultimoPeriodo) {
            $fechaEsperada = Carbon::parse($ultimoPeriodo->fecha_fin)->addDay()->toDateString();
            if ($fechaInicio !== $fechaEsperada) {
                throw ValidationException::withMessages([
                    'fecha_inicio' => "La fecha de inicio debe ser {$fechaEsperada} (día siguiente al cierre del último periodo registrado)",
                ]);
            }
        }

        return DB::transaction(function () use ($anio, $mes, $fechaInicio, $fechaFin, $estado, $observacion, $ultimoPeriodo) {
            $periodo = Periodo::create([
                'anio' => $anio,
                'mes' => $mes,
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
                'estado' => $estado,
                'observacion' => $observacion,
            ]);

            if ($ultimoPeriodo) {
                Periodo::where('id_periodo', $ultimoPeriodo->id_periodo)
                    ->where('estado', 'ABIERTO')
                    ->update(['estado' => 'CERRADO']);
            }

            return $periodo;
        });
    }
}
