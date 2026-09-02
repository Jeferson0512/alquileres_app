<?php

namespace App\Services;

use App\Models\LiquidacionLuzDetalle;
use App\Models\Periodo;
use App\Models\ReciboLuz;
use App\Models\TarifaServicio;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Replica liquidacion/preview.php y liquidacion/generate.php ("formula Excel v2"):
 *
 * 1. Cada unidad con consumo paga su propio consumo_kwh * precio_kwh + IGV,
 *    redondeado HACIA ARRIBA a la decima (roundUpToTenth) — asi el recibo
 *    real de la electrica (que redondea igual) nunca queda desfinanciado.
 * 2. La diferencia entre el total del recibo y la suma de esos consumos
 *    redondeados es el "gasto comun" (cargo fijo, alumbrado publico, etc.)
 *    y se reparte proporcional al consumo de cada unidad.
 * 3. Si el consumo de una unidad NO cambio desde la ultima liquidacion
 *    guardada, su % de participacion queda "congelado" — evita que corregir
 *    la lectura de UNA unidad le mueva el monto a las demas que no cambiaron.
 *
 * Fase 2 (docs/implementacion-ocupaciones-parciales.md): la formula de
 * arriba NO cambia -- sigue operando por UNIDAD, igual que siempre. Lo
 * que se agrega es un paso posterior que reparte el total_pagar_luz de
 * cada unidad entre sus tramos de ocupacion (TramoResolver), proporcional
 * al consumo de cada tramo, con el residuo en el ultimo para no perder
 * centavos -- misma tecnica que unidades_medidor_compartido ya usa para
 * partir el consumo entre dos unidades.
 */
class LiquidacionService
{
    private const IGV_RATE = 0.18;

    public static function roundUpToTenth(float $value): float
    {
        if ($value <= 0) {
            return 0.0;
        }

        return ceil(($value - 0.0000001) * 10) / 10;
    }

    private function tarifas(int $idInmueble): array
    {
        $tarifas = TarifaServicio::where('id_inmueble', $idInmueble)->where('activo', 1)
            ->pluck('monto', 'servicio');

        return [
            'agua' => (float) ($tarifas['AGUA'] ?? 15.0),
            'gas' => (float) ($tarifas['GAS'] ?? 0.0),
            'mant' => (float) ($tarifas['MANTENIMIENTO'] ?? 0.0),
        ];
    }

    /**
     * Calcula los porcentajes de participacion respetando los congelados,
     * repartiendo el resto proporcional al consumo de las unidades que si
     * cambiaron. Devuelve [idUnidad => porcentaje].
     */
    private function calcularPorcentajes(array $filasConConsumo, array $previoByUnidad): array
    {
        $sumaPorcentajeCongelado = 0.0;
        $sumaConsumoCambiadas = 0.0;
        $esCongelada = [];

        foreach ($filasConConsumo as $idUnidad => $consumo) {
            $previo = $previoByUnidad[$idUnidad] ?? null;
            $sinCambios = $previo !== null && round($previo['consumo_kwh'], 2) === round($consumo, 2);
            $esCongelada[$idUnidad] = $sinCambios;

            if ($sinCambios) {
                $sumaPorcentajeCongelado += $previo['porcentaje_participacion'];
            } else {
                $sumaConsumoCambiadas += $consumo;
            }
        }

        $porcentajeDisponible = max(1 - $sumaPorcentajeCongelado, 0);

        $porcentajes = [];
        foreach ($filasConConsumo as $idUnidad => $consumo) {
            if ($esCongelada[$idUnidad]) {
                $porcentajes[$idUnidad] = $previoByUnidad[$idUnidad]['porcentaje_participacion'];
            } else {
                $porcentajes[$idUnidad] = $sumaConsumoCambiadas > 0
                    ? $porcentajeDisponible * ($consumo / $sumaConsumoCambiadas)
                    : 0;
            }
        }

        return $porcentajes;
    }

