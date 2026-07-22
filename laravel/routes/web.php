<?php

use App\Http\Controllers\CobroController;
use App\Http\Controllers\CobroOverrideController;
use App\Http\Controllers\ConfigCobranzaController;
use App\Http\Controllers\InquilinoController;
use App\Http\Controllers\LecturaController;
use App\Http\Controllers\LiquidacionController;
use App\Http\Controllers\OcupacionController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PeriodoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReciboController;
use App\Http\Controllers\TarifaController;
use App\Http\Controllers\UnidadController;
use App\Http\Controllers\UnidadMedidorCompartidoController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Periodos
    Route::get('/periodos', [PeriodoController::class, 'index'])->middleware('permission:periodos.ver')->name('periodos.index');
    Route::post('/periodos', [PeriodoController::class, 'store'])->middleware('permission:periodos.crear')->name('periodos.store');
    Route::patch('/periodos/{periodo}', [PeriodoController::class, 'update'])->middleware('permission:periodos.cerrar')->name('periodos.update');

    // Inquilinos
    Route::get('/inquilinos', [InquilinoController::class, 'index'])->middleware('permission:inquilinos.ver')->name('inquilinos.index');
    Route::post('/inquilinos', [InquilinoController::class, 'store'])->middleware('permission:inquilinos.crear')->name('inquilinos.store');
    Route::patch('/inquilinos/{inquilino}', [InquilinoController::class, 'update'])->middleware('permission:inquilinos.editar')->name('inquilinos.update');
    Route::delete('/inquilinos/{inquilino}', [InquilinoController::class, 'destroy'])->middleware('permission:inquilinos.eliminar')->name('inquilinos.destroy');

    // Tarifas
    Route::get('/tarifas', [TarifaController::class, 'index'])->middleware('permission:tarifas.ver')->name('tarifas.index');
    Route::patch('/tarifas/{tarifa}', [TarifaController::class, 'update'])->middleware('permission:tarifas.editar')->name('tarifas.update');

    // Config. cobranza
    Route::get('/config-cobranza', [ConfigCobranzaController::class, 'index'])->middleware('permission:config_cobranza.ver')->name('config-cobranza.index');
    Route::put('/config-cobranza', [ConfigCobranzaController::class, 'update'])->middleware('permission:config_cobranza.editar')->name('config-cobranza.update');
    Route::post('/config-cobranza/qr', [ConfigCobranzaController::class, 'uploadQr'])->middleware('permission:config_cobranza.editar')->name('config-cobranza.qr');

    // Unidades
    Route::get('/unidades', [UnidadController::class, 'index'])->middleware('permission:unidades.ver')->name('unidades.index');
    Route::post('/unidades', [UnidadController::class, 'store'])->middleware('permission:unidades.crear')->name('unidades.store');
    Route::patch('/unidades/{unidad}', [UnidadController::class, 'update'])->middleware('permission:unidades.editar')->name('unidades.update');
    Route::delete('/unidades/{unidad}', [UnidadController::class, 'destroy'])->middleware('permission:unidades.editar')->name('unidades.destroy');
    Route::post('/unidades/medidor-compartido', [UnidadMedidorCompartidoController::class, 'store'])->middleware('permission:unidades.editar')->name('unidades.medidor.store');
    Route::delete('/unidades/medidor-compartido/{medidorCompartido}', [UnidadMedidorCompartidoController::class, 'destroy'])->middleware('permission:unidades.editar')->name('unidades.medidor.destroy');

    // Lecturas
    Route::get('/lecturas', [LecturaController::class, 'index'])->middleware('permission:lecturas.ver')->name('lecturas.index');
    Route::post('/lecturas', [LecturaController::class, 'save'])->middleware('permission:lecturas.registrar')->name('lecturas.save');
    Route::post('/lecturas/sync', [LecturaController::class, 'sync'])->middleware('permission:lecturas.sincronizar')->name('lecturas.sync');

    // Recibo de luz
    Route::get('/recibo', [ReciboController::class, 'index'])->middleware('permission:recibo.ver')->name('recibo.index');
    Route::post('/recibo', [ReciboController::class, 'store'])->middleware('permission:recibo.editar')->name('recibo.store');
    Route::post('/recibo/copiar-anterior', [ReciboController::class, 'copyFromPrevious'])->middleware('permission:recibo.editar')->name('recibo.copiar-anterior');

    // Ocupaciones
    Route::get('/ocupaciones', [OcupacionController::class, 'index'])->middleware('permission:ocupaciones.ver')->name('ocupaciones.index');
    Route::post('/ocupaciones', [OcupacionController::class, 'store'])->middleware('permission:ocupaciones.crear')->name('ocupaciones.store');
    Route::patch('/ocupaciones/{ocupacion}', [OcupacionController::class, 'update'])->middleware('permission:ocupaciones.crear')->name('ocupaciones.update');
    Route::delete('/ocupaciones/{ocupacion}', [OcupacionController::class, 'destroy'])->middleware('permission:ocupaciones.finalizar')->name('ocupaciones.destroy');

    // Liquidación
    Route::get('/liquidacion', [LiquidacionController::class, 'index'])->middleware('permission:liquidacion.ver')->name('liquidacion.index');
    Route::post('/liquidacion/generar', [LiquidacionController::class, 'generar'])->middleware('permission:liquidacion.generar')->name('liquidacion.generar');

    // Cobros
    Route::get('/cobros', [CobroController::class, 'index'])->middleware('permission:cobros.ver')->name('cobros.index');
    Route::get('/cobros/detalle', [CobroController::class, 'detail'])->middleware('permission:cobros.ver')->name('cobros.detalle');
    Route::post('/cobros/generar', [CobroController::class, 'generar'])->middleware('permission:cobros.generar')->name('cobros.generar');
    Route::post('/cobros/forzar-actualizacion', [CobroController::class, 'forceRefresh'])->middleware('permission:cobros.forzar_actualizacion')->name('cobros.forzar');
    Route::post('/cobros/overrides', [CobroOverrideController::class, 'store'])->middleware('permission:cobros.generar')->name('cobros.overrides.store');
    Route::delete('/cobros/overrides/{override}', [CobroOverrideController::class, 'destroy'])->middleware('permission:cobros.generar')->name('cobros.overrides.destroy');

    // Pagos
    Route::post('/pagos', [PagoController::class, 'store'])->middleware('permission:cobros.pagos.registrar')->name('pagos.store');
    Route::post('/pagos/{pago}/reversa', [PagoController::class, 'reversa'])->middleware('permission:cobros.pagos.anular')->name('pagos.reversa');
    Route::get('/pagos/{pago}/auditoria', [PagoController::class, 'auditoria'])->middleware('permission:cobros.ver')->name('pagos.auditoria');
});

require __DIR__.'/auth.php';
