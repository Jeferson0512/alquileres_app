<?php

namespace App\Services;

use App\Models\CobroMensual;
use App\Models\CobroMensualDetalle;
use App\Models\CobroOverrideServicio;
use App\Models\ConceptoCobro;
use App\Models\Inmueble;
use App\Models\OcupacionUnidad;
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
 *
 * Fase 2 (docs/implementacion-ocupaciones-parciales.md): cada fila
 * programada ahora es un TRAMO (LiquidacionService::repartirPorTramos()),
 * no una unidad -- una unidad con 2 tramos genera 2 cobros. Con una sola
 * ocupacion cubriendo el periodo (el caso de siempre) hay exactamente un
 * tramo y el resultado es identico al de antes de esta fase: el factor de
 * prorrateo dias_tramo/dias_periodo da 1.0 exacto.
 */
class CobroService
{
    /**
     * Identidad de un cobro: por ocupacion cuando se conoce (el caso
     * normal, viene de un tramo real), con fallback a persona solo para
     * cobros historicos de antes de que existiera id_ocupacion (ver
     * database/schema/cobros_id_ocupacion.sql -- 3 filas de la migracion
     * de Fase 0 se quedaron sin poder backfillearse, ver ese script para
     * el porque). Prefijos o/p para que un id_ocupacion y un id_persona
     * con el mismo numero nunca choquen.
     */
    public static function key(int $idUnidad, ?int $idOcupacion, ?int $idPersona = null): string
    {
        return $idOcupacion !== null ? "{$idUnidad}:o{$idOcupacion}" : "{$idUnidad}:p{$idPersona}";
    }

    private static function overrideKey(int $idUnidad, int $idPersona): string
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