    private function previoGuardado(Periodo $periodo): array
    {
        $previo = [];
        foreach (LiquidacionLuzDetalle::where('id_periodo', $periodo->id_periodo)->get() as $row) {
            $previo[$row->id_unidad] = [
                'consumo_kwh' => (float) $row->consumo_kwh,
                'porcentaje_participacion' => (float) $row->porcentaje_participacion,
                'ajuste' => (float) $row->ajuste,
            ];
        }

        return $previo;
    }

    /**
     * Por cada unidad con lectura en el periodo: sus tramos (TramoResolver),
     * separados en ocupados/vacante, y el consumo FACTURABLE (solo tramos
     * ocupados -- el de los vacantes queda afuera a proposito, ver 2.4).
     * Unica fuente para preview() y generar(), asi los dos ven exactamente
     * los mismos tramos.
     */
    private function filasPorUnidadConTramos(Periodo $periodo): Collection
    {
        $rows = DB::table('lecturas_unidad as l')
            ->join('unidades as u', 'u.id_unidad', '=', 'l.id_unidad')
            ->where('l.id_periodo', $periodo->id_periodo)
            ->orderBy('u.codigo_unidad')
            ->get(['l.id_lectura', 'l.id_unidad', 'u.codigo_unidad', 'u.nombre_unidad']);

        $tramosPorUnidad = collect((new TramoResolver())->tramosParaPeriodo($periodo))->groupBy('id_unidad');

        return $rows->map(function ($row) use ($tramosPorUnidad) {
            $tramos = $tramosPorUnidad->get($row->id_unidad, collect())->values();
            $tramosOcupados = $tramos->filter(fn ($t) => $t['id_ocupacion'] !== null)->values();
            $tramosVacantes = $tramos->filter(fn ($t) => $t['id_ocupacion'] === null)->values();

            return [
                'id_lectura' => $row->id_lectura,
                'id_unidad' => $row->id_unidad,
                'codigo_unidad' => $row->codigo_unidad,
                'nombre_unidad' => $row->nombre_unidad,
                'tramos' => $tramos->all(),
                'tramos_ocupados' => $tramosOcupados->all(),
                'consumo_facturable' => round($tramosOcupados->sum(fn ($t) => $t['consumo_kwh'] ?? 0), 2),
                'consumo_vacante_kwh' => round($tramosVacantes->sum(fn ($t) => $t['consumo_kwh'] ?? 0), 2),
                'tiene_corte_pendiente' => $tramos->contains(fn ($t) => $t['estado'] === 'CORTE_PENDIENTE'),
            ];
        });
    }

    /**
     * Reparte total_pagar_luz de una unidad entre sus tramos ocupados,
     * proporcional al consumo_kwh de cada uno. El ultimo tramo se lleva el
     * residuo (nunca roundUpToTenth por tramo -- eso sobre-cobraria). Con
     * un solo tramo (el caso de siempre) no hay reparto que hacer: se
     * lleva el total tal cual, sin ningun redondeo intermedio nuevo.
     */
    private function repartirPorTramos(array $tramosOcupados, float $totalLuzUnidad): array
    {
        $n = count($tramosOcupados);
        if ($n === 0) {
            return [];
        }
        if ($n === 1) {
            return [array_merge($tramosOcupados[0], ['total_pagar_luz' => round($totalLuzUnidad, 2), 'porcentaje_tramo' => 1.0])];
        }

        $consumoTotal = array_sum(array_column($tramosOcupados, 'consumo_kwh'));
        $resultado = [];
        $acumulado = 0.0;

        foreach ($tramosOcupados as $i => $t) {
            $porcentaje = $consumoTotal > 0 ? ($t['consumo_kwh'] / $consumoTotal) : (1 / $n);

            if ($i === $n - 1) {
                $monto = round($totalLuzUnidad - $acumulado, 2);
            } else {
                $monto = round($totalLuzUnidad * $porcentaje, 2);
                $acumulado += $monto;
            }

            $resultado[] = array_merge($t, ['total_pagar_luz' => $monto, 'porcentaje_tramo' => round($porcentaje, 6)]);
        }

        return $resultado;
    }

