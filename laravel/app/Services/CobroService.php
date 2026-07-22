<?php

namespace App\Services;

use App\Models\CobroMensual;
use App\Models\CobroMensualDetalle;
use App\Models\CobroOverrideServicio;
use App\Models\ConceptoCobro;
use App\Models\Inmueble;
use App\Models\Pago;
use App\Models\PagoAuditoria;
use App\Models\PagoDetalle;
use App\Models\Periodo;
use App\Models\TarifaServicio;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Replica api/modules/cobros/{common,index,generate,force-refresh}.php.
 * "Programado" = lo que el sistema calcula que DEBERIA cobrarse este
 * periodo; distinto de lo que ya quedo grabado (snapshot) en
 * cobros_mensuales, que una vez generado no cambia solo.
 */
class CobroService
{
    public static function key(int $idUnidad, int $idPersona): string
    {
        return "{$idUnidad}:{$idPersona}";
    }

    /**
     * Si un override de AGUA del periodo anterior quedo por ENCIMA de la
     * tarifa estandar, se traslada automaticamente al periodo actual — asi
     * un ajuste manual (ej. exceso de consumo de agua) sigue aplicando mes
     * a mes hasta que se corrija a mano.
     */
    public function carryForwardOverride(Periodo $periodo, string $servicio = 'AGUA'): void
    {
        $anterior = $periodo->anterior();
        if (!$anterior) {
            return;
        }

        $idInmueble = Inmueble::activoActual()->id_inmueble;
        $tarifaEstandar = (float) (TarifaServicio::where('id_inmueble', $idInmueble)->where('servicio', $servicio)->where('activo', 1)->value('monto') ?? 0);

        $overridesAnteriores = CobroOverrideServicio::where('id_periodo', $anterior->id_periodo)->where('servicio', $servicio)->get();

        foreach ($overridesAnteriores as $overrideAnterior) {
            if ((float) $overrideAnterior->monto <= $tarifaEstandar) {
                continue;
            }

            CobroOverrideServicio::updateOrCreate(
                ['id_periodo' => $periodo->id_periodo, 'id_unidad' => $overrideAnterior->id_unidad, 'id_persona' => $overrideAnterior->id_persona, 'servicio' => $servicio],
                ['monto' => $overrideAnterior->monto, 'observacion' => 'Carry-over automático desde periodo anterior']
            );
        }
    }

    private function armarFilaCobro(int $idUnidad, int $idPersona, float $montoAlquiler, float $montoLuz, float $ajusteMinimoLuz, array $overridesByKey, float $tarifaAgua, float $tarifaGas, float $tarifaMant, ?string $fechaVencimiento): array
    {
        $montoAlquiler = round($montoAlquiler, 2);
        $montoLuz = round($montoLuz, 2);
        $ajusteMinimoLuz = round($ajusteMinimoLuz, 2);

        $keyBase = self::key($idUnidad, $idPersona);
        $montoAgua = round($overridesByKey["{$keyBase}:AGUA"] ?? $tarifaAgua, 2);
        $montoGas = round($overridesByKey["{$keyBase}:GAS"] ?? $tarifaGas, 2);
        $montoOtros = round($overridesByKey["{$keyBase}:MANTENIMIENTO"] ?? $tarifaMant, 2);
        $totalCobrar = round($montoAlquiler + $montoLuz + $ajusteMinimoLuz + $montoAgua + $montoGas + $montoOtros, 2);

        $observacion = 'Cobro generado desde Laravel';
        if ($ajusteMinimoLuz > 0) {
            $observacion .= ' | Ajuste mínimo luz: S/ ' . number_format($ajusteMinimoLuz, 2, '.', '');
        }

        $detalles = [
            ['codigo' => 'ALQUILER', 'monto' => $montoAlquiler, 'descripcion' => 'Alquiler', 'orden_visual' => 10],
            ['codigo' => 'LUZ', 'monto' => $montoLuz, 'descripcion' => 'Luz', 'orden_visual' => 20],
            ['codigo' => 'AJUSTE_MINIMO_LUZ', 'monto' => $ajusteMinimoLuz, 'descripcion' => 'Ajuste mínimo luz', 'orden_visual' => 30],
            ['codigo' => 'AGUA', 'monto' => $montoAgua, 'descripcion' => 'Agua', 'orden_visual' => 40],
            ['codigo' => 'GAS', 'monto' => $montoGas, 'descripcion' => 'Gas', 'orden_visual' => 50],
            ['codigo' => 'OTROS', 'monto' => $montoOtros, 'descripcion' => 'Otros conceptos', 'orden_visual' => 60],
        ];

        return [
            'key' => $keyBase,
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
            'monto_alquiler' => $montoAlquiler,
            'monto_luz' => $montoLuz,
            'ajuste_minimo_luz' => $ajusteMinimoLuz,
            'monto_agua' => $montoAgua,
            'monto_gas' => $montoGas,
            'otros_conceptos' => $montoOtros,
            'total_cobrar' => $totalCobrar,
            'fecha_vencimiento' => $fechaVencimiento,
            'observacion' => $observacion,
            'detalles' => array_values(array_filter($detalles, fn ($d) => (float) $d['monto'] > 0)),
        ];
    }

