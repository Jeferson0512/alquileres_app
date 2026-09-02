<?php

use App\Models\CobroMensual;
use App\Models\Periodo;
use App\Services\CobroService;
use App\Services\LiquidacionService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Reproduce el periodo real id=11 de produccion (15/06/2026-14/07/2026,
 * CERRADO) con sus 8 unidades facturadas, los mismos overrides de agua y
 * los mismos ajustes manuales de luz que ya tenia guardados. Cada unidad
 * tuvo una sola ocupacion cubriendo todo el periodo (n=1 tramo).
 *
 * Sirve de linea base para la Fase 2 del plan de atribucion por tramos
 * (docs/diseno-ocupaciones-parciales.md): con una sola ocupacion por
 * unidad, el factor de prorrateo nuevo es dias_tramo/dias_periodo = 1, asi
 * que estos montos -- verificados centavo a centavo contra lo que hay
 * grabado hoy en liquidacion_luz_detalle/cobros_mensuales -- tienen que
 * seguir dando exactamente igual despues de esa fase. Si alguna aserción
 * deja de cumplirse, Fase 2 rompio el caso comun (una sola ocupacion por
 * periodo), no solo el caso nuevo de tramos multiples.
 */
function periodo11Real(TestCase $test): array
{
    $idInmueble = $test->crearInmueble();
    $test->crearTarifas($idInmueble, ['AGUA' => 40.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    DB::table('config_cobranza')->insert(['id_inmueble' => $idInmueble, 'monto_minimo_luz' => 10.0]);

    $idPeriodo = $test->crearPeriodo(mes: 7, anio: 2026, overrides: [
        'fecha_inicio' => '2026-06-15', 'fecha_fin' => '2026-07-14', 'estado' => 'CERRADO',
    ]);
    $idRecibo = $test->crearRecibo($idInmueble, $idPeriodo, [
        'precio_kwh' => 0.6130, 'total_recibo' => 223.90, 'fecha_vencimiento' => '2026-07-31',
    ]);

    // codigo_unidad => [monto_alquiler, lectura_anterior, lectura_actual, override_agua]
    $unidadesReales = [
        'u101' => [0.0, 16728.70, 16818.30, null],
        'u201' => [180.0, 689.80, 702.50, null],
        'u203' => [180.0, 1003.80, 1057.40, 45.0],
        'u205' => [200.0, 61.40, 68.00, null],
        'u208' => [180.0, 361.40, 366.30, 30.0],
        'u209' => [180.0, 297.90, 301.80, null],
        'u302' => [600.0, 195.90, 236.90, 45.0],
        'u401' => [360.0, 99.70, 118.80, 45.0],
    ];

    $ids = [];
    foreach ($unidadesReales as $codigo => [$alquiler, $anterior, $actual, $overrideAgua]) {
        $idUnidad = $test->crearUnidad($idInmueble, ['codigo_unidad' => $codigo]);
        $idPersona = $test->crearPersona();
        $idOcupacion = $test->crearOcupacion($idUnidad, $idPersona, [
            'monto_alquiler' => $alquiler, 'fecha_inicio' => '2026-01-01',
        ]);
        $idLectura = $test->crearLectura($idPeriodo, $idUnidad, $idOcupacion, $anterior, $actual);

        if ($overrideAgua !== null) {
            DB::table('cobros_overrides_servicio')->insert([
                'id_periodo' => $idPeriodo, 'id_unidad' => $idUnidad, 'id_persona' => $idPersona,
                'servicio' => 'AGUA', 'monto' => $overrideAgua,
            ]);
        }

        $ids[$codigo] = compact('idUnidad', 'idPersona', 'idOcupacion', 'idLectura');
    }

    return compact('idInmueble', 'idPeriodo', 'idRecibo', 'ids');
}

/**
 * Ajustes manuales de luz que el periodo real ya tenia guardados para
 * 205/208/209 -- son un valor persistido (no recalculado), asi que hay que
 * reenviarlos explicitamente al generar (ver LiquidacionService::generar).
 */
function periodo11Ajustes(array $ids): array
{
    return [
        $ids['u205']['idUnidad'] => 6.0,
        $ids['u208']['idUnidad'] => 7.0,
        $ids['u209']['idUnidad'] => 8.0,
    ];
}

test('periodo real 11: LiquidacionService::generar reproduce centavo a centavo lo ya grabado en produccion', function () {
    $ctx = periodo11Real($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    (new LiquidacionService())->generar($periodo, periodo11Ajustes($ctx['ids']));

    $porUnidad = DB::table('liquidacion_luz_detalle')->where('id_periodo', $ctx['idPeriodo'])->get()->keyBy('id_unidad');

    $esperado = [
        // codigo => [consumo_kwh, porcentaje_participacion, total_pagar_luz]
        'u101' => [89.60, 0.387208, 86.70],
        'u201' => [12.70, 0.054883, 12.30],
        'u203' => [53.60, 0.231634, 51.80],
        'u205' => [6.60, 0.028522, 12.50],
        'u208' => [4.90, 0.021175, 11.80],
        'u209' => [3.90, 0.016854, 11.90],
        'u302' => [41.00, 0.177182, 39.70],
        'u401' => [19.10, 0.082541, 18.60],
    ];

    foreach ($esperado as $codigo => [$consumo, $porcentaje, $totalLuz]) {
        $fila = $porUnidad[$ctx['ids'][$codigo]['idUnidad']];
        expect((float) $fila->consumo_kwh)->toBe($consumo)
            ->and((float) $fila->porcentaje_participacion)->toEqualWithDelta($porcentaje, 0.000001)
            ->and((float) $fila->total_pagar_luz)->toBe($totalLuz);
    }
});

test('periodo real 11: CobroService::generar reproduce centavo a centavo lo ya grabado en produccion', function () {
    $ctx = periodo11Real($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    (new LiquidacionService())->generar($periodo, periodo11Ajustes($ctx['ids']));
    (new CobroService())->generar($periodo);

    $cobros = CobroMensual::where('id_periodo', $ctx['idPeriodo'])->get()->keyBy('id_unidad');

    $esperado = [
        // codigo => [monto_alquiler, monto_luz, ajuste_minimo_luz, monto_agua, total_cobrar]
        'u101' => [0.0, 86.70, 0.0, 40.0, 126.70],
        'u201' => [180.0, 12.30, 0.0, 40.0, 232.30],
        'u203' => [180.0, 51.80, 0.0, 45.0, 276.80],
        'u205' => [200.0, 12.50, 0.0, 40.0, 252.50],
        'u208' => [180.0, 11.80, 0.0, 30.0, 221.80],
        'u209' => [180.0, 11.90, 0.0, 40.0, 231.90],
        'u302' => [600.0, 39.70, 0.0, 45.0, 684.70],
        'u401' => [360.0, 18.60, 0.0, 45.0, 423.60],
    ];

    foreach ($esperado as $codigo => [$alquiler, $luz, $ajusteMinimo, $agua, $total]) {
        $cobro = $cobros[$ctx['ids'][$codigo]['idUnidad']];
        expect((float) $cobro->monto_alquiler)->toBe($alquiler)
            ->and((float) $cobro->monto_luz)->toBe($luz)
            ->and((float) $cobro->ajuste_minimo_luz)->toBe($ajusteMinimo)
            ->and((float) $cobro->monto_agua)->toBe($agua)
            ->and((float) $cobro->total_cobrar)->toBe($total)
            ->and($cobro->estado_pago)->toBe('PENDIENTE');
    }

    expect($cobros)->toHaveCount(8);
});