    /**
     * Titular de cada unidad (la ocupacion de cierre, via
     * lecturas_unidad.id_ocupacion) -- solo para mostrar inquilino/alquiler
     * en la fila resumen. El reparto de dinero real entre inquilinos usa
     * los tramos, no esto.
     */
    private function titularesPorUnidad(Periodo $periodo, array $idsUnidad): Collection
    {
        return DB::table('lecturas_unidad as l')
            ->leftJoin('ocupacion_unidad as o', 'o.id_ocupacion', '=', 'l.id_ocupacion')
            ->leftJoin('personas as p', 'p.id_persona', '=', 'o.id_persona')
            ->where('l.id_periodo', $periodo->id_periodo)
            ->whereIn('l.id_unidad', $idsUnidad)
            ->get([
                'l.id_unidad', 'o.id_persona', 'o.monto_alquiler',
                DB::raw("CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) as inquilino"),
            ])
            ->keyBy('id_unidad');
    }

    /**
     * Vista previa: no persiste nada, solo calcula que se generaria.
     */
    public function preview(Periodo $periodo): array
    {
        $recibo = ReciboLuz::where('id_periodo', $periodo->id_periodo)->first();
        if (!$recibo) {
            throw ValidationException::withMessages(['general' => 'No existe recibo para el periodo']);
        }

        $tarifas = $this->tarifas($recibo->id_inmueble);
        $previoByUnidad = $this->previoGuardado($periodo);
        $filas = $this->filasPorUnidadConTramos($periodo);
        $titulares = $this->titularesPorUnidad($periodo, $filas->pluck('id_unidad')->all());

        // Un tramo pendiente deja a la unidad fuera de la vista previa (no
        // se puede calcular su reparto sin el numero) -- igual que
        // generar() la bloquea mas abajo, pero acá solo se excluye, no se
        // lanza excepcion: preview() es de solo lectura.
        $liquidables = $filas->filter(fn ($f) => !$f['tiene_corte_pendiente'] && $f['consumo_facturable'] > 0);

        $precioKwh = (float) $recibo->precio_kwh;
        $montoConsumoTotalRedondeado = $liquidables->sum(function ($f) use ($precioKwh) {
            $subtotal = $f['consumo_facturable'] * $precioKwh;
            return self::roundUpToTenth($subtotal + $subtotal * self::IGV_RATE);
        });

        $diferenciaComun = round((float) $recibo->total_recibo - $montoConsumoTotalRedondeado, 2);

        $consumoPorUnidad = $liquidables->pluck('consumo_facturable', 'id_unidad')->all();
        $porcentajes = $this->calcularPorcentajes($consumoPorUnidad, $previoByUnidad);

        $data = $filas->map(function ($f) use ($precioKwh, $diferenciaComun, $tarifas, $previoByUnidad, $porcentajes, $titulares) {
            $titular = $titulares->get($f['id_unidad']);
            $participa = !$f['tiene_corte_pendiente'] && $f['consumo_facturable'] > 0;

            $porcentaje = $participa ? ($porcentajes[$f['id_unidad']] ?? 0) : 0;
            $subtotalConsumo = $participa ? $f['consumo_facturable'] * $precioKwh : 0;
            $igvConsumo = $subtotalConsumo * self::IGV_RATE;
            $montoConsumo = $participa ? self::roundUpToTenth($subtotalConsumo + $igvConsumo) : 0;
            $gastoComun = $participa ? $diferenciaComun * $porcentaje : 0;
            $ajuste = $participa ? (float) ($previoByUnidad[$f['id_unidad']]['ajuste'] ?? 0) : 0;
            $totalLuzBase = $participa ? $montoConsumo + $gastoComun : 0;
            $totalLuzCrudo = $totalLuzBase + $ajuste;
            $totalLuz = $totalLuzCrudo > 0 ? self::roundUpToTenth($totalLuzCrudo) : round($totalLuzCrudo, 2);
            $montoAlquiler = $participa ? (float) ($titular->monto_alquiler ?? 0) : 0;
            $servicios = $participa ? ($tarifas['agua'] + $tarifas['gas'] + $tarifas['mant']) : 0;

            $estadoUnidad = match (true) {
                $f['tiene_corte_pendiente'] => 'CORTE_PENDIENTE',
                $participa => 'OCUPADA',
                default => 'VACIA',
            };

            return [
                'id_lectura' => $f['id_lectura'],
                'id_unidad' => $f['id_unidad'],
                'participa_liquidacion' => $participa,
                'estado_unidad' => $estadoUnidad,
                'codigo_unidad' => $f['codigo_unidad'],
                'nombre_unidad' => $f['nombre_unidad'],
                'inquilino' => $titular && trim((string) $titular->inquilino) !== '' ? $titular->inquilino : '-',
                'monto_alquiler' => $montoAlquiler,
                'consumo_kwh' => $f['consumo_facturable'],
                'consumo_vacante_kwh' => $f['consumo_vacante_kwh'],
                'porcentaje_participacion' => round($porcentaje, 6),
                'monto_consumo' => round($montoConsumo, 2),
                'gasto_comun' => round($gastoComun, 2),
                'ajuste' => round($ajuste, 2),
                'total_pagar_luz' => round($totalLuz, 2),
                'agua' => $participa ? $tarifas['agua'] : 0,
                'gas' => $participa ? $tarifas['gas'] : 0,
                'mantenimiento' => $participa ? $tarifas['mant'] : 0,
                'total_cobrar' => round($montoAlquiler + $servicios + $totalLuz, 2),
                'tramos' => $participa ? $this->repartirPorTramos($f['tramos_ocupados'], $totalLuz) : [],
            ];
        });

        return [
            'meta' => [
                'precio_kwh' => round($precioKwh, 4),
                'monto_consumo_total' => round($montoConsumoTotalRedondeado, 2),
                'diferencia_comun' => $diferenciaComun,
                'total_unidades' => $filas->count(),
                'total_unidades_liquidadas' => $liquidables->count(),
            ],
            'data' => $data->values()->all(),
        ];
    }

