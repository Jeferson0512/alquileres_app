<?php

use App\Models\Periodo;
use App\Services\LecturaService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

function periodoAbrilLectura(TestCase $test): array
{
    $idInmueble = $test->crearInmueble();
    $idUnidad = $test->crearUnidad($idInmueble, ['codigo_unidad' => 'T']);
    $idPeriodo = $test->crearPeriodo(mes: 4);

    return compact('idInmueble', 'idUnidad', 'idPeriodo');
}

test('sincronizar con una sola ocupacion no crea ningun corte (caso de hoy, n=1)', function () {
    $ctx = periodoAbrilLectura($this);
    $idPersona = $this->crearPersona();
    $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01']);

    (new LecturaService())->sincronizar(Periodo::actual($ctx['idPeriodo']));

    expect(DB::table('lecturas_corte')->count())->toBe(0);
    $lectura = DB::table('lecturas_unidad')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidad'])->first();
    expect($lectura)->not->toBeNull();
});

test('sincronizar con dos ocupaciones dentro del periodo crea el corte pendiente en la frontera exacta', function () {
    $ctx = periodoAbrilLectura($this);
    $personaA = $this->crearPersona();
    $personaB = $this->crearPersona();
    $ocupacionA = $this->crearOcupacion($ctx['idUnidad'], $personaA, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $ocupacionB = $this->crearOcupacion($ctx['idUnidad'], $personaB, ['fecha_inicio' => '2099-04-16']);

    (new LecturaService())->sincronizar(Periodo::actual($ctx['idPeriodo']));

    $cortes = DB::table('lecturas_corte')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidad'])->get();
    expect($cortes)->toHaveCount(1);
    expect($cortes[0]->fecha_corte)->toBe('2099-04-15')
        ->and($cortes[0]->id_ocupacion_sale)->toBe($ocupacionA)
        ->and($cortes[0]->id_ocupacion_entra)->toBe($ocupacionB)
        ->and($cortes[0]->origen)->toBe('AUTO')
        ->and($cortes[0]->lectura_corte)->toBeNull();

    // La ocupacion "de cierre" vinculada en lecturas_unidad es la vigente
    // al final del periodo (B), no la que arranco primero.
    $lectura = DB::table('lecturas_unidad')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidad'])->first();
    expect($lectura->id_ocupacion)->toBe($ocupacionB);
});

test('sincronizar de nuevo no duplica un corte ya detectado ni pisa uno que ya tiene lectura cargada', function () {
    $ctx = periodoAbrilLectura($this);
    $personaA = $this->crearPersona();
    $personaB = $this->crearPersona();
    $this->crearOcupacion($ctx['idUnidad'], $personaA, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $this->crearOcupacion($ctx['idUnidad'], $personaB, ['fecha_inicio' => '2099-04-16']);
    $service = new LecturaService();

    $service->sincronizar(Periodo::actual($ctx['idPeriodo']));
    DB::table('lecturas_corte')->where('id_periodo', $ctx['idPeriodo'])->update(['lectura_corte' => 180.5]);

    $service->sincronizar(Periodo::actual($ctx['idPeriodo']));

    $cortes = DB::table('lecturas_corte')->where('id_periodo', $ctx['idPeriodo'])->get();
    expect($cortes)->toHaveCount(1)
        ->and((float) $cortes[0]->lectura_corte)->toBe(180.5);
});

test('sincronizar no crea cortes nuevos en un periodo que ya tiene pagos registrados', function () {
    $ctx = periodoAbrilLectura($this);
    $personaA = $this->crearPersona();
    $personaB = $this->crearPersona();
    $this->crearOcupacion($ctx['idUnidad'], $personaA, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $this->crearOcupacion($ctx['idUnidad'], $personaB, ['fecha_inicio' => '2099-04-16']);

    $idCobro = DB::table('cobros_mensuales')->insertGetId([
        'id_periodo' => $ctx['idPeriodo'], 'id_persona' => $personaB, 'id_unidad' => $ctx['idUnidad'],
    ]);
    DB::table('pagos')->insert([
        'id_cobro' => $idCobro, 'fecha_pago' => '2099-04-20', 'monto_pagado' => 50,
        'metodo_pago' => 'EFECTIVO', 'estado' => 'REGISTRADO', 'origen_registro' => 'MANUAL',
    ]);

    (new LecturaService())->sincronizar(Periodo::actual($ctx['idPeriodo']));

    expect(DB::table('lecturas_corte')->where('id_periodo', $ctx['idPeriodo'])->count())->toBe(0);
    // El resto de sincronizar() (lectura_anterior/id_ocupacion) sigue
    // funcionando igual -- el guard es solo sobre los cortes.
    expect(DB::table('lecturas_unidad')->where('id_periodo', $ctx['idPeriodo'])->count())->toBe(1);
});

test('registrarCorteManual crea un corte con la misma ocupacion a ambos lados', function () {
    $ctx = periodoAbrilLectura($this);
    $idPersona = $this->crearPersona();
    $idOcupacion = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $idOcupacion, 100, 250);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    $corte = (new LecturaService())->registrarCorteManual($periodo, $ctx['idUnidad'], '2099-04-15', 170.5, 'lectura de control', 'Admin Test');

    expect($corte->origen)->toBe('MANUAL')
        ->and((float) $corte->lectura_corte)->toBe(170.5)
        ->and($corte->id_ocupacion_sale)->toBe($idOcupacion)
        ->and($corte->id_ocupacion_entra)->toBe($idOcupacion)
        ->and($corte->observacion)->toBe('lectura de control')
        ->and($corte->registrado_por)->toBe('Admin Test');
});

test('registrarCorteManual rechaza una fecha fuera del rango del periodo', function () {
    $ctx = periodoAbrilLectura($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    (new LecturaService())->registrarCorteManual($periodo, $ctx['idUnidad'], '2099-05-01', 100, null, 'Admin Test');
})->throws(\Illuminate\Validation\ValidationException::class);

test('registrarCorteManual rechaza la propia fecha de cierre del periodo (esa la cubre Actual)', function () {
    $ctx = periodoAbrilLectura($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    (new LecturaService())->registrarCorteManual($periodo, $ctx['idUnidad'], '2099-04-30', 100, null, 'Admin Test');
})->throws(\Illuminate\Validation\ValidationException::class);

test('registrarCorteManual rechaza una fecha duplicada para la misma unidad', function () {
    $ctx = periodoAbrilLectura($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);
    $service = new LecturaService();
    $service->registrarCorteManual($periodo, $ctx['idUnidad'], '2099-04-15', 100, null, 'Admin Test');

    $service->registrarCorteManual($periodo, $ctx['idUnidad'], '2099-04-15', 105, null, 'Admin Test');
})->throws(\Illuminate\Validation\ValidationException::class);

test('registrarCorteManual rechaza si el periodo ya tiene pagos registrados', function () {
    $ctx = periodoAbrilLectura($this);
    $idPersona = $this->crearPersona();
    $idCobro = DB::table('cobros_mensuales')->insertGetId(['id_periodo' => $ctx['idPeriodo'], 'id_persona' => $idPersona, 'id_unidad' => $ctx['idUnidad']]);
    DB::table('pagos')->insert(['id_cobro' => $idCobro, 'fecha_pago' => '2099-04-20', 'monto_pagado' => 50, 'metodo_pago' => 'EFECTIVO', 'estado' => 'REGISTRADO', 'origen_registro' => 'MANUAL']);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    (new LecturaService())->registrarCorteManual($periodo, $ctx['idUnidad'], '2099-04-15', 100, null, 'Admin Test');
})->throws(\Illuminate\Validation\ValidationException::class);

test('filasParaPeriodo expone los tramos por unidad y marca tiene_corte_pendiente', function () {
    $ctx = periodoAbrilLectura($this);
    $personaA = $this->crearPersona();
    $personaB = $this->crearPersona();
    $this->crearOcupacion($ctx['idUnidad'], $personaA, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $this->crearOcupacion($ctx['idUnidad'], $personaB, ['fecha_inicio' => '2099-04-16']);
    $service = new LecturaService();
    $periodo = Periodo::actual($ctx['idPeriodo']);
    $service->sincronizar($periodo);

    $filas = $service->filasParaPeriodo($periodo);

    expect($filas)->toHaveCount(1);
    expect($filas[0]['tramos'])->toHaveCount(2);
    expect($filas[0]['tiene_corte_pendiente'])->toBeTrue();
});
