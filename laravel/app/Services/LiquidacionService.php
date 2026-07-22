<?php

namespace App\Services;

use App\Models\LiquidacionLuzDetalle;
use App\Models\Periodo;
use App\Models\ReciboLuz;
use App\Models\TarifaServicio;
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

        $rows = DB::table('lecturas_unidad as l')
            ->join('unidades as u', 'u.id_unidad', '=', 'l.id_unidad')
            ->leftJoin('ocupacion_unidad as o', 'o.id_ocupacion', '=', 'l.id_ocupacion')
            ->leftJoin('personas as p', 'p.id_persona', '=', 'o.id_persona')
            ->where('l.id_periodo', $periodo->id_periodo)
            ->orderBy('u.codigo_unidad')
            ->get([
                'l.id_lectura', 'l.id_unidad', 'l.id_ocupacion', 'u.codigo_unidad', 'u.nombre_unidad',
                DB::raw("CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) as inquilino"),
                DB::raw('COALESCE(o.monto_alquiler, 0) as monto_alquiler'),
                DB::raw('ROUND(GREATEST(l.lectura_actual - l.lectura_anterior, 0), 2) as consumo_kwh'),
                'p.id_persona',
            ]);

        $liquidados = $rows->filter(fn ($r) => $r->id_ocupacion && (float) $r->consumo_kwh > 0);

        $precioKwh = (float) $recibo->precio_kwh;
        $montoConsumoTotalRedondeado = $liquidados->sum(function ($r) use ($precioKwh) {
            $subtotal = (float) $r->consumo_kwh * $precioKwh;
            return self::roundUpToTenth($subtotal + $subtotal * self::IGV_RATE);
        });

        $diferenciaComun = round((float) $recibo->total_recibo - $montoConsumoTotalRedondeado, 2);

        $consumoPorUnidad = $liquidados->pluck('consumo_kwh', 'id_unidad')->map(fn ($v) => (float) $v)->all();
        $porcentajes = $this->calcularPorcentajes($consumoPorUnidad, $previoByUnidad);

        $data = $rows->map(function ($row) use ($precioKwh, $diferenciaComun, $tarifas, $previoByUnidad, $porcentajes) {
            $consumo = (float) $row->consumo_kwh;
            $participa = (bool) $row->id_ocupacion && $consumo > 0;
            $porcentaje = $participa ? ($porcentajes[$row->id_unidad] ?? 0) : 0;
            $subtotalConsumo = $participa ? $consumo * $precioKwh : 0;
            $igvConsumo = $subtotalConsumo * self::IGV_RATE;
            $montoConsumo = $participa ? self::roundUpToTenth($subtotalConsumo + $igvConsumo) : 0;
            $gastoComun = $participa ? $diferenciaComun * $porcentaje : 0;
            $ajuste = $participa ? (float) ($previoByUnidad[$row->id_unidad]['ajuste'] ?? 0) : 0;
            $totalLuzBase = $participa ? $montoConsumo + $gastoComun : 0;
            $totalLuzCrudo = $totalLuzBase + $ajuste;
            $totalLuz = $totalLuzCrudo > 0 ? self::roundUpToTenth($totalLuzCrudo) : round($totalLuzCrudo, 2);
            $montoAlquiler = $participa ? (float) $row->monto_alquiler : 0;
            $servicios = $participa ? ($tarifas['agua'] + $tarifas['gas'] + $tarifas['mant']) : 0;

            return [
                'id_lectura' => $row->id_lectura,
                'id_unidad' => $row->id_unidad,
                'id_persona' => $row->id_persona,
                'participa_liquidacion' => $participa,
                'estado_unidad' => $participa ? 'OCUPADA' : 'VACIA',
                'codigo_unidad' => $row->codigo_unidad,
                'nombre_unidad' => $row->nombre_unidad,
                'inquilino' => trim((string) $row->inquilino) !== '' ? $row->inquilino : '-',
                'monto_alquiler' => $montoAlquiler,
                'consumo_kwh' => round($consumo, 2),
                'porcentaje_participacion' => round($porcentaje, 6),
                'monto_consumo' => round($montoConsumo, 2),
                'gasto_comun' => round($gastoComun, 2),
                'ajuste' => round($ajuste, 2),
                'total_pagar_luz' => round($totalLuz, 2),
                'agua' => $participa ? $tarifas['agua'] : 0,
                'gas' => $participa ? $tarifas['gas'] : 0,
                'mantenimiento' => $participa ? $tarifas['mant'] : 0,
                'total_cobrar' => round($montoAlquiler + $servicios + $totalLuz, 2),
            ];
        });

        return [
            'meta' => [
                'precio_kwh' => round($precioKwh, 4),
                'monto_consumo_total' => round($montoConsumoTotalRedondeado, 2),
                'diferencia_comun' => $diferenciaComun,
                'total_unidades' => $rows->count(),
                'total_unidades_liquidadas' => $liquidados->count(),
            ],
            'data' => $data->values()->all(),
        ];
    }

    /**
     * Genera y persiste liquidacion_luz_detalle para el periodo. Los ajustes
     * no reenviados explicitamente en $ajustesEnviados conservan su valor
     * previo (para que regenerar tras corregir UNA lectura no borre ajustes
     * manuales de las demas unidades).
     */
    public function generar(Periodo $periodo, array $ajustesEnviados): void
    {
        $recibo = ReciboLuz::where('id_periodo', $periodo->id_periodo)->first();
        if (!$recibo) {
            throw ValidationException::withMessages(['general' => 'No existe recibo para el periodo']);
        }

        $previoByUnidad = $this->previoGuardado($periodo);
        $ajustesByUnidad = array_map(fn ($p) => $p['ajuste'], $previoByUnidad);
        foreach ($ajustesEnviados as $idUnidad => $ajuste) {
            $ajustesByUnidad[(int) $idUnidad] = round((float) $ajuste, 2);
        }

        $rows = DB::table('lecturas_unidad as l')
            ->join('unidades as u', 'u.id_unidad', '=', 'l.id_unidad')
            ->join('ocupacion_unidad as o', 'o.id_ocupacion', '=', 'l.id_ocupacion')
            ->join('personas as p', 'p.id_persona', '=', 'o.id_persona')
            ->where('l.id_periodo', $periodo->id_periodo)
            ->whereNotNull('l.id_ocupacion')
            ->orderBy('u.codigo_unidad')
            ->get([
                'l.id_lectura', 'l.id_unidad', 'p.id_persona', 'u.codigo_unidad',
                DB::raw('ROUND(GREATEST(l.lectura_actual - l.lectura_anterior, 0), 2) as consumo_kwh'),
            ])
            ->filter(fn ($r) => (float) $r->consumo_kwh > 0);

        $precioKwh = (float) $recibo->precio_kwh;
        $montoConsumoTotalRedondeado = $rows->sum(function ($r) use ($precioKwh) {
            $subtotal = (float) $r->consumo_kwh * $precioKwh;
            return self::roundUpToTenth($subtotal + $subtotal * self::IGV_RATE);
        });

        $diferenciaComun = round((float) $recibo->total_recibo - $montoConsumoTotalRedondeado, 2);

        $consumoPorUnidad = $rows->pluck('consumo_kwh', 'id_unidad')->map(fn ($v) => (float) $v)->all();
        $porcentajes = $this->calcularPorcentajes($consumoPorUnidad, $previoByUnidad);

        DB::transaction(function () use ($rows, $periodo, $recibo, $precioKwh, $diferenciaComun, $porcentajes, $ajustesByUnidad) {
            LiquidacionLuzDetalle::where('id_periodo', $periodo->id_periodo)->delete();

            foreach ($rows as $row) {
                $consumo = (float) $row->consumo_kwh;
                $porcentaje = $porcentajes[$row->id_unidad] ?? 0;
                $subtotalConsumo = $consumo * $precioKwh;
                $montoConsumo = self::roundUpToTenth($subtotalConsumo + $subtotalConsumo * self::IGV_RATE);
                $gastoComun = $diferenciaComun * $porcentaje;
                $ajuste = (float) ($ajustesByUnidad[$row->id_unidad] ?? 0);
                $totalLuzCrudo = $montoConsumo + $gastoComun + $ajuste;
                $totalLuz = $totalLuzCrudo > 0 ? self::roundUpToTenth($totalLuzCrudo) : round($totalLuzCrudo, 2);

                LiquidacionLuzDetalle::create([
                    'id_periodo' => $periodo->id_periodo,
                    'id_inmueble' => $recibo->id_inmueble,
                    'id_unidad' => $row->id_unidad,
                    'id_persona' => $row->id_persona,
                    'id_lectura' => $row->id_lectura,
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
            }
        });
    }
}