    /**
     * Genera y persiste liquidacion_luz_detalle (por unidad) +
     * liquidacion_luz_tramo (el reparto interno) para el periodo. Los
     * ajustes no reenviados explicitamente en $ajustesEnviados conservan
     * su valor previo (para que regenerar tras corregir UNA lectura no
     * borre ajustes manuales de las demas unidades).
     *
     * Bloqueada (decision 5.8) si alguna unidad con lectura este periodo
     * tiene un tramo CORTE_PENDIENTE -- no genera un reparto parcial ni
     * adivina un numero que no existe.
     */
    public function generar(Periodo $periodo, array $ajustesEnviados): void
    {
        $recibo = ReciboLuz::where('id_periodo', $periodo->id_periodo)->first();
        if (!$recibo) {
            throw ValidationException::withMessages(['general' => 'No existe recibo para el periodo']);
        }

        $filas = $this->filasPorUnidadConTramos($periodo);

        $pendientes = $filas->filter(fn ($f) => $f['tiene_corte_pendiente']);
        if ($pendientes->isNotEmpty()) {
            $codigos = $pendientes->pluck('codigo_unidad')->implode(', ');
            throw ValidationException::withMessages([
                'general' => "Faltan lecturas de corte en: {$codigos}. Cárgalas en Lecturas antes de generar la liquidación.",
            ]);
        }

        $previoByUnidad = $this->previoGuardado($periodo);
        $ajustesByUnidad = array_map(fn ($p) => $p['ajuste'], $previoByUnidad);
        foreach ($ajustesEnviados as $idUnidad => $ajuste) {
            $ajustesByUnidad[(int) $idUnidad] = round((float) $ajuste, 2);
        }

        $liquidables = $filas->filter(fn ($f) => $f['consumo_facturable'] > 0);
        $titulares = $this->titularesPorUnidad($periodo, $liquidables->pluck('id_unidad')->all());

        $precioKwh = (float) $recibo->precio_kwh;
        $montoConsumoTotalRedondeado = $liquidables->sum(function ($f) use ($precioKwh) {
            $subtotal = $f['consumo_facturable'] * $precioKwh;
            return self::roundUpToTenth($subtotal + $subtotal * self::IGV_RATE);
        });

        $diferenciaComun = round((float) $recibo->total_recibo - $montoConsumoTotalRedondeado, 2);

        $consumoPorUnidad = $liquidables->pluck('consumo_facturable', 'id_unidad')->all();
        $porcentajes = $this->calcularPorcentajes($consumoPorUnidad, $previoByUnidad);

        DB::transaction(function () use ($liquidables, $periodo, $recibo, $precioKwh, $diferenciaComun, $porcentajes, $ajustesByUnidad, $titulares) {
            // El tramo tiene FK hacia el detalle -- hay que borrar el hijo
            // antes que el padre, si no la FK rechaza el delete.
            DB::table('liquidacion_luz_tramo')->where('id_periodo', $periodo->id_periodo)->delete();
            LiquidacionLuzDetalle::where('id_periodo', $periodo->id_periodo)->delete();

            foreach ($liquidables as $f) {
                $consumo = $f['consumo_facturable'];
                $porcentaje = $porcentajes[$f['id_unidad']] ?? 0;
                $subtotalConsumo = $consumo * $precioKwh;
                $montoConsumo = self::roundUpToTenth($subtotalConsumo + $subtotalConsumo * self::IGV_RATE);
                $gastoComun = $diferenciaComun * $porcentaje;
                $ajuste = (float) ($ajustesByUnidad[$f['id_unidad']] ?? 0);
                $totalLuzCrudo = $montoConsumo + $gastoComun + $ajuste;
                $totalLuz = $totalLuzCrudo > 0 ? self::roundUpToTenth($totalLuzCrudo) : round($totalLuzCrudo, 2);

                $titular = $titulares->get($f['id_unidad']);

                $detalle = LiquidacionLuzDetalle::create([
                    'id_periodo' => $periodo->id_periodo,
                    'id_inmueble' => $recibo->id_inmueble,
                    'id_unidad' => $f['id_unidad'],
                    'id_persona' => $titular->id_persona ?? null,
                    'id_lectura' => $f['id_lectura'],
                    'id_recibo_luz' => $recibo->id_recibo_luz,
                    'consumo_kwh' => round($consumo, 2),
                    'porcentaje_participacion' => round($porcentaje, 6),
                    'monto_consumo' => round($montoConsumo, 2),
                    'gasto_comun' => round($gastoComun, 2),
                    'ajuste' => round($ajuste, 2),
                    'total_pagar_luz' => round($totalLuz, 2),
                    'estado' => 'GENERADO',
                    'observacion' => 'Generado desde Laravel (formula Excel v2)',
                    'fecha_calculo' => now(),
                ]);

                foreach ($this->repartirPorTramos($f['tramos_ocupados'], $totalLuz) as $t) {
                    DB::table('liquidacion_luz_tramo')->insert([
                        'id_liquidacion_detalle' => $detalle->id_liquidacion_detalle,
                        'id_periodo' => $periodo->id_periodo,
                        'id_unidad' => $f['id_unidad'],
                        'id_ocupacion' => $t['id_ocupacion'],
                        'id_persona' => $t['id_persona'],
                        'fecha_desde' => $t['fecha_desde'],
                        'fecha_hasta' => $t['fecha_hasta'],
                        'dias' => $t['dias'],
                        'lectura_desde' => $t['lectura_desde'],
                        'lectura_hasta' => $t['lectura_hasta'],
                        'consumo_kwh' => $t['consumo_kwh'],
                        'porcentaje_tramo' => $t['porcentaje_tramo'],
                        'total_pagar_luz' => $t['total_pagar_luz'],
                        'fecha_calculo' => now(),
                    ]);
                }
            }
        });
    }
}
