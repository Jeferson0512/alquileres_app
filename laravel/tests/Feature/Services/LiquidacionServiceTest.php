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

test('generar reparte el total_pagar_luz de una unidad entre sus tramos ocupados, con el residuo en el ultimo', function () {
    $idInmueble = $this->crearInmueble();
    $idPeriodo = $this->crearPeriodo(mes: 4);
    $idRecibo = $this->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 118.0]);

    // Unidad A: Ana los primeros 15 dias (60 kWh via corte), Beto los
    // ultimos 15 (20 kWh via lectura_actual) -- dos tramos ocupados, sin
    // vacante en el medio.
    $idUnidadA = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $personaAna = $this->crearPersona();
    $personaBeto = $this->crearPersona();
    $ocupacionAna = $this->crearOcupacion($idUnidadA, $personaAna, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $ocupacionBeto = $this->crearOcupacion($idUnidadA, $personaBeto, ['fecha_inicio' => '2099-04-16']);
    $this->crearLectura($idPeriodo, $idUnidadA, $ocupacionBeto, 0, 80);
    $this->crearCorte($idPeriodo, $idUnidadA, '2099-04-15', ['lectura_corte' => 60]);

    // Unidad B: control, una sola ocupacion, 20 kWh -- sirve para que el
    // total del recibo (118) coincida exacto con 80+20 kWh y no haya
    // gasto comun de por medio (mantiene el calculo a mano simple).
    $idUnidadB = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'B']);
    $personaB = $this->crearPersona();
    $ocupacionB = $this->crearOcupacion($idUnidadB, $personaB, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($idPeriodo, $idUnidadB, $ocupacionB, 0, 20);

    $periodo = Periodo::actual($idPeriodo);
    (new LiquidacionService())->generar($periodo, []);

    // 80 kWh * 1.0 * 1.18 = 94.4 (ya decima exacta) -- roundUpToTenth no
    // le suma nada. Con B poniendo 20*1.18=23.6, 94.4+23.6=118.0 = total
    // del recibo exacto, entonces diferencia_comun = 0 y total_pagar_luz
    // de A es directamente 94.4.
    $filaA = DB::table('liquidacion_luz_detalle')->where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidadA)->first();
    expect((float) $filaA->consumo_kwh)->toBe(80.0)
        ->and((float) $filaA->total_pagar_luz)->toBe(94.4);

    $tramos = DB::table('liquidacion_luz_tramo')->where('id_liquidacion_detalle', $filaA->id_liquidacion_detalle)->orderBy('fecha_desde')->get();
    expect($tramos)->toHaveCount(2);

    // Ana: 60/80 = 75% de 94.4 = 70.8 (no es el ultimo tramo, se calcula
    // por porcentaje).
    expect($tramos[0]->id_ocupacion)->toBe($ocupacionAna)
        ->and((float) $tramos[0]->consumo_kwh)->toBe(60.0)
        ->and((float) $tramos[0]->total_pagar_luz)->toBe(70.8);

    // Beto: es el ultimo tramo -> se lleva el residuo exacto (94.4 - 70.8
    // = 23.6), no 20/80*94.4 redondeado aparte -- así nunca se pierde ni
    // se inventa un centavo por acumulacion de redondeos.
    expect($tramos[1]->id_ocupacion)->toBe($ocupacionBeto)
        ->and((float) $tramos[1]->consumo_kwh)->toBe(20.0)
        ->and((float) $tramos[1]->total_pagar_luz)->toBe(23.6);

    $sumaTramos = (float) $tramos[0]->total_pagar_luz + (float) $tramos[1]->total_pagar_luz;
    expect($sumaTramos)->toBe((float) $filaA->total_pagar_luz);
});

