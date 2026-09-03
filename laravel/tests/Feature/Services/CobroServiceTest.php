<?php

use App\Models\CobroMensual;
use App\Models\Periodo;
use App\Services\CobroService;
use App\Services\LiquidacionService;
use App\Services\TrasladoService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Arma un periodo con recibo + lectura + liquidacion ya generada (via
 * LiquidacionService real, no insertada a mano) para una unidad/ocupacion,
 * listo para que CobroService::buildProgramados() lo recoja -- desde
 * Fase 2 lee liquidacion_luz_tramo, no liquidacion_luz_detalle directo.
 */
function cobroEscenario(TestCase $test, float $montoAlquiler = 350.0): array
{
    $idInmueble = $test->crearInmueble();
    $test->crearTarifas($idInmueble, ['AGUA' => 40.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $idPeriodo = $test->crearPeriodo();
    $idRecibo = $test->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 118.0, 'fecha_vencimiento' => '2099-01-15']);

    $idUnidad = $test->crearUnidad($idInmueble, ['codigo_unidad' => 'C']);
    $idPersona = $test->crearPersona(['nombres' => 'Carla']);
    $idOcupacion = $test->crearOcupacion($idUnidad, $idPersona, ['monto_alquiler' => $montoAlquiler]);
    $idLectura = $test->crearLectura($idPeriodo, $idUnidad, $idOcupacion, 0, 100);

    // total_pagar_luz = 118 (consumo 100 kWh * 1.0 + IGV, sin gasto comun
    // porque total_recibo coincide exacto) -- generado real via
    // LiquidacionService en vez de insertado a mano, asi tambien queda la
    // fila de liquidacion_luz_tramo que CobroService::buildProgramados()
    // lee desde Fase 2.
    (new LiquidacionService())->generar(Periodo::actual($idPeriodo), []);

    return compact('idInmueble', 'idPeriodo', 'idRecibo', 'idUnidad', 'idPersona', 'idOcupacion', 'idLectura');
}

test('generar snapshotea monto_alquiler y un cambio posterior en la ocupacion no altera el cobro ya generado', function () {
    $ctx = cobroEscenario($this, montoAlquiler: 600.0);
    $periodo = Periodo::actual($ctx['idPeriodo']);
    $service = new CobroService();

    $service->generar($periodo);

    $cobro = CobroMensual::where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidad'])->firstOrFail();
    expect((float) $cobro->monto_alquiler)->toBe(600.0)
        ->and($cobro->montoAlquilerDesactualizado())->toBeFalse();

    // El usuario actualiza el precio de la unidad (el escenario exacto del
    // bug que origino esta migracion): la ocupacion ACTIVA ahora vale 700.
    DB::table('ocupacion_unidad')->where('id_ocupacion', $ctx['idOcupacion'])->update(['monto_alquiler' => 700.0]);

    // El cobro YA GENERADO no debe cambiar solo -- sigue mostrando el
    // snapshot congelado de cuando se genero, y ahora se detecta como
    // desactualizado respecto al contrato vigente.
    $cobro->refresh();
    expect((float) $cobro->monto_alquiler)->toBe(600.0)
        ->and($cobro->montoAlquilerDesactualizado())->toBeTrue();

    // Un periodo NUEVO si debe tomar el monto vigente (700), porque
    // buildProgramados() lee el monto_alquiler actual de ocupacion_unidad
    // en el momento de generar, no un valor cacheado en otro lado.
    $idPeriodo2 = $this->crearPeriodo(mes: 2);
    $this->crearRecibo($ctx['idInmueble'], $idPeriodo2, ['precio_kwh' => 1.0, 'total_recibo' => 118.0, 'fecha_vencimiento' => '2099-02-15']);
    $this->crearLectura($idPeriodo2, $ctx['idUnidad'], $ctx['idOcupacion'], 100, 200);

    $periodo2 = Periodo::actual($idPeriodo2);
    (new LiquidacionService())->generar($periodo2, []);
    $service->generar($periodo2);

    $cobro2 = CobroMensual::where('id_periodo', $idPeriodo2)->where('id_unidad', $ctx['idUnidad'])->firstOrFail();
    expect((float) $cobro2->monto_alquiler)->toBe(700.0)
        ->and($cobro2->montoAlquilerDesactualizado())->toBeFalse();

    // Y el cobro del primer periodo, releido de nuevo, sigue intacto.
    expect((float) $cobro->fresh()->monto_alquiler)->toBe(600.0);
});