    public function buildProgramados(Periodo $periodo): array
    {
        $idInmueble = Inmueble::activoActual()->id_inmueble;
        $recibo = DB::table('recibos_luz')->where('id_periodo', $periodo->id_periodo)->first();
        $fechaVencimiento = $recibo->fecha_vencimiento ?? $periodo->fecha_fin;

        $tarifas = TarifaServicio::where('id_inmueble', $idInmueble)->where('activo', 1)->pluck('monto', 'servicio');
        $tarifaAgua = (float) ($tarifas['AGUA'] ?? 15.0);
        $tarifaGas = (float) ($tarifas['GAS'] ?? 0.0);
        $tarifaMant = (float) ($tarifas['MANTENIMIENTO'] ?? 0.0);
        $montoMinimoLuz = (float) (DB::table('config_cobranza')->where('id_inmueble', $idInmueble)->value('monto_minimo_luz') ?? 0);

        $overridesByKey = [];
        foreach (CobroOverrideServicio::where('id_periodo', $periodo->id_periodo)->get() as $override) {
            $overridesByKey[self::key($override->id_unidad, $override->id_persona) . ':' . $override->servicio] = (float) $override->monto;
        }

        $medidorPorTitular = [];
        foreach (DB::table('unidades_medidor_compartido')->where('activo', 1)->get() as $relacion) {
            $medidorPorTitular[$relacion->id_unidad_titular] = [
                'id_unidad_dependiente' => $relacion->id_unidad_dependiente,
                'porcentaje_dependiente' => (float) $relacion->porcentaje_dependiente,
            ];
        }

        $rows = DB::table('liquidacion_luz_detalle as ll')
            ->join('lecturas_unidad as l', 'l.id_lectura', '=', 'll.id_lectura')
            ->join('ocupacion_unidad as o', 'o.id_ocupacion', '=', 'l.id_ocupacion')
            ->where('ll.id_periodo', $periodo->id_periodo)
            ->get(['ll.id_unidad', 'll.id_persona', 'll.total_pagar_luz', 'o.monto_alquiler']);

        $resultado = [];
        foreach ($rows as $row) {
            $idUnidad = (int) $row->id_unidad;
            $idPersona = (int) $row->id_persona;
            $montoLuzTotal = round((float) $row->total_pagar_luz, 2);
            $montoAlquiler = round((float) $row->monto_alquiler, 2);
            $montoLuzTitular = $montoLuzTotal;
            $filaDependiente = null;

            $relacion = $medidorPorTitular[$idUnidad] ?? null;
            if ($relacion && $relacion['porcentaje_dependiente'] > 0) {
                $ocupacionDependiente = DB::table('ocupacion_unidad')
                    ->where('id_unidad', $relacion['id_unidad_dependiente'])->where('estado', 'ACTIVO')
                    ->first();

                if ($ocupacionDependiente) {
                    $montoLuzDependiente = round($montoLuzTotal * $relacion['porcentaje_dependiente'] / 100, 2);
                    $montoLuzTitular = round($montoLuzTotal - $montoLuzDependiente, 2);

                    $filaDependiente = $this->armarFilaCobro(
                        $relacion['id_unidad_dependiente'], (int) $ocupacionDependiente->id_persona,
                        (float) $ocupacionDependiente->monto_alquiler, $montoLuzDependiente, 0.0,
                        $overridesByKey, $tarifaAgua, $tarifaGas, $tarifaMant, $fechaVencimiento
                    );
                }
            }

            $ajusteMinimoLuzTitular = $montoMinimoLuz > 0 && $montoLuzTitular < $montoMinimoLuz
                ? round($montoMinimoLuz - $montoLuzTitular, 2) : 0;

            $resultado[] = $this->armarFilaCobro($idUnidad, $idPersona, $montoAlquiler, $montoLuzTitular, $ajusteMinimoLuzTitular, $overridesByKey, $tarifaAgua, $tarifaGas, $tarifaMant, $fechaVencimiento);

            if ($filaDependiente !== null) {
                $resultado[] = $filaDependiente;
            }
        }

        return $resultado;
    }