    /**
     * $factor = dias_tramo/dias_periodo se aplica a alquiler y a las
     * tarifas fijas (agua/gas/mantenimiento) -- misma categoria de cargo
     * fijo que el alquiler, prorratea igual (decision 5.1/5.2). La luz NO
     * lleva factor: ya viene prorrateada de origen, es el total_pagar_luz
     * de ESTE tramo (LiquidacionService::repartirPorTramos()). El ajuste
     * de minimo tampoco -- ya es la porcion de ESTE tramo (ver
     * buildProgramados()).
     */
    private function armarFilaCobro(int $idUnidad, int $idOcupacion, int $idPersona, float $montoAlquilerBase, float $montoLuz, float $ajusteMinimoLuz, array $overridesByKey, float $tarifaAgua, float $tarifaGas, float $tarifaMant, ?string $fechaVencimiento, float $factor, float $consumoKwh, int $diasTramo): array
    {
        $montoLuz = round($montoLuz, 2);
        $ajusteMinimoLuz = round($ajusteMinimoLuz, 2);
        $montoAlquiler = round($montoAlquilerBase * $factor, 2);

        $overrideKey = self::overrideKey($idUnidad, $idPersona);
        $baseAgua = $overridesByKey["{$overrideKey}:AGUA"] ?? $tarifaAgua;
        $baseGas = $overridesByKey["{$overrideKey}:GAS"] ?? $tarifaGas;
        $baseMant = $overridesByKey["{$overrideKey}:MANTENIMIENTO"] ?? $tarifaMant;
        $montoAgua = round($baseAgua * $factor, 2);
        $montoGas = round($baseGas * $factor, 2);
        $montoOtros = round($baseMant * $factor, 2);
        $totalCobrar = round($montoAlquiler + $montoLuz + $ajusteMinimoLuz + $montoAgua + $montoGas + $montoOtros, 2);

        $observacion = 'Cobro generado desde Laravel';
        if ($ajusteMinimoLuz > 0) {
            $observacion .= ' | Ajuste mínimo luz: S/ ' . number_format($ajusteMinimoLuz, 2, '.', '');
        }
        if ($factor < 0.999) {
            $observacion .= " | Tramo parcial: {$diasTramo} día(s) de este período";
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
            'key' => self::key($idUnidad, $idOcupacion),
            'id_unidad' => $idUnidad,
            'id_ocupacion' => $idOcupacion,
            'id_persona' => $idPersona,
            'consumo_kwh' => round($consumoKwh, 2),
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
        $diasPeriodo = (int) $periodo->fecha_inicio->diffInDays($periodo->fecha_fin) + 1;

        $tarifas = TarifaServicio::where('id_inmueble', $idInmueble)->where('activo', 1)->pluck('monto', 'servicio');
        $tarifaAgua = (float) ($tarifas['AGUA'] ?? 15.0);
        $tarifaGas = (float) ($tarifas['GAS'] ?? 0.0);
        $tarifaMant = (float) ($tarifas['MANTENIMIENTO'] ?? 0.0);
        $montoMinimoLuz = (float) (DB::table('config_cobranza')->where('id_inmueble', $idInmueble)->value('monto_minimo_luz') ?? 0);

        $overridesByKey = [];
        foreach (CobroOverrideServicio::where('id_periodo', $periodo->id_periodo)->get() as $override) {
            $overridesByKey[self::overrideKey($override->id_unidad, $override->id_persona) . ':' . $override->servicio] = (float) $override->monto;
        }

        $medidorPorTitular = [];
        foreach (DB::table('unidades_medidor_compartido')->where('activo', 1)->get() as $relacion) {
            $medidorPorTitular[$relacion->id_unidad_titular] = [
                'id_unidad_dependiente' => $relacion->id_unidad_dependiente,
                'porcentaje_dependiente' => (float) $relacion->porcentaje_dependiente,
            ];
        }

        $tramos = DB::table('liquidacion_luz_tramo as t')
            ->where('t.id_periodo', $periodo->id_periodo)
            ->whereNotNull('t.id_ocupacion') // un tramo vacante nunca genera cobro
            ->orderBy('t.id_unidad')->orderBy('t.fecha_desde')
            ->get(['t.id_unidad', 't.id_ocupacion', 't.id_persona', 't.fecha_desde', 't.fecha_hasta', 't.dias', 't.consumo_kwh', 't.total_pagar_luz']);

        $idsOcupacion = $tramos->pluck('id_ocupacion')->unique()->all();
        $alquilerPorOcupacion = DB::table('ocupacion_unidad')->whereIn('id_ocupacion', $idsOcupacion)->pluck('monto_alquiler', 'id_ocupacion');

        // El minimo de luz es por UNIDAD (decision 5.5), no por tramo --
        // liquidacion_luz_detalle.total_pagar_luz ya es la suma exacta de
        // los tramos de esa unidad, se lee directo en vez de re-sumar.
        $totalLuzPorUnidad = DB::table('liquidacion_luz_detalle')->where('id_periodo', $periodo->id_periodo)->pluck('total_pagar_luz', 'id_unidad');

        $resultado = [];
        foreach ($tramos->groupBy('id_unidad') as $idUnidad => $tramosUnidad) {
            $tramosUnidad = $tramosUnidad->values();
            $totalLuzUnidad = (float) ($totalLuzPorUnidad[$idUnidad] ?? 0);
            $ajusteMinimoUnidad = $montoMinimoLuz > 0 && $totalLuzUnidad < $montoMinimoLuz
                ? round($montoMinimoLuz - $totalLuzUnidad, 2) : 0.0;

            $n = $tramosUnidad->count();
            $acumuladoMinimo = 0.0;

            foreach ($tramosUnidad as $i => $tramo) {
                $idOcupacion = (int) $tramo->id_ocupacion;
                $idPersona = (int) $tramo->id_persona;
                $diasTramo = (int) $tramo->dias;
                $factor = $diasPeriodo > 0 ? $diasTramo / $diasPeriodo : 1.0;
                $montoLuzTramo = round((float) $tramo->total_pagar_luz, 2);
                $montoAlquilerBase = (float) ($alquilerPorOcupacion[$idOcupacion] ?? 0);

                if ($ajusteMinimoUnidad > 0) {
                    $pesoTramo = $totalLuzUnidad > 0 ? ($montoLuzTramo / $totalLuzUnidad) : (1 / $n);
                    $ajusteMinimoTramo = $i === $n - 1
                        ? round($ajusteMinimoUnidad - $acumuladoMinimo, 2)
                        : round($ajusteMinimoUnidad * $pesoTramo, 2);
                    $acumuladoMinimo += $ajusteMinimoTramo;
                } else {
                    $ajusteMinimoTramo = 0.0;
                }

                $montoLuzTitular = $montoLuzTramo;
                $filaDependiente = null;

                $relacion = $medidorPorTitular[$idUnidad] ?? null;
                if ($relacion && $relacion['porcentaje_dependiente'] > 0) {
                    // Vigente durante ESTE tramo del titular (no todo el
                    // periodo) -- si el dependiente tambien cambiara de
                    // ocupacion a mitad de este tramo especifico, se le
                    // atribuye a quien este vigente al cierre del tramo,
                    // mismo criterio que lecturas_unidad. Sub-dividir la
                    // porcion del dependiente en sus propios tramos si
                    // *el* tambien tuviera mas de uno queda para cuando
                    // haga falta -- hoy no hay ninguna relacion activa en
                    // produccion (unidades_medidor_compartido vacia).
                    $ocupacionDependiente = DB::table('ocupacion_unidad')
                        ->where('id_unidad', $relacion['id_unidad_dependiente'])
                        ->where('estado', '!=', 'ANULADO')
                        ->where('fecha_inicio', '<=', $tramo->fecha_hasta)
                        ->where(function ($q) use ($tramo) {
                            $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $tramo->fecha_desde);
                        })
                        ->orderByDesc('fecha_inicio')->orderByDesc('id_ocupacion')
                        ->first();

                    if ($ocupacionDependiente) {
                        $montoLuzDependiente = round($montoLuzTramo * $relacion['porcentaje_dependiente'] / 100, 2);
                        $montoLuzTitular = round($montoLuzTramo - $montoLuzDependiente, 2);

                        $filaDependiente = $this->armarFilaCobro(
                            $relacion['id_unidad_dependiente'], (int) $ocupacionDependiente->id_ocupacion, (int) $ocupacionDependiente->id_persona,
                            (float) $ocupacionDependiente->monto_alquiler, $montoLuzDependiente, 0.0,
                            $overridesByKey, $tarifaAgua, $tarifaGas, $tarifaMant, $fechaVencimiento,
                            $factor, 0.0, $diasTramo
                        );
                    }
                }

                $resultado[] = $this->armarFilaCobro(
                    (int) $idUnidad, $idOcupacion, $idPersona, $montoAlquilerBase, $montoLuzTitular, $ajusteMinimoTramo,
                    $overridesByKey, $tarifaAgua, $tarifaGas, $tarifaMant, $fechaVencimiento,
                    $factor, (float) $tramo->consumo_kwh, $diasTramo
                );

                if ($filaDependiente !== null) {
                    $resultado[] = $filaDependiente;
                }
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
     * pagos ya existentes hay que usar forceRefresh(). LiquidacionService
     * ya bloquea antes si falta algun corte (decision 5.8) -- si
     * buildProgramados() corre es porque liquidacion_luz_tramo ya esta
     * completo para este periodo.
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
                    'id_ocupacion' => $row['id_ocupacion'],
                    'consumo_kwh' => $row['consumo_kwh'],
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
     * Cartera vencida: cobros con saldo de PERIODOS ANTERIORES al periodo
     * actualmente ABIERTO -- a proposito independiente del periodo que el
     * admin tenga seleccionado en el filtro de la pantalla de Cobros, para
     * que esta lista no "desaparezca" solo porque cambio de mes a revisar.
     */
    public function carteraVencida(): array
    {
        $abierto = Periodo::where('estado', 'ABIERTO')->orderByDesc('anio')->orderByDesc('mes')->first()
            ?? Periodo::orderByDesc('anio')->orderByDesc('mes')->firstOrFail();

        $rows = DB::table('cobros_mensuales as c')
            ->join('periodos as per', 'per.id_periodo', '=', 'c.id_periodo')
            ->join('unidades as u', 'u.id_unidad', '=', 'c.id_unidad')
            ->join('personas as p', 'p.id_persona', '=', 'c.id_persona')
            ->where('per.fecha_fin', '<', $abierto->fecha_inicio)
            ->whereIn('c.estado_pago', ['PENDIENTE', 'PARCIAL'])
            ->orderBy('per.anio')->orderBy('per.mes')->orderBy('u.codigo_unidad')
            ->get([
                'c.id_cobro', 'c.id_persona', 'c.id_unidad', 'u.codigo_unidad',
                'per.anio', 'per.mes',
                DB::raw("CONCAT(p.nombres, ' ', p.apellidos) as inquilino"),
                'c.total_cobrar', 'c.fecha_vencimiento', 'c.estado_pago',
            ]);

        return $rows->map(function ($row) {
            $pagadoTotal = (float) Pago::where('id_cobro', $row->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado');
            $saldoPendiente = max((float) $row->total_cobrar - $pagadoTotal, 0);

            return array_merge((array) $row, [
                'periodo_label' => sprintf('%02d/%d', $row->mes, $row->anio),
                'pagado_total' => round($pagadoTotal, 2),
                'saldo_pendiente' => round($saldoPendiente, 2),
            ]);
        })
            ->filter(fn ($row) => $row['saldo_pendiente'] > 0.009)
            ->values()
            ->all();
    }

    /**
     * Filas para la pantalla de Cobros: pagado/saldo/deuda anterior calculados.
     */
    public function listarParaPeriodo(Periodo $periodo): array
    {
        $diasPeriodo = (int) $periodo->fecha_inicio->diffInDays($periodo->fecha_fin) + 1;

        $rows = DB::table('cobros_mensuales as c')
            ->join('unidades as u', 'u.id_unidad', '=', 'c.id_unidad')
            ->join('personas as p', 'p.id_persona', '=', 'c.id_persona')
            // Solo para mostrar el rango de fechas cuando el cobro es de un
            // tramo parcial (traslado, cambio de inquilino a mitad de
            // periodo) -- el join es 1:1 porque una ocupacion aparece a lo
            // sumo una vez por periodo en liquidacion_luz_tramo.
            ->leftJoin('liquidacion_luz_tramo as t', function ($j) {
                $j->on('t.id_periodo', '=', 'c.id_periodo')
                    ->on('t.id_unidad', '=', 'c.id_unidad')
                    ->on('t.id_ocupacion', '=', 'c.id_ocupacion');
            })
            ->where('c.id_periodo', $periodo->id_periodo)
            ->where('c.estado_pago', '!=', 'ANULADO')
            ->orderBy('u.codigo_unidad')
            ->get([
                'c.id_cobro', 'c.id_persona', 'c.id_unidad', 'c.id_ocupacion', 'u.codigo_unidad', 'u.nombre_unidad',
                'p.nombres', 'p.apellidos', 'p.celular',
                DB::raw("CONCAT(p.nombres, ' ', p.apellidos) as inquilino"),
                // Snapshot propio del cobro, no un join a la liquidacion --
                // con mas de un tramo por unidad, matchear liquidacion por
                // (periodo,unidad,persona) dejaba de encontrar al saliente.
                // De paso arregla que regenerar una liquidacion vieja podia
                // cambiar los kWh impresos en un recibo ya cobrado (RF-16).
                'c.consumo_kwh', 'c.monto_alquiler', 'c.monto_luz', 'c.ajuste_minimo_luz',
                'c.monto_agua', 'c.monto_gas', 'c.otros_conceptos', 'c.total_cobrar',
                'c.fecha_vencimiento', 'c.estado_pago', 'c.observacion',
                't.fecha_desde as tramo_desde', 't.fecha_hasta as tramo_hasta', 't.dias as tramo_dias',
            ]);

        // Consumo del PERIODO COMPLETO de cada unidad (todos sus
        // tramos/cobros sumados) -- decision 5.6: minimo_kwh_aviso se
        // evalua contra esto, no contra el consumo propio de cada tramo
        // (un tramo corto individual casi siempre da por debajo del
        // minimo aunque el total del mes sea consumo normal).
        $consumoPeriodoPorUnidad = DB::table('cobros_mensuales')
            ->where('id_periodo', $periodo->id_periodo)
            ->where('estado_pago', '!=', 'ANULADO')
            ->groupBy('id_unidad')
            ->pluck(DB::raw('SUM(consumo_kwh)'), 'id_unidad');

        // Badge "Traslado" (decision 5.12/3.6): para cada cobro de este
        // periodo que sea un lado de un traslado, el codigo de la unidad
        // COMPLEMENTARIA -- una sola consulta por (origen, destino) en vez
        // de una por fila.
        $idsOcupacion = $rows->pluck('id_ocupacion')->filter()->unique()->all();
        $trasladoPorOcupacion = [];
        foreach (DB::table('traslados_ocupacion as t')
            ->join('ocupacion_unidad as oo', 'oo.id_ocupacion', '=', 't.id_ocupacion_origen')
            ->join('ocupacion_unidad as od', 'od.id_ocupacion', '=', 't.id_ocupacion_destino')
            ->join('unidades as uo', 'uo.id_unidad', '=', 'oo.id_unidad')
            ->join('unidades as ud', 'ud.id_unidad', '=', 'od.id_unidad')
            ->where(fn ($q) => $q->whereIn('t.id_ocupacion_origen', $idsOcupacion)->orWhereIn('t.id_ocupacion_destino', $idsOcupacion))
            ->get(['t.id_ocupacion_origen', 't.id_ocupacion_destino', 't.fecha_traslado', 'uo.codigo_unidad as codigo_origen', 'ud.codigo_unidad as codigo_destino']) as $t) {
            $trasladoPorOcupacion[$t->id_ocupacion_origen] = ['con' => $t->codigo_destino, 'fecha' => $t->fecha_traslado];
            $trasladoPorOcupacion[$t->id_ocupacion_destino] = ['con' => $t->codigo_origen, 'fecha' => $t->fecha_traslado];
        }

        return $rows->map(function ($row) use ($periodo, $consumoPeriodoPorUnidad, $diasPeriodo, $trasladoPorOcupacion) {
            $pagadoTotal = (float) (Pago::where('id_cobro', $row->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado'));
            $saldoPendiente = max((float) $row->total_cobrar - $pagadoTotal, 0);

            // Decision 5.11: la deuda sigue a la persona a traves de un
            // traslado -- se incluye la unidad de origen (y la suya, y la
            // suya...) ademas de la actual, no solo esta. Sin la cadena, el
            // saldo pendiente de la unidad vieja desaparecia de la vista al
            // trasladarse.
            $unidadesCadena = $this->unidadesEnCadenaTraslado((int) $row->id_ocupacion);

            $deudaAnterior = (float) DB::table('cobros_mensuales as ca')
                ->join('periodos as pprev', 'pprev.id_periodo', '=', 'ca.id_periodo')
                ->where('ca.id_persona', $row->id_persona)
                ->whereIn('ca.id_unidad', $unidadesCadena)
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
                'consumo_periodo_unidad' => round((float) ($consumoPeriodoPorUnidad[$row->id_unidad] ?? $row->consumo_kwh), 2),
                'tramo_parcial' => $row->tramo_dias !== null && (int) $row->tramo_dias < $diasPeriodo,
                'traslado' => $trasladoPorOcupacion[$row->id_ocupacion] ?? null,
            ]);
        })->all();
    }

    /**
     * Camina hacia atras por traslados_ocupacion desde una ocupacion,
     * juntando el id_unidad de cada eslabon -- decision 5.11. Si nunca hubo
     * traslado, devuelve solo la unidad de la ocupacion misma (el caso de
     * siempre). Corta si detecta un ciclo (no deberia poder pasar, dado que
     * cada ocupacion es origen o destino de a lo sumo un traslado, pero
     * mejor no confiar en eso a ciegas). Publico porque
     * PortalReciboController::deudaAnterior() tambien lo necesita para el
     * mismo calculo, del lado del inquilino.
     */
    public function unidadesEnCadenaTraslado(int $idOcupacion): array
    {
        $unidades = [];
        $visitados = [];
        $actual = OcupacionUnidad::find($idOcupacion);

        while ($actual && !in_array($actual->id_ocupacion, $visitados, true)) {
            $visitados[] = $actual->id_ocupacion;
            $unidades[] = (int) $actual->id_unidad;

            $idOrigen = DB::table('traslados_ocupacion')->where('id_ocupacion_destino', $actual->id_ocupacion)->value('id_ocupacion_origen');
            $actual = $idOrigen ? OcupacionUnidad::find($idOrigen) : null;
        }

        return $unidades;
    }

    /**
     * Historial completo de cobros de UN inquilino (todos los periodos, no
     * uno solo) para el portal de solo lectura. A diferencia de
     * listarParaPeriodo(), no calcula deuda_anterior cruzada entre cobros
     * -- al listar todos los periodos de una vez, el saldo_pendiente propio
     * de cada fila ya cuenta la historia completa.
     */
    public function listarParaPersona(int $idPersona): array
    {
        $rows = DB::table('cobros_mensuales as c')
            ->join('periodos as per', 'per.id_periodo', '=', 'c.id_periodo')
            ->join('unidades as u', 'u.id_unidad', '=', 'c.id_unidad')
            ->where('c.id_persona', $idPersona)
            ->where('c.estado_pago', '!=', 'ANULADO')
            ->orderByDesc('per.anio')->orderByDesc('per.mes')
            ->get([
                'c.id_cobro', 'c.id_periodo', 'per.anio', 'per.mes',
                'c.id_unidad', 'u.codigo_unidad', 'u.nombre_unidad',
                'c.monto_alquiler', 'c.monto_luz', 'c.ajuste_minimo_luz',
                'c.monto_agua', 'c.monto_gas', 'c.otros_conceptos', 'c.total_cobrar',
                'c.fecha_vencimiento', 'c.estado_pago',
            ]);

        return $rows->map(function ($row) {
            $pagadoTotal = (float) Pago::where('id_cobro', $row->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado');
            $saldoPendiente = max((float) $row->total_cobrar - $pagadoTotal, 0);
            $fechaUltimoPago = Pago::where('id_cobro', $row->id_cobro)->where('estado', 'REGISTRADO')
                ->orderByDesc('fecha_pago')->value('fecha_pago');

            return array_merge((array) $row, [
                'pagado_total' => round($pagadoTotal, 2),
                'saldo_pendiente' => round($saldoPendiente, 2),
                'fecha_ultimo_pago' => $fechaUltimoPago,
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
        $actualesByKey = $actuales->keyBy(fn ($c) => self::key($c->id_unidad, $c->id_ocupacion, $c->id_persona));

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
                        'id_ocupacion' => $row['id_ocupacion'], 'consumo_kwh' => $row['consumo_kwh'],
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
                    'consumo_kwh' => $programado['consumo_kwh'],
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
