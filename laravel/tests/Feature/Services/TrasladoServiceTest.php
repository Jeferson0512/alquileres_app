<?php

use App\Models\CobroMensual;
use App\Models\OcupacionUnidad;
use App\Models\Periodo;
use App\Services\CobroService;
use App\Services\LiquidacionService;
use App\Services\TrasladoService;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Periodo de 30 dias parejo (abril) + dos unidades ya sincronizadas (con
 * lectura este periodo) para que TrasladoService acepte el traslado.
 */
function escenarioTraslado(TestCase $test): array
{
    $idInmueble = $test->crearInmueble();
    $idPeriodo = $test->crearPeriodo(mes: 4);
    $idUnidadOrigen = $test->crearUnidad($idInmueble, ['codigo_unidad' => '201']);
    $idUnidadDestino = $test->crearUnidad($idInmueble, ['codigo_unidad' => '202']);
    $idPersona = $test->crearPersona();
    $idOcupacionOrigen = $test->crearOcupacion($idUnidadOrigen, $idPersona, ['fecha_inicio' => '2099-01-01', 'monto_alquiler' => 300, 'garantia' => 300]);

    // Ambas unidades ya sincronizadas este periodo -- requisito de
    // TrasladoService (necesita una lecturas_unidad donde colgar el corte).
    $test->crearLectura($idPeriodo, $idUnidadOrigen, $idOcupacionOrigen, 100, 160);
    $test->crearLectura($idPeriodo, $idUnidadDestino, null, 500, 500);

    return compact('idInmueble', 'idPeriodo', 'idUnidadOrigen', 'idUnidadDestino', 'idPersona', 'idOcupacionOrigen');
}

