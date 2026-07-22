<?php

use App\Models\CobroMensual;
use App\Models\Periodo;
use App\Services\CobroService;
use App\Services\LiquidacionService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Arma un periodo con recibo + lectura + liquidacion ya generada para una
 * unidad/ocupacion, listo para que CobroService::buildProgramados() lo
 * recoja (depende de liquidacion_luz_detalle, no de las lecturas directamente).
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

    // total_pagar_luz = 118 (consumo 100 kWh * 1.0 + IGV, sin gasto comun porque total_recibo coincide exacto).
    $test->crearLiquidacionDetalle($idPeriodo, $idInmueble, $idUnidad, $idPersona, $idLectura, $idRecibo, [
        'consumo_kwh' => 100, 'porcentaje_participacion' => 1, 'monto_consumo' => 118, 'total_pagar_luz' => 118,
    ]);

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
    $idRecibo2 = $this->crearRecibo($ctx['idInmueble'], $idPeriodo2, ['precio_kwh' => 1.0, 'total_recibo' => 118.0, 'fecha_vencimiento' => '2099-02-15']);
    $idLectura2 = $this->crearLectura($idPeriodo2, $ctx['idUnidad'], $ctx['idOcupacion'], 100, 200);
    $this->crearLiquidacionDetalle($idPeriodo2, $ctx['idInmueble'], $ctx['idUnidad'], $ctx['idPersona'], $idLectura2, $idRecibo2, [
        'consumo_kwh' => 100, 'porcentaje_participacion' => 1, 'monto_consumo' => 118, 'total_pagar_luz' => 118,
    ]);

    $periodo2 = Periodo::actual($idPeriodo2);
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
