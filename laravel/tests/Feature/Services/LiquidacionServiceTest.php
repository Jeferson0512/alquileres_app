<?php

use App\Models\Periodo;
use App\Services\LiquidacionService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

function liquidacionEscenarioBase(TestCase $test): array
{
    $idInmueble = $test->crearInmueble();
    $idPeriodo = $test->crearPeriodo();
    $idRecibo = $test->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 200]);

    $idUnidadA = $test->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $idPersonaA = $test->crearPersona(['nombres' => 'Ana']);
    $idOcupacionA = $test->crearOcupacion($idUnidadA, $idPersonaA, ['monto_alquiler' => 300]);
    $idLecturaA = $test->crearLectura($idPeriodo, $idUnidadA, $idOcupacionA, 0, 100);

    $idUnidadB = $test->crearUnidad($idInmueble, ['codigo_unidad' => 'B']);
    $idPersonaB = $test->crearPersona(['nombres' => 'Beto']);
    $idOcupacionB = $test->crearOcupacion($idUnidadB, $idPersonaB, ['monto_alquiler' => 200]);
    $idLecturaB = $test->crearLectura($idPeriodo, $idUnidadB, $idOcupacionB, 0, 50);

    return compact('idInmueble', 'idPeriodo', 'idRecibo', 'idUnidadA', 'idPersonaA', 'idOcupacionA', 'idLecturaA', 'idUnidadB', 'idPersonaB', 'idOcupacionB', 'idLecturaB');
}

test('roundUpToTenth redondea siempre hacia arriba a la decima', function () {
    expect(LiquidacionService::roundUpToTenth(59.0))->toBe(59.0)
        ->and(LiquidacionService::roundUpToTenth(59.01))->toBe(59.1)
        ->and(LiquidacionService::roundUpToTenth(0))->toBe(0.0)
        ->and(LiquidacionService::roundUpToTenth(-5))->toBe(0.0);
});

test('preview reparte el gasto comun proporcional al consumo y redondea cada unidad hacia arriba', function () {
    $ctx = liquidacionEscenarioBase($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    $resultado = (new LiquidacionService())->preview($periodo);

    // consumo A=100 kWh, B=50 kWh, precio_kwh=1.0, IGV 18%:
    // A: 100 + 18 = 118.0 (ya es decima exacta) / B: 50 + 9 = 59.0
    expect($resultado['meta']['monto_consumo_total'])->toBe(177.0)
        // total_recibo=200 - 177 = 23.0 de gasto comun a repartir
        ->and($resultado['meta']['diferencia_comun'])->toBe(23.0);

    $porUnidad = collect($resultado['data'])->keyBy('id_unidad');
    $filaA = $porUnidad[$ctx['idUnidadA']];
    $filaB = $porUnidad[$ctx['idUnidadB']];

    // Sin liquidacion previa guardada, el 100% del gasto comun se reparte
    // proporcional al consumo: A=100/150=0.666667, B=50/150=0.333333.
    expect($filaA['porcentaje_participacion'])->toEqualWithDelta(0.666667, 0.000001)
        ->and($filaB['porcentaje_participacion'])->toEqualWithDelta(0.333333, 0.000001)
        ->and($filaA['monto_consumo'])->toBe(118.0)
        ->and($filaB['monto_consumo'])->toBe(59.0)
        // gasto_comun A = 23 * 2/3 = 15.33; total_luz = roundUpToTenth(118+15.33...) = 133.4
        ->and($filaA['total_pagar_luz'])->toBe(133.4)
        // gasto_comun B = 23 * 1/3 = 7.67; total_luz = roundUpToTenth(59+7.67) = 66.7
        ->and($filaB['total_pagar_luz'])->toBe(66.7);
});

test('preview congela el porcentaje de una unidad cuyo consumo no cambio desde la ultima liquidacion guardada', function () {
    $ctx = liquidacionEscenarioBase($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    // Simula que A ya quedo liquidada antes con exactamente el mismo consumo
    // (100 kWh) y un 70% de participacion "congelado".
    $this->crearLiquidacionDetalle($ctx['idPeriodo'], $ctx['idInmueble'], $ctx['idUnidadA'], $ctx['idPersonaA'], $ctx['idLecturaA'], $ctx['idRecibo'], [
        'consumo_kwh' => 100, 'porcentaje_participacion' => 0.7, 'ajuste' => 0,
    ]);

    $resultado = (new LiquidacionService())->preview($periodo);
    $porUnidad = collect($resultado['data'])->keyBy('id_unidad');

    // A no cambio de consumo -> mantiene su 70% congelado.
    expect($porUnidad[$ctx['idUnidadA']]['porcentaje_participacion'])->toBe(0.7)
        // B es la unica "cambiada" -> se lleva el 30% restante completo.
        ->and($porUnidad[$ctx['idUnidadB']]['porcentaje_participacion'])->toBe(0.3);
});

test('preview lanza un error de validacion si el periodo no tiene recibo', function () {
    $idPeriodo = $this->crearPeriodo();
    $periodo = Periodo::actual($idPeriodo);

    (new LiquidacionService())->preview($periodo);
})->throws(\Illuminate\Validation\ValidationException::class);

test('generar persiste liquidacion_luz_detalle y borra la anterior al regenerar', function () {
    $ctx = liquidacionEscenarioBase($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);
    $service = new LiquidacionService();

    $service->generar($periodo, []);

    expect(DB::table('liquidacion_luz_detalle')->where('id_periodo', $ctx['idPeriodo'])->count())->toBe(2);

    $filaA = DB::table('liquidacion_luz_detalle')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadA'])->first();
    expect((float) $filaA->total_pagar_luz)->toBe(133.4);

    // Regenerar con un ajuste manual para A no debe duplicar filas.
    $service->generar($periodo, [$ctx['idUnidadA'] => 5.0]);
    expect(DB::table('liquidacion_luz_detalle')->where('id_periodo', $ctx['idPeriodo'])->count())->toBe(2);

    $filaA = DB::table('liquidacion_luz_detalle')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadA'])->first();
    expect((float) $filaA->ajuste)->toBe(5.0);
});
