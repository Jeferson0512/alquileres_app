<?php

use App\Models\CobroMensual;
use App\Models\Pago;
use App\Models\Periodo;
use App\Services\CobroService;
use App\Services\PagoService;
use Tests\TestCase;

function pagoEscenario(TestCase $test): CobroMensual
{
    $idInmueble = $test->crearInmueble();
    $test->crearTarifas($idInmueble, ['AGUA' => 40.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $idPeriodo = $test->crearPeriodo();
    $idRecibo = $test->crearRecibo($idInmueble, $idPeriodo, ['precio_kwh' => 1.0, 'total_recibo' => 118.0, 'fecha_vencimiento' => '2099-01-15']);

    $idUnidad = $test->crearUnidad($idInmueble, ['codigo_unidad' => 'P']);
    $idPersona = $test->crearPersona(['nombres' => 'Paola']);
    $idOcupacion = $test->crearOcupacion($idUnidad, $idPersona, ['monto_alquiler' => 350]);
    $idLectura = $test->crearLectura($idPeriodo, $idUnidad, $idOcupacion, 0, 100);
    $test->crearLiquidacionDetalle($idPeriodo, $idInmueble, $idUnidad, $idPersona, $idLectura, $idRecibo, [
        'consumo_kwh' => 100, 'porcentaje_participacion' => 1, 'monto_consumo' => 118, 'total_pagar_luz' => 118,
    ]);

    $periodo = Periodo::actual($idPeriodo);
    (new CobroService())->generar($periodo);

    // total_cobrar = 350 (alquiler) + 118 (luz) + 40 (agua) = 508
    return CobroMensual::where('id_periodo', $idPeriodo)->where('id_unidad', $idUnidad)->firstOrFail();
}

test('registrar un pago parcial deja el cobro en PARCIAL y uno que cubre el total lo deja en PAGADO', function () {
    $cobro = pagoEscenario($this);
    $service = new PagoService();

    $pago1 = $service->registrar($cobro, ['fecha_pago' => '2099-01-05', 'monto_pagado' => 200], 'tester');
    $cobro->refresh();
    expect($cobro->estado_pago)->toBe('PARCIAL')
        ->and($pago1->estado)->toBe('REGISTRADO');

    $service->registrar($cobro, ['fecha_pago' => '2099-01-10', 'monto_pagado' => 308], 'tester');
    $cobro->refresh();
    expect($cobro->estado_pago)->toBe('PAGADO');
});

test('registrar aplica automaticamente por prioridad: alquiler antes que luz, luz antes que agua', function () {
    $cobro = pagoEscenario($this);
    $service = new PagoService();

    // 350 (alquiler) + 30 de los 118 de luz.
    $service->registrar($cobro, ['fecha_pago' => '2099-01-05', 'monto_pagado' => 380], 'tester');

    $conceptos = collect($service->conceptosDeCobro($cobro->id_cobro))->keyBy('codigo');
    expect((float) $conceptos['ALQUILER']['saldo_pendiente'])->toBe(0.0)
        ->and((float) $conceptos['LUZ']['saldo_pendiente'])->toBe(88.0)
        ->and((float) $conceptos['AGUA']['saldo_pendiente'])->toBe(40.0);
});

test('registrar rechaza un monto que excede el saldo total del cobro', function () {
    $cobro = pagoEscenario($this);
    (new PagoService())->registrar($cobro, ['fecha_pago' => '2099-01-05', 'monto_pagado' => 999999], 'tester');
})->throws(\Illuminate\Validation\ValidationException::class);

test('reversar un pago regresa el cobro a PENDIENTE y exige motivo/actor/fecha', function () {
    $cobro = pagoEscenario($this);
    $service = new PagoService();

    $pago = $service->registrar($cobro, ['fecha_pago' => '2099-01-05', 'monto_pagado' => 508], 'tester');
    $cobro->refresh();
    expect($cobro->estado_pago)->toBe('PAGADO');

    $service->reversar($pago, 'Error de digitacion', 'admin', '2099-01-06 10:00:00');

    $cobro->refresh();
    $pago->refresh();
    expect($cobro->estado_pago)->toBe('PENDIENTE')
        ->and($pago->estado)->toBe('REVERSADO')
        ->and($pago->motivo_reversa)->toBe('Error de digitacion');
});

test('reversar un pago que ya esta reversado lanza un error de validacion', function () {
    $cobro = pagoEscenario($this);
    $service = new PagoService();
    $pago = $service->registrar($cobro, ['fecha_pago' => '2099-01-05', 'monto_pagado' => 508], 'tester');
    $service->reversar($pago, 'motivo', 'admin', '2099-01-06 10:00:00');

    $service->reversar($pago->fresh(), 'segundo intento', 'admin', '2099-01-07 10:00:00');
})->throws(\Illuminate\Validation\ValidationException::class);
