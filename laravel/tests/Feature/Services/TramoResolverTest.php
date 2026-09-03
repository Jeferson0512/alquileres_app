<?php

use App\Models\Periodo;
use App\Services\TramoResolver;
use Tests\TestCase;

/**
 * Periodo de 30 dias parejo (abril, mes=4) para que los calculos de dias
 * sean faciles de verificar a mano. anio=2099 (default de crearPeriodo)
 * para no chocar nunca con datos reales.
 */
function periodoAbril(TestCase $test): array
{
    $idInmueble = $test->crearInmueble();
    $idUnidad = $test->crearUnidad($idInmueble, ['codigo_unidad' => 'T']);
    $idPeriodo = $test->crearPeriodo(mes: 4);

    return compact('idInmueble', 'idUnidad', 'idPeriodo');
}

test('una sola ocupacion cubriendo todo el periodo da un unico tramo identico al periodo (caso de hoy)', function () {
    $ctx = periodoAbril($this);
    $idPersona = $this->crearPersona();
    $idOcupacion = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $idOcupacion, 100, 250);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(1);
    expect($tramos[0])
        ->fecha_desde->toBe('2099-04-01')
        ->fecha_hasta->toBe('2099-04-30')
        ->dias->toBe(30)
        ->id_ocupacion->toBe($idOcupacion)
        ->lectura_desde->toBe(100.0)
        ->lectura_hasta->toBe(250.0)
        ->consumo_kwh->toBe(150.0)
        ->estado->toBe('OK');
});

test('dos ocupaciones con el corte cargado dan dos tramos con el consumo repartido correctamente', function () {
    $ctx = periodoAbril($this);
    $personaA = $this->crearPersona();
    $personaB = $this->crearPersona();
    $ocupacionA = $this->crearOcupacion($ctx['idUnidad'], $personaA, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $ocupacionB = $this->crearOcupacion($ctx['idUnidad'], $personaB, ['fecha_inicio' => '2099-04-16']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $ocupacionB, 100, 250);
    $this->crearCorte($ctx['idPeriodo'], $ctx['idUnidad'], '2099-04-15', ['lectura_corte' => 180]);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(2);

    expect($tramos[0])
        ->fecha_desde->toBe('2099-04-01')->fecha_hasta->toBe('2099-04-15')->dias->toBe(15)
        ->id_ocupacion->toBe($ocupacionA)
        ->lectura_desde->toBe(100.0)->lectura_hasta->toBe(180.0)->consumo_kwh->toBe(80.0)
        ->estado->toBe('OK');

    expect($tramos[1])
        ->fecha_desde->toBe('2099-04-16')->fecha_hasta->toBe('2099-04-30')->dias->toBe(15)
        ->id_ocupacion->toBe($ocupacionB)
        ->lectura_desde->toBe(180.0)->lectura_hasta->toBe(250.0)->consumo_kwh->toBe(70.0)
        ->estado->toBe('OK');

    // Invariante: la suma de los tramos no pierde ni inventa kWh.
    $sumaConsumo = array_sum(array_column($tramos, 'consumo_kwh'));
    expect($sumaConsumo)->toBe(150.0);
});

test('dos ocupaciones sin el corte cargado dejan ambos tramos como CORTE_PENDIENTE, sin adivinar un valor', function () {
    $ctx = periodoAbril($this);
    $personaA = $this->crearPersona();
    $personaB = $this->crearPersona();
    $ocupacionA = $this->crearOcupacion($ctx['idUnidad'], $personaA, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO']);
    $ocupacionB = $this->crearOcupacion($ctx['idUnidad'], $personaB, ['fecha_inicio' => '2099-04-16']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $ocupacionB, 100, 250);
    // sincronizar() crearia este corte pendiente automaticamente (Fase 1.4);
    // acá se simula que ya se detecto la frontera pero nadie cargo el numero.
    $this->crearCorte($ctx['idPeriodo'], $ctx['idUnidad'], '2099-04-15');

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(2);
    expect($tramos[0])->id_ocupacion->toBe($ocupacionA)->estado->toBe('CORTE_PENDIENTE')->lectura_hasta->toBeNull()->consumo_kwh->toBeNull();
    // El segundo tramo conoce su propio cierre (lectura_actual) pero no
    // desde donde arranca -- tambien queda pendiente, no se calcula solo.
    expect($tramos[1])->estado->toBe('CORTE_PENDIENTE')->lectura_desde->toBeNull()->lectura_hasta->toBe(250.0)->consumo_kwh->toBeNull();
});

test('una unidad sin ninguna ocupacion da un unico tramo vacante cubriendo todo el periodo', function () {
    $ctx = periodoAbril($this);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], null, 500, 500);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(1);
    expect($tramos[0])
        ->fecha_desde->toBe('2099-04-01')->fecha_hasta->toBe('2099-04-30')
        ->id_ocupacion->toBeNull()->id_persona->toBeNull()
        ->consumo_kwh->toBe(0.0)->estado->toBe('OK');
});