test('el consumo de un tramo vacante no se factura a nadie y su costo se reparte via gasto comun entre las unidades ocupadas', function () {
    $idInmueble = $this->crearInmueble();
    $idPeriodo = $this->crearPeriodo(mes: 4);
    // total_recibo incluye el costo real de los 4 kWh vacantes de A, que
    // ningun inquilino paga directo -- se espera que quede en la
    // diferencia_comun y se reparta entre las unidades ocupadas.
    $idRecibo = $this->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 150.0]);

    // Unidad A: Ana los primeros 15 dias (60 kWh), después queda VACANTE
    // el resto del periodo (4 kWh mas, de nadie).
    $idUnidadA = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $personaAna = $this->crearPersona();
    $ocupacionAna = $this->crearOcupacion($idUnidadA, $personaAna, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $this->crearLectura($idPeriodo, $idUnidadA, $ocupacionAna, 0, 64);
    $this->crearCorte($idPeriodo, $idUnidadA, '2099-04-15', ['lectura_corte' => 60]);

    $idUnidadB = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'B']);
    $personaB = $this->crearPersona();
    $ocupacionB = $this->crearOcupacion($idUnidadB, $personaB, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($idPeriodo, $idUnidadB, $ocupacionB, 0, 40);

    $periodo = Periodo::actual($idPeriodo);
    $resultado = (new LiquidacionService())->preview($periodo);
    $porUnidad = collect($resultado['data'])->keyBy('id_unidad');

    // El consumo facturable de A es 60 (no 64) -- los 4 kWh vacantes
    // quedan afuera del calculo de cuanto paga Ana.
    expect($porUnidad[$idUnidadA]['consumo_kwh'])->toBe(60.0)
        ->and($porUnidad[$idUnidadA]['consumo_vacante_kwh'])->toBe(4.0);

    // 60+40=100 kWh facturables * 1.18 = 70.8+47.2=118.0; diferencia_comun
    // = 150-118 = 32.0, que YA incluye el costo de los 4 kWh vacantes de
    // A -- se reparte proporcional al consumo facturable (60/100 y
    // 40/100), no se pierde ni lo absorbe el dueño aparte.
    expect($resultado['meta']['diferencia_comun'])->toBe(32.0);
    expect($porUnidad[$idUnidadA]['porcentaje_participacion'])->toEqualWithDelta(0.6, 0.000001);
    expect($porUnidad[$idUnidadA]['total_pagar_luz'])->toBe(90.0); // 70.8 + 32*0.6=19.2
    expect($porUnidad[$idUnidadB]['total_pagar_luz'])->toBe(60.0); // 47.2 + 32*0.4=12.8

    // La unidad vacante en si (el tramo, no la unidad) no genera su
    // propia fila de tramo facturado -- solo el tramo de Ana.
    $service = new LiquidacionService();
    $service->generar($periodo, []);
    $filaA = DB::table('liquidacion_luz_detalle')->where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidadA)->first();
    expect(DB::table('liquidacion_luz_tramo')->where('id_liquidacion_detalle', $filaA->id_liquidacion_detalle)->count())->toBe(1);
});

test('generar se bloquea si alguna unidad tiene un tramo con corte pendiente, sin generar nada para nadie', function () {
    $idInmueble = $this->crearInmueble();
    $idPeriodo = $this->crearPeriodo(mes: 4);
    $this->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 100.0]);

    $idUnidadA = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $personaAna = $this->crearPersona();
    $personaBeto = $this->crearPersona();
    $this->crearOcupacion($idUnidadA, $personaAna, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $this->crearOcupacion($idUnidadA, $personaBeto, ['fecha_inicio' => '2099-04-16']);
    $this->crearLectura($idPeriodo, $idUnidadA, null, 0, 80);
    // El corte del 15/04 nunca se cargo -- sigue con lectura_corte NULL.
    $this->crearCorte($idPeriodo, $idUnidadA, '2099-04-15');

    $idUnidadB = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'B']);
    $idPersonaB = $this->crearPersona();
    $ocupacionB = $this->crearOcupacion($idUnidadB, $idPersonaB, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($idPeriodo, $idUnidadB, $ocupacionB, 0, 20);

    $periodo = Periodo::actual($idPeriodo);

    expect(fn () => (new LiquidacionService())->generar($periodo, []))
        ->toThrow(\Illuminate\Validation\ValidationException::class);

    // No genero nada -- ni siquiera para B, que si estaba completa. Es a
    // proposito: mas facil de razonar que un periodo que se genero a
    // medias.
    expect(DB::table('liquidacion_luz_detalle')->where('id_periodo', $idPeriodo)->count())->toBe(0);
});