    private function createDetalleLineas(int $idCobro, array $detalles, array $conceptosMap): void
    {
        foreach ($detalles as $detalle) {
            if (!isset($conceptosMap[$detalle['codigo']])) {
                continue;
            }

            CobroMensualDetalle::create([
                'id_cobro' => $idCobro,
                'id_concepto' => $conceptosMap[$detalle['codigo']],
                'monto_programado' => $detalle['monto'],
                'descripcion' => $detalle['descripcion'],
                'orden_visual' => $detalle['orden_visual'],
            ]);
        }
    }

    /**
     * Genera los cobros del periodo desde cero. Bloqueado si ya hay pagos
     * registrados (protege el historial) — para corregir un periodo con
     * pagos ya existentes hay que usar forceRefresh().
     */
    public function generar(Periodo $periodo): void
    {
        $this->carryForwardOverride($periodo, 'AGUA');
        $programados = $this->buildProgramados($periodo);

        $tienePagos = Pago::whereIn('id_cobro', CobroMensual::where('id_periodo', $periodo->id_periodo)->pluck('id_cobro'))->exists();
        if ($tienePagos) {
            throw ValidationException::withMessages(['general' => 'No se pueden regenerar los cobros de este periodo porque ya tiene pagos registrados. Esto protege el historial de pagos y saldos.']);
        }

        $conceptosMap = ConceptoCobro::mapaActivos();

        DB::transaction(function () use ($periodo, $programados, $conceptosMap) {
            $idsCobro = CobroMensual::where('id_periodo', $periodo->id_periodo)->pluck('id_cobro');
            CobroMensualDetalle::whereIn('id_cobro', $idsCobro)->delete();
            CobroMensual::where('id_periodo', $periodo->id_periodo)->delete();

            foreach ($programados as $row) {
                $cobro = CobroMensual::create([
                    'id_periodo' => $periodo->id_periodo,
                    'id_persona' => $row['id_persona'],
                    'id_unidad' => $row['id_unidad'],
                    'monto_alquiler' => $row['monto_alquiler'],
                    'monto_luz' => $row['monto_luz'],
                    'ajuste_minimo_luz' => $row['ajuste_minimo_luz'],
                    'monto_agua' => $row['monto_agua'],
                    'monto_gas' => $row['monto_gas'],
                    'otros_conceptos' => $row['otros_conceptos'],
                    'descuento' => 0,
                    'mora' => 0,
                    'total_cobrar' => $row['total_cobrar'],
                    'fecha_vencimiento' => $row['fecha_vencimiento'],
                    'estado_pago' => 'PENDIENTE',
                    'observacion' => $row['observacion'],
                ]);

                $this->createDetalleLineas($cobro->id_cobro, $row['detalles'], $conceptosMap);
            }
        });
    }