test('una ocupacion que no cubre ni el inicio ni el final del periodo genera tramos vacantes a ambos lados, sin huecos ni solapes', function () {
    $ctx = periodoAbril($this);
    $idPersona = $this->crearPersona();
    $idOcupacion = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-04-10', 'fecha_fin' => '2099-04-20']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $idOcupacion, 100, 250);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(3);

    // Cobertura exacta del periodo, en orden, sin huecos ni solapes.
    expect($tramos[0]['fecha_desde'])->toBe('2099-04-01');
    expect($tramos[0]['fecha_hasta'])->toBe('2099-04-09');
    expect($tramos[0]['id_ocupacion'])->toBeNull();

    expect($tramos[1]['fecha_desde'])->toBe('2099-04-10');
    expect($tramos[1]['fecha_hasta'])->toBe('2099-04-20');
    expect($tramos[1]['id_ocupacion'])->toBe($idOcupacion);

    expect($tramos[2]['fecha_desde'])->toBe('2099-04-21');
    expect($tramos[2]['fecha_hasta'])->toBe('2099-04-30');
    expect($tramos[2]['id_ocupacion'])->toBeNull();

    $totalDias = array_sum(array_column($tramos, 'dias'));
    expect($totalDias)->toBe(30);
});

test('un corte manual parte el tramo en dos aunque la ocupacion no cambio, y ambos lados conservan la misma ocupacion', function () {
    $ctx = periodoAbril($this);
    $idPersona = $this->crearPersona();
    $idOcupacion = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $idOcupacion, 100, 250);
    $this->crearCorte($ctx['idPeriodo'], $ctx['idUnidad'], '2099-04-15', ['lectura_corte' => 170, 'origen' => 'MANUAL']);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(2);
    expect($tramos[0])
        ->fecha_desde->toBe('2099-04-01')->fecha_hasta->toBe('2099-04-15')
        ->id_ocupacion->toBe($idOcupacion)
        ->lectura_desde->toBe(100.0)->lectura_hasta->toBe(170.0)->consumo_kwh->toBe(70.0)
        ->estado->toBe('OK');
    expect($tramos[1])
        ->fecha_desde->toBe('2099-04-16')->fecha_hasta->toBe('2099-04-30')
        // Mismo id_ocupacion en los dos lados -- un corte manual nunca es
        // un cambio de inquilino, a diferencia de uno automatico.
        ->id_ocupacion->toBe($idOcupacion)
        ->lectura_desde->toBe(170.0)->lectura_hasta->toBe(250.0)->consumo_kwh->toBe(80.0)
        ->estado->toBe('OK');
});

test('tramosParaPeriodo con idUnidad filtra solo esa unidad aunque haya otras con lectura en el mismo periodo', function () {
    $ctx = periodoAbril($this);
    $otraUnidad = $this->crearUnidad($ctx['idInmueble'], ['codigo_unidad' => 'OTRA']);
    $idPersona = $this->crearPersona();
    $idOcupacion = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $idOcupacion, 100, 250);
    $this->crearLectura($ctx['idPeriodo'], $otraUnidad, null, 10, 20);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']), $ctx['idUnidad']);

    expect($tramos)->toHaveCount(1);
    expect($tramos[0]['id_unidad'])->toBe($ctx['idUnidad']);
});

test('una renovacion de contrato con el mismo alquiler y la misma persona no parte el tramo -- no pide corte', function () {
    $ctx = periodoAbril($this);
    $idPersona = $this->crearPersona();
    // Igual que el caso real que origino este fix: unidad 101/Jeferson,
    // ocupacion 1 -> 62, mismo alquiler (0), renovada_de_id encadenado.
    $ocupacionVieja = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO', 'motivo_fin' => 'RENOVACION', 'monto_alquiler' => 300]);
    $ocupacionNueva = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-04-16', 'monto_alquiler' => 300, 'renovada_de_id' => $ocupacionVieja]);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $ocupacionNueva, 100, 250);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    // Un solo tramo que cubre todo el periodo -- no dos, no CORTE_PENDIENTE.
    expect($tramos)->toHaveCount(1);
    expect($tramos[0])
        ->fecha_desde->toBe('2099-04-01')->fecha_hasta->toBe('2099-04-30')
        // La ocupacion "de cierre" (la mas nueva) es la que queda vinculada.
        ->id_ocupacion->toBe($ocupacionNueva)
        ->lectura_desde->toBe(100.0)->lectura_hasta->toBe(250.0)->consumo_kwh->toBe(150.0)
        ->estado->toBe('OK');
});

test('una renovacion de contrato con alquiler DISTINTO si parte el tramo (decision 5.9) -- pide corte', function () {
    $ctx = periodoAbril($this);
    $idPersona = $this->crearPersona();
    $ocupacionVieja = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-01-01', 'fecha_fin' => '2099-04-15', 'estado' => 'FINALIZADO', 'motivo_fin' => 'RENOVACION', 'monto_alquiler' => 300]);
    $ocupacionNueva = $this->crearOcupacion($ctx['idUnidad'], $idPersona, ['fecha_inicio' => '2099-04-16', 'monto_alquiler' => 400, 'renovada_de_id' => $ocupacionVieja]);
    $this->crearLectura($ctx['idPeriodo'], $ctx['idUnidad'], $ocupacionNueva, 100, 250);

    $tramos = (new TramoResolver())->tramosParaPeriodo(Periodo::actual($ctx['idPeriodo']));

    expect($tramos)->toHaveCount(2);
    expect($tramos[0]['id_ocupacion'])->toBe($ocupacionVieja)->and($tramos[0]['estado'])->toBe('CORTE_PENDIENTE');
    expect($tramos[1]['id_ocupacion'])->toBe($ocupacionNueva);
});