test('trasladar finaliza el origen, crea el destino, el vinculo, y los dos cortes ya con lectura cargada', function () {
    $ctx = escenarioTraslado($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    $traslado = (new TrasladoService())->trasladar(
        $periodo, $ctx['idOcupacionOrigen'], $ctx['idUnidadDestino'], '2099-04-15',
        130.0, 505.0, 600.0, 'Cambio de cuarto', 'Admin Test'
    );

    $origen = OcupacionUnidad::find($ctx['idOcupacionOrigen']);
    expect($origen->estado)->toBe('FINALIZADO')
        ->and($origen->fecha_fin)->toBe('2099-04-15')
        ->and($origen->motivo_fin)->toBe('MUDANZA');

    $destino = OcupacionUnidad::find($traslado->id_ocupacion_destino);
    expect($destino->id_unidad)->toBe($ctx['idUnidadDestino'])
        ->and($destino->id_persona)->toBe($ctx['idPersona'])
        ->and($destino->fecha_inicio)->toBe('2099-04-16')
        ->and((float) $destino->monto_alquiler)->toBe(600.0)
        // Decision 5.10: la garantia se traslada tal cual (era 300 en origen).
        ->and((float) $destino->garantia)->toBe(300.0)
        ->and($destino->estado)->toBe('ACTIVO');

    expect($traslado->id_ocupacion_origen)->toBe($ctx['idOcupacionOrigen']);

    $corteOrigen = DB::table('lecturas_corte')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadOrigen'])->first();
    expect((float) $corteOrigen->lectura_corte)->toBe(130.0)->and($corteOrigen->id_ocupacion_sale)->toBe($ctx['idOcupacionOrigen']);

    $corteDestino = DB::table('lecturas_corte')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadDestino'])->first();
    expect((float) $corteDestino->lectura_corte)->toBe(505.0)->and($corteDestino->id_ocupacion_entra)->toBe($destino->id_ocupacion);
});

test('el traslado factura correctamente las dos unidades via el prorrateo automatico de Fase 2', function () {
    $ctx = escenarioTraslado($this);
    $this->crearTarifas($ctx['idInmueble'], ['AGUA' => 0.0, 'GAS' => 0.0, 'MANTENIMIENTO' => 0.0]);
    $this->crearRecibo($ctx['idInmueble'], $ctx['idPeriodo'], ['precio_kwh' => 1.0, 'total_recibo' => 118.0]);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    // Unidad origen (201): 100->160 = 60 kWh en total, corte al dia 15 en 130 -> 30 kWh de Juan.
    // Unidad destino (202): 500->540 = 40 kWh, corte de entrada en 505 -> 35 kWh de Juan.
    DB::table('lecturas_unidad')->where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadDestino'])->update(['lectura_actual' => 540]);

    (new TrasladoService())->trasladar($periodo, $ctx['idOcupacionOrigen'], $ctx['idUnidadDestino'], '2099-04-15', 130.0, 505.0, 600.0, null, 'Admin Test');

    (new LiquidacionService())->generar($periodo, []);
    (new CobroService())->generar($periodo);

    // Origen: tramo Juan (01-15, 30 kWh) + tramo vacante (16-30, 30 kWh) --
    // solo el tramo de Juan factura.
    $cobrosOrigen = CobroMensual::where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadOrigen'])->get();
    expect($cobrosOrigen)->toHaveCount(1);
    expect((float) $cobrosOrigen->first()->monto_alquiler)->toBe(150.0); // 300 * 15/30
    expect((float) $cobrosOrigen->first()->consumo_kwh)->toBe(30.0);

    // Destino: tramo vacante (01-15) + tramo Juan (16-30, 35 kWh) -- solo
    // el tramo de Juan factura, con el alquiler NUEVO (600), no el viejo.
    $cobrosDestino = CobroMensual::where('id_periodo', $ctx['idPeriodo'])->where('id_unidad', $ctx['idUnidadDestino'])->get();
    expect($cobrosDestino)->toHaveCount(1);
    expect((float) $cobrosDestino->first()->monto_alquiler)->toBe(300.0); // 600 * 15/30
    expect((float) $cobrosDestino->first()->consumo_kwh)->toBe(35.0);

    // Juan ve las dos unidades facturadas ese mes, ninguna con el alquiler completo duplicado.
    expect((float) $cobrosOrigen->first()->monto_alquiler + (float) $cobrosDestino->first()->monto_alquiler)->toBe(450.0);
});

test('trasladar rechaza si la unidad destino ya tiene una ocupacion activa', function () {
    $ctx = escenarioTraslado($this);
    $otraPersona = $this->crearPersona();
    $this->crearOcupacion($ctx['idUnidadDestino'], $otraPersona, ['fecha_inicio' => '2099-01-01']);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    expect(fn () => (new TrasladoService())->trasladar($periodo, $ctx['idOcupacionOrigen'], $ctx['idUnidadDestino'], '2099-04-15', 130.0, 505.0, 600.0, null, 'Admin Test'))
        ->toThrow(\Illuminate\Validation\ValidationException::class);
});

test('trasladar rechaza una fecha fuera del periodo', function () {
    $ctx = escenarioTraslado($this);
    $periodo = Periodo::actual($ctx['idPeriodo']);

    expect(fn () => (new TrasladoService())->trasladar($periodo, $ctx['idOcupacionOrigen'], $ctx['idUnidadDestino'], '2099-05-01', 130.0, 505.0, 600.0, null, 'Admin Test'))
        ->toThrow(\Illuminate\Validation\ValidationException::class);
});

test('trasladar rechaza si alguna de las dos unidades todavia no fue sincronizada este periodo', function () {
    $idInmueble = $this->crearInmueble();
    $idPeriodo = $this->crearPeriodo(mes: 4);
    $idUnidadOrigen = $this->crearUnidad($idInmueble, ['codigo_unidad' => '201']);
    $idUnidadDestino = $this->crearUnidad($idInmueble, ['codigo_unidad' => '202']); // sin lectura este periodo
    $idPersona = $this->crearPersona();
    $idOcupacionOrigen = $this->crearOcupacion($idUnidadOrigen, $idPersona, ['fecha_inicio' => '2099-01-01']);
    $this->crearLectura($idPeriodo, $idUnidadOrigen, $idOcupacionOrigen, 100, 160);

    $periodo = Periodo::actual($idPeriodo);

    expect(fn () => (new TrasladoService())->trasladar($periodo, $idOcupacionOrigen, $idUnidadDestino, '2099-04-15', 130.0, 505.0, 600.0, null, 'Admin Test'))
        ->toThrow(\Illuminate\Validation\ValidationException::class);
});
