<?php

namespace App\Services;

use App\Models\CobroMensual;
use App\Models\LecturaCorte;
use App\Models\LecturaUnidad;
use App\Models\OcupacionUnidad;
use App\Models\Pago;
use App\Models\Periodo;
use App\Models\TrasladoOcupacion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Traslado de un inquilino a otra unidad dentro del mismo periodo -- un
 * solo paso en vez de lo que hoy se hace a mano en dos pantallas
 * (Finalizar la ocupacion vieja + Crear una nueva), y de paso captura las
 * dos lecturas de corte en el momento exacto en que el admin tiene los
 * numeros del medidor en la mano (que es justo el problema que origino
 * toda esta migracion -- ver docs/implementacion-ocupaciones-parciales.md).
 *
 * La garantia se traslada tal cual (decision 5.10); el alquiler de la
 * unidad destino es un dato nuevo (unidades distintas, precios distintos).
 * El prorrateo por dias de ambos tramos ya lo resuelve CobroService
 * automaticamente (Fase 2) -- este service no calcula plata, solo arma la
 * ocupacion, el vinculo, y las dos lecturas de corte.
 */
class TrasladoService
{
    public function trasladar(
        Periodo $periodo,
        int $idOcupacionOrigen,
        int $idUnidadDestino,
        string $fechaTraslado,
        float $lecturaCorteOrigen,
        float $lecturaCorteDestino,
        float $montoAlquilerDestino,
        ?string $observacion,
        string $actor
    ): TrasladoOcupacion {
        $periodo->assertEditable();

        $origen = OcupacionUnidad::where('id_ocupacion', $idOcupacionOrigen)->where('estado', 'ACTIVO')->first();
        if (!$origen) {
            throw ValidationException::withMessages(['general' => 'La ocupación de origen no existe o ya no está activa.']);
        }

        if ((int) $origen->id_unidad === $idUnidadDestino) {
            throw ValidationException::withMessages(['id_unidad_destino' => 'La unidad destino no puede ser la misma que la de origen.']);
        }

        $destinoOcupada = OcupacionUnidad::where('id_unidad', $idUnidadDestino)->where('estado', 'ACTIVO')->exists();
        if ($destinoOcupada) {
            throw ValidationException::withMessages(['id_unidad_destino' => 'La unidad destino ya tiene una ocupación activa.']);
        }

        if ($fechaTraslado < $periodo->fecha_inicio->toDateString() || $fechaTraslado >= $periodo->fecha_fin->toDateString()) {
            throw ValidationException::withMessages(['fecha_traslado' => 'La fecha debe caer dentro del período, antes de su fecha de cierre (esa la cubre "Actual").']);
        }

        $tienePagos = Pago::whereIn('id_cobro', CobroMensual::where('id_periodo', $periodo->id_periodo)->pluck('id_cobro'))->exists();
        if ($tienePagos) {
            throw ValidationException::withMessages(['general' => 'Este período ya tiene pagos registrados -- no se pueden registrar traslados nuevos.']);
        }

        foreach ([(int) $origen->id_unidad, $idUnidadDestino] as $idUnidad) {
            $tieneLectura = LecturaUnidad::where('id_periodo', $periodo->id_periodo)->where('id_unidad', $idUnidad)->exists();
            if (!$tieneLectura) {
                throw ValidationException::withMessages(['general' => 'Sincronizá las unidades de este período antes de registrar un traslado.']);
            }

            $yaExisteCorte = LecturaCorte::where('id_periodo', $periodo->id_periodo)->where('id_unidad', $idUnidad)->where('fecha_corte', $fechaTraslado)->exists();
            if ($yaExisteCorte) {
                throw ValidationException::withMessages(['fecha_traslado' => 'Ya existe un corte registrado en esa fecha para alguna de las dos unidades.']);
            }
        }

        return DB::transaction(function () use ($periodo, $origen, $idUnidadDestino, $fechaTraslado, $lecturaCorteOrigen, $lecturaCorteDestino, $montoAlquilerDestino, $observacion, $actor) {
            $origen->update([
                'estado' => 'FINALIZADO',
                'fecha_fin' => $fechaTraslado,
                'motivo_fin' => 'MUDANZA',
                'motivo_fin_detalle' => $observacion,
            ]);

            $destino = OcupacionUnidad::create([
                'id_unidad' => $idUnidadDestino,
                'id_persona' => $origen->id_persona,
                'fecha_inicio' => Carbon::parse($fechaTraslado)->addDay()->toDateString(),
                'monto_alquiler' => $montoAlquilerDestino,
                'garantia' => $origen->garantia,
                'estado' => 'ACTIVO',
                'observacion' => $observacion,
            ]);

            LecturaCorte::create([
                'id_periodo' => $periodo->id_periodo,
                'id_unidad' => $origen->id_unidad,
                'fecha_corte' => $fechaTraslado,
                'id_ocupacion_sale' => $origen->id_ocupacion,
                'id_ocupacion_entra' => null,
                'lectura_corte' => $lecturaCorteOrigen,
                'origen' => 'AUTO',
                'observacion' => 'Traslado a otra unidad',
                'registrado_por' => $actor,
            ]);

            LecturaCorte::create([
                'id_periodo' => $periodo->id_periodo,
                'id_unidad' => $idUnidadDestino,
                'fecha_corte' => $fechaTraslado,
                'id_ocupacion_sale' => null,
                'id_ocupacion_entra' => $destino->id_ocupacion,
                'lectura_corte' => $lecturaCorteDestino,
                'origen' => 'AUTO',
                'observacion' => 'Traslado desde otra unidad',
                'registrado_por' => $actor,
            ]);

            return TrasladoOcupacion::create([
                'id_ocupacion_origen' => $origen->id_ocupacion,
                'id_ocupacion_destino' => $destino->id_ocupacion,
                'fecha_traslado' => $fechaTraslado,
                'observacion' => $observacion,
                'creado_por' => $actor,
            ]);
        });
    }
}