    /**
     * Filas para la pantalla de Cobros: pagado/saldo/deuda anterior calculados.
     */
    public function listarParaPeriodo(Periodo $periodo): array
    {
        $rows = DB::table('cobros_mensuales as c')
            ->join('unidades as u', 'u.id_unidad', '=', 'c.id_unidad')
            ->join('personas as p', 'p.id_persona', '=', 'c.id_persona')
            ->leftJoin('liquidacion_luz_detalle as ll', function ($j) {
                $j->on('ll.id_periodo', '=', 'c.id_periodo')->on('ll.id_unidad', '=', 'c.id_unidad')->on('ll.id_persona', '=', 'c.id_persona');
            })
            ->where('c.id_periodo', $periodo->id_periodo)
            ->where('c.estado_pago', '!=', 'ANULADO')
            ->orderBy('u.codigo_unidad')
            ->get([
                'c.id_cobro', 'c.id_persona', 'c.id_unidad', 'u.codigo_unidad', 'u.nombre_unidad',
                DB::raw("CONCAT(p.nombres, ' ', p.apellidos) as inquilino"),
                'll.consumo_kwh', 'c.monto_alquiler', 'c.monto_luz', 'c.ajuste_minimo_luz',
                'c.monto_agua', 'c.monto_gas', 'c.otros_conceptos', 'c.total_cobrar',
                'c.fecha_vencimiento', 'c.estado_pago', 'c.observacion',
            ]);

        return $rows->map(function ($row) use ($periodo) {
            $pagadoTotal = (float) (Pago::where('id_cobro', $row->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado'));
            $saldoPendiente = max((float) $row->total_cobrar - $pagadoTotal, 0);

            $deudaAnterior = (float) DB::table('cobros_mensuales as ca')
                ->join('periodos as pprev', 'pprev.id_periodo', '=', 'ca.id_periodo')
                ->where('ca.id_persona', $row->id_persona)
                ->where('ca.id_unidad', $row->id_unidad)
                ->where('ca.id_cobro', '!=', $row->id_cobro)
                ->where('ca.estado_pago', '!=', 'ANULADO')
                ->where('pprev.fecha_inicio', '<', $periodo->fecha_inicio)
                ->get(['ca.id_cobro', 'ca.total_cobrar'])
                ->sum(function ($ca) {
                    $pagado = (float) Pago::where('id_cobro', $ca->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado');
                    return max((float) $ca->total_cobrar - $pagado, 0);
                });

            return array_merge((array) $row, [
                'pagado_total' => round($pagadoTotal, 2),
                'saldo_pendiente' => round($saldoPendiente, 2),
                'deuda_anterior' => round($deudaAnterior, 2),
            ]);
        })->all();
    }

    // -------------------- forceRefresh --------------------

    private function detalleCodesByCobro(array $cobroIds): array
    {
        if ($cobroIds === []) {
            return [];
        }

        $rows = DB::table('cobros_mensuales_detalle as cd')
            ->join('conceptos_cobro as cc', 'cc.id_concepto', '=', 'cd.id_concepto')
            ->whereIn('cd.id_cobro', $cobroIds)
            ->orderBy('cc.prioridad_aplicacion')->orderBy('cd.orden_visual')
            ->get(['cd.id_cobro', 'cc.codigo', 'cd.id_cobro_detalle']);

        $result = [];
        foreach ($rows as $row) {
            $result[$row->id_cobro][$row->codigo] = $row->id_cobro_detalle;
        }

        return $result;
    }

    /**
     * Recalcula los cobros de un periodo que YA tiene pagos, preservando
     * (reversando y re-aplicando) los pagos activos, o descartando los que
     * se indiquen explicitamente. Si la estructura de conceptos cambio y no
     * hay pagos activos, directamente purga y regenera.
     */
    public function forceRefresh(Periodo $periodo, array $descartarPagoIds = []): array
    {
        $programados = $this->buildProgramados($periodo);
        $programadosByKey = collect($programados)->keyBy('key');

        $actuales = CobroMensual::where('id_periodo', $periodo->id_periodo)->where('estado_pago', '!=', 'ANULADO')->get();
        if ($actuales->isEmpty()) {
            throw ValidationException::withMessages(['general' => 'No existen cobros generados en este periodo. Usa primero la generación normal.']);
        }
        $actualesByKey = $actuales->keyBy(fn ($c) => self::key($c->id_unidad, $c->id_persona));

        $pagos = Pago::whereIn('id_cobro', $actuales->pluck('id_cobro'))->get();
        $pagosRegistrados = $pagos->filter(fn ($p) => $p->estado === 'REGISTRADO')->sortBy(fn ($p) => $p->fecha_pago . '#' . str_pad((string) $p->id_pago, 12, '0', STR_PAD_LEFT))->values();
        $descartarLookup = array_flip($descartarPagoIds);
        $pagosPreservados = $pagosRegistrados->reject(fn ($p) => isset($descartarLookup[$p->id_pago]))->values();

        $actualKeys = $actualesByKey->keys()->sort()->values()->all();
        $programmedKeys = $programadosByKey->keys()->sort()->values()->all();
        $structureChanged = $actualKeys !== $programmedKeys;

        $conceptosMap = ConceptoCobro::mapaActivos();
        $detalleCodesByCobro = $this->detalleCodesByCobro($actuales->pluck('id_cobro')->all());

        if (!$structureChanged) {
            foreach ($actualesByKey as $key => $actual) {
                $expected = collect($programadosByKey[$key]['detalles'])->pluck('codigo')->sort()->values()->all();
                $current = collect(array_keys($detalleCodesByCobro[$actual->id_cobro] ?? []))->sort()->values()->all();
                if ($current !== $expected) {
                    $structureChanged = true;
                    break;
                }
            }
        }

        $actor = 'ADMIN_LARAVEL_FORCE_REFRESH';

        if ($structureChanged && $pagosRegistrados->isEmpty()) {
            DB::transaction(function () use ($periodo, $programados, $conceptosMap) {
                $idsCobro = CobroMensual::where('id_periodo', $periodo->id_periodo)->pluck('id_cobro');
                PagoAuditoria::whereIn('id_pago', Pago::whereIn('id_cobro', $idsCobro)->pluck('id_pago'))->delete();
                PagoDetalle::whereIn('id_pago', Pago::whereIn('id_cobro', $idsCobro)->pluck('id_pago'))->delete();
                Pago::whereIn('id_cobro', $idsCobro)->delete();
                CobroMensualDetalle::whereIn('id_cobro', $idsCobro)->delete();
                CobroMensual::where('id_periodo', $periodo->id_periodo)->delete();

                foreach ($programados as $row) {
                    $cobro = CobroMensual::create([
                        'id_periodo' => $periodo->id_periodo, 'id_persona' => $row['id_persona'], 'id_unidad' => $row['id_unidad'],
                        'monto_alquiler' => $row['monto_alquiler'], 'monto_luz' => $row['monto_luz'], 'ajuste_minimo_luz' => $row['ajuste_minimo_luz'],
                        'monto_agua' => $row['monto_agua'], 'monto_gas' => $row['monto_gas'], 'otros_conceptos' => $row['otros_conceptos'],
                        'descuento' => 0, 'mora' => 0, 'total_cobrar' => $row['total_cobrar'],
                        'fecha_vencimiento' => $row['fecha_vencimiento'], 'estado_pago' => 'PENDIENTE', 'observacion' => $row['observacion'],
                    ]);
                    $this->createDetalleLineas($cobro->id_cobro, $row['detalles'], $conceptosMap);
                }
            });

            return ['modo' => 'PURGE_REVERSED_REGENERATE', 'pagos_reversados' => 0, 'pagos_descartados' => 0, 'pagos_reaplicados' => 0];
        }

        if ($structureChanged) {
            throw ValidationException::withMessages(['general' => 'No se puede forzar la actualización porque una o más líneas de cobro por concepto cambiaron y existen pagos activos por preservar. Este caso requiere revisión manual.']);
        }

        DB::transaction(function () use ($pagosRegistrados, $pagosPreservados, $actualesByKey, $programadosByKey, $detalleCodesByCobro, $actor) {
            foreach ($pagosRegistrados as $pago) {
                $pago->update(['estado' => 'REVERSADO', 'reversado_por' => $actor, 'fecha_reversa' => now()->toDateString(), 'motivo_reversa' => 'Actualizacion forzada de cobros del periodo']);
                PagoAuditoria::create(['id_pago' => $pago->id_pago, 'accion' => 'REVERSADO', 'actor' => $actor, 'payload_after' => $pago->fresh()->toArray(), 'created_at' => now()]);
            }

            foreach ($actualesByKey as $key => $actual) {
                $programado = $programadosByKey[$key];
                $actual->update([
                    'monto_alquiler' => $programado['monto_alquiler'], 'monto_luz' => $programado['monto_luz'], 'ajuste_minimo_luz' => $programado['ajuste_minimo_luz'],
                    'monto_agua' => $programado['monto_agua'], 'monto_gas' => $programado['monto_gas'], 'otros_conceptos' => $programado['otros_conceptos'],
                    'total_cobrar' => $programado['total_cobrar'], 'fecha_vencimiento' => $programado['fecha_vencimiento'],
                    'estado_pago' => 'PENDIENTE', 'observacion' => $programado['observacion'],
                ]);

                $detalleIds = $detalleCodesByCobro[$actual->id_cobro] ?? [];
                foreach ($programado['detalles'] as $detalle) {
                    if (!isset($detalleIds[$detalle['codigo']])) {
                        throw new \RuntimeException('No se encontró la línea de detalle requerida para actualizar el cobro de forma segura.');
                    }
                    CobroMensualDetalle::where('id_cobro_detalle', $detalleIds[$detalle['codigo']])->update([
                        'monto_programado' => $detalle['monto'], 'descripcion' => $detalle['descripcion'], 'orden_visual' => $detalle['orden_visual'],
                    ]);
                }
            }

            foreach ($actualesByKey as $actual) {
                app(PagoService::class)->sincronizarEstadoCobro($actual->fresh());
            }

            foreach ($pagosPreservados as $pago) {
                app(PagoService::class)->reaplicarPago($pago, $actor);
            }
        });

        return [
            'modo' => 'PRESERVE_REPLAY',
            'pagos_reversados' => $pagosRegistrados->count(),
            'pagos_descartados' => $pagosRegistrados->count() - $pagosPreservados->count(),
            'pagos_reaplicados' => $pagosPreservados->count(),
        ];
    }
}