test('generar arma el total_cobrar sumando alquiler + luz + tarifas fijas', function () {
    $ctx = cobroEscenario($this, montoAlquiler: 350.0);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    (new CobroService())->generar($periodo);

    $cobro = CobroMensual::where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidad'])->firstOrFail();

    // alquiler 350 + luz 118 + agua 40 + gas 0 + mant 0 = 508
    expect((float) $cobro->monto_luz)->toBe(118.0)
        ->and((float) $cobro->monto_agua)->toBe(40.0)
        ->and((float) $cobro->total_cobrar)->toBe(508.0)
        ->and($cobro->estado_pago)->toBe('PENDIENTE');

    expect(DB::table('cobros_mensuales_detalle')->where('id_cobro', $cobro->id_cobro)->count())->toBe(3); // ALQUILER, LUZ, AGUA (los de monto 0 se omiten)
});

test('generar se bloquea si el periodo ya tiene pagos registrados', function () {
    $ctx = cobroEscenario($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);
    $service = new CobroService();
    $service->generar($periodo);

    $cobro = CobroMensual::where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidad'])->firstOrFail();
    DB::table('pagos')->insert([
        'id_cobro' => $cobro->id_cobro, 'fecha_pago' => '2099-01-05', 'monto_pagado' => 50,
        'metodo_pago' => 'EFECTIVO', 'estado' => 'REGISTRADO', 'origen_registro' => 'MANUAL',
    ]);

    $service->generar($periodo);
})->throws(\Illuminate\Validation\ValidationException::class);

test('generar produce un cobro por tramo -- alquiler prorrateado por dias, luz ya viene prorrateada del tramo', function () {
    $idInmueble = $this->crearInmueble();
    $this->crearTarifas($idInmueble, ['AGUA' => 40.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $idPeriodo = $this->crearPeriodo(mes: 4); // 30 dias
    $this->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 118.0, 'fecha_vencimiento' => '2099-04-15']);

    // Unidad A: Ana (alquiler 300) los primeros 15 dias / 60 kWh, Beto
    // (alquiler 600 -- deliberadamente distinto, para confirmar que cada
    // cobro usa el alquiler de SU PROPIA ocupacion) los ultimos 15 / 20 kWh.
    $idUnidadA = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $personaAna = $this->crearPersona();
    $personaBeto = $this->crearPersona();
    $ocupacionAna = $this->crearOcupacion($idUnidadA, $personaAna, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO', 'monto_alquiler' => 300]);
    $ocupacionBeto = $this->crearOcupacion($idUnidadA, $personaBeto, ['fecha_inicio' => '2099-04-16', 'monto_alquiler' => 600]);
    $this->crearLectura($idPeriodo, $idUnidadA, $ocupacionBeto, 0, 80);
    $this->crearCorte($idPeriodo, $idUnidadA, '2099-04-15', ['lectura_corte' => 60]);

    // Unidad B: control, para que 80+20=100 kWh facturables cuadren
    // exacto con el total del recibo (118) y no haya gasto comun de por
    // medio -- mantiene el calculo a mano simple.
    $idUnidadB = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'B']);
    $idPersonaB = $this->crearPersona();
    $ocupacionB = $this->crearOcupacion($idUnidadB, $idPersonaB, ['fecha_inicio' => '2099-01-01', 'monto_alquiler' => 100]);
    $this->crearLectura($idPeriodo, $idUnidadB, $ocupacionB, 0, 20);

    $periodo = Periodo::actual($idPeriodo);
    (new LiquidacionService())->generar($periodo, []);
    (new CobroService())->generar($periodo);

    $cobrosA = CobroMensual::where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidadA)->orderBy('id_ocupacion')->get();
    expect($cobrosA)->toHaveCount(2);

    $cobroAna = $cobrosA->firstWhere('id_ocupacion', $ocupacionAna);
    $cobroBeto = $cobrosA->firstWhere('id_ocupacion', $ocupacionBeto);

    // factor = 15/30 = 0.5 para los dos tramos.
    // Ana: alquiler 300*0.5=150, luz = 75% de 94.4 = 70.8 (no es el
    // ultimo tramo), agua 40*0.5=20.
    expect((float) $cobroAna->monto_alquiler)->toBe(150.0)
        ->and((float) $cobroAna->monto_luz)->toBe(70.8)
        ->and((float) $cobroAna->monto_agua)->toBe(20.0)
        ->and((float) $cobroAna->consumo_kwh)->toBe(60.0)
        ->and((float) $cobroAna->total_cobrar)->toBe(240.8) // 150+70.8+20
        ->and($cobroAna->id_persona)->toBe($personaAna);

    // Beto: alquiler 600*0.5=300, luz = residuo (94.4-70.8=23.6), agua 20.
    expect((float) $cobroBeto->monto_alquiler)->toBe(300.0)
        ->and((float) $cobroBeto->monto_luz)->toBe(23.6)
        ->and((float) $cobroBeto->monto_agua)->toBe(20.0)
        ->and((float) $cobroBeto->consumo_kwh)->toBe(20.0)
        ->and((float) $cobroBeto->total_cobrar)->toBe(343.6) // 300+23.6+20
        ->and($cobroBeto->id_persona)->toBe($personaBeto);

    // Unidad B, control: un solo tramo -> factor 1.0, nada prorrateado.
    $cobroB = CobroMensual::where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidadB)->firstOrFail();
    expect((float) $cobroB->monto_alquiler)->toBe(100.0)
        ->and((float) $cobroB->monto_luz)->toBe(23.6)
        ->and((float) $cobroB->total_cobrar)->toBe(163.6);
});

test('el minimo de luz es por unidad y se reparte entre sus tramos con el mismo criterio de residuo', function () {
    $idInmueble = $this->crearInmueble();
    $this->crearTarifas($idInmueble, ['AGUA' => 0.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $idPeriodo = $this->crearPeriodo(mes: 4);
    // 2 kWh totales * 1.18 = 2.36 -> roundUpToTenth = 2.4. total_recibo
    // exacto para que diferencia_comun de 0 y el calculo a mano sea simple.
    $this->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 2.4]);
    DB::table('config_cobranza')->insert(['id_inmueble' => $idInmueble, 'monto_minimo_luz' => 10.0]);

    $idUnidad = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $personaAna = $this->crearPersona();
    $personaBeto = $this->crearPersona();
    $ocupacionAna = $this->crearOcupacion($idUnidad, $personaAna, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO', 'monto_alquiler' => 0]);
    $ocupacionBeto = $this->crearOcupacion($idUnidad, $personaBeto, ['fecha_inicio' => '2099-04-16', 'monto_alquiler' => 0]);
    $this->crearLectura($idPeriodo, $idUnidad, $ocupacionBeto, 0, 2);
    $this->crearCorte($idPeriodo, $idUnidad, '2099-04-15', ['lectura_corte' => 1]);

    $periodo = Periodo::actual($idPeriodo);
    (new LiquidacionService())->generar($periodo, []);
    (new CobroService())->generar($periodo);

    $cobros = CobroMensual::where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidad)->get();
    expect($cobros)->toHaveCount(2);

    // Luz total de la unidad = 2.4, muy por debajo del minimo de 10 ->
    // ajuste_minimo_luz total = 7.6, repartido 50/50 (1kWh y 1kWh) entre
    // los dos tramos: 1.2 luz + 3.8 minimo = 5.0 cada uno.
    foreach ($cobros as $cobro) {
        expect((float) $cobro->monto_luz)->toBe(1.2)
            ->and((float) $cobro->ajuste_minimo_luz)->toBe(3.8)
            ->and((float) $cobro->total_cobrar)->toBe(5.0);
    }

    $sumaTotal = $cobros->sum(fn ($c) => (float) $c->total_cobrar);
    expect($sumaTotal)->toBe(10.0);
});

test('una renovacion con cambio de precio a mitad de periodo (misma persona, misma unidad) genera dos cobros, no un duplicado rechazado', function () {
    $idInmueble = $this->crearInmueble();
    $this->crearTarifas($idInmueble, ['AGUA' => 0.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $idPeriodo = $this->crearPeriodo(mes: 4); // 30 dias
    $this->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 118.0]);

    $idUnidad = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $idPersona = $this->crearPersona();
    // Misma persona, misma unidad -- la ocupacion vieja termina, se
    // renueva con un alquiler distinto (500 -> 900) a mitad de periodo.
    // Con la unicidad vieja (periodo, persona, unidad) esto violaba un
    // UNIQUE KEY; con la nueva (periodo, unidad, ocupacion) no.
    $ocupacionVieja = $this->crearOcupacion($idUnidad, $idPersona, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO', 'monto_alquiler' => 500]);
    $ocupacionNueva = $this->crearOcupacion($idUnidad, $idPersona, ['fecha_inicio' => '2099-04-16', 'monto_alquiler' => 900, 'renovada_de_id' => $ocupacionVieja]);
    $this->crearLectura($idPeriodo, $idUnidad, $ocupacionNueva, 0, 80);
    $this->crearCorte($idPeriodo, $idUnidad, '2099-04-15', ['lectura_corte' => 60]);

    $periodo = Periodo::actual($idPeriodo);
    (new LiquidacionService())->generar($periodo, []);
    (new CobroService())->generar($periodo);

    $cobros = CobroMensual::where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidad)->get();
    expect($cobros)->toHaveCount(2);
    expect($cobros->pluck('id_persona')->unique()->all())->toBe([$idPersona]);
    expect($cobros->pluck('id_ocupacion')->sort()->values()->all())->toBe(collect([$ocupacionVieja, $ocupacionNueva])->sort()->values()->all());

    // Cada tramo con el alquiler de SU precio vigente en ese momento (factor 0.5 los dos).
    $cobroViejo = $cobros->firstWhere('id_ocupacion', $ocupacionVieja);
    $cobroNuevo = $cobros->firstWhere('id_ocupacion', $ocupacionNueva);
    expect((float) $cobroViejo->monto_alquiler)->toBe(250.0) // 500*0.5
        ->and((float) $cobroNuevo->monto_alquiler)->toBe(450.0); // 900*0.5
});

test('listarParaPeriodo() sigue la deuda anterior a traves de un traslado, hasta la unidad vieja (decision 5.11)', function () {
    $idInmueble = $this->crearInmueble();
    $this->crearTarifas($idInmueble, ['AGUA' => 0.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $idUnidadA = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'A']);
    $idUnidadB = $this->crearUnidad($idInmueble, ['codigo_unidad' => 'B']);
    $idPersona = $this->crearPersona();

    // Periodo 1: Juan en la unidad A, cobro de 200 sin pagar -- deuda que
    // deberia seguirlo despues del traslado.
    $idPeriodo1 = $this->crearPeriodo(mes: 3);
    $ocupacionA = $this->crearOcupacion($idUnidadA, $idPersona, ['fecha_inicio' => '2099-01-01', 'monto_alquiler' => 200]);
    $this->crearRecibo($idInmueble, $idPeriodo1, ['precio_kwh' => 1.0, 'total_recibo' => 0]);
    // lectura_actual > 0 -- 0 consumo excluye la unidad de la liquidacion
    // entera (regla 2.3) y no se genera ningun cobro para ella.
    $this->crearLectura($idPeriodo1, $idUnidadA, $ocupacionA, 0, 10);
    $periodo1 = Periodo::actual($idPeriodo1);
    (new LiquidacionService())->generar($periodo1, []);
    (new CobroService())->generar($periodo1);

    // Periodo 2: Juan se traslada de A a B a mitad de mes.
    $idPeriodo2 = $this->crearPeriodo(mes: 4); // 30 dias
    $this->crearRecibo($idInmueble, $idPeriodo2, ['precio_kwh' => 1.0, 'total_recibo' => 0]);
    // lectura_actual > 0 en las dos -- si diera 0 consumo, la unidad queda
    // excluida de la liquidacion entera (regla 2.3) y no se genera ningun
    // cobro para ella.
    $this->crearLectura($idPeriodo2, $idUnidadA, $ocupacionA, 0, 10);
    $this->crearLectura($idPeriodo2, $idUnidadB, null, 0, 10);
    $periodo2 = Periodo::actual($idPeriodo2);

    // Cortes con valor propio (no 0) -- si el tramo de Juan diera 0 kWh en
    // alguna de las dos unidades, esa unidad quedaria excluida de la
    // liquidacion entera (regla 2.3) y no generaria cobro para nadie ahi.
    $traslado = (new TrasladoService())->trasladar($periodo2, $ocupacionA, $idUnidadB, '2099-04-15', 5.0, 3.0, 300.0, null, 'Admin Test');

    (new LiquidacionService())->generar($periodo2, []);
    (new CobroService())->generar($periodo2);

    $filas = (new CobroService())->listarParaPeriodo($periodo2);
    $filaA = collect($filas)->firstWhere('id_unidad', $idUnidadA);
    $filaB = collect($filas)->firstWhere('id_unidad', $idUnidadB);

    expect($filaB)->not->toBeNull()
        ->and($filaB['deuda_anterior'])->toBe(200.0);

    // 3.6: el badge de traslado apunta cada cobro al codigo de la unidad
    // COMPLEMENTARIA (A apunta a B, B apunta a A) -- y ambos son tramos
    // parciales (15 dias de 30), no el periodo completo.
    expect($filaA['traslado']['con'])->toBe('B')
        ->and($filaB['traslado']['con'])->toBe('A')
        ->and($filaA['tramo_parcial'])->toBeTrue()
        ->and($filaB['tramo_parcial'])->toBeTrue();
});
