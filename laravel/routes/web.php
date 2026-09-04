<?php

use App\Http\Controllers\AvisoController;
use App\Http\Controllers\ClientLogController;
use App\Http\Controllers\CobroController;
use App\Http\Controllers\CobroOverrideController;
use App\Http\Controllers\ComprobantePagoController;
use App\Http\Controllers\ConfigCobranzaController;
use App\Http\Controllers\ContactInquiryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\InquilinoController;
use App\Http\Controllers\LecturaController;
use App\Http\Controllers\LiquidacionController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\OcupacionController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PerfilCampoController;
use App\Http\Controllers\PeriodoController;
use App\Http\Controllers\PortalComprobanteController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\PortalNotificacionController;
use App\Http\Controllers\PortalPerfilController;
use App\Http\Controllers\PortalReciboController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReciboController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\TarifaController;
use App\Http\Controllers\UnidadController;
use App\Http\Controllers\UnidadMedidorCompartidoController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LandingController::class, 'index'])->name('landing');
// throttle:6,1 -- mismo limite que ya usa el resto de la app (routes/auth.php)
// para acciones publicas/sensibles; sin esto un bot podia inundar la tabla
// de consultas y el correo del admin sin ningun limite.
Route::post('/contacto', [LandingController::class, 'store'])->middleware('throttle:6,1')->name('landing.contacto');

// Beacon de diagnostico: errores capturados en el navegador (ver
// resources/js/lib/logError.js), vía fetch/sendBeacon same-origin -- el
// middleware CSRF de Laravel 13 (PreventRequestForgery) ya las deja pasar
// por el header Sec-Fetch-Site sin necesitar token. Solo se limita con
// throttle para que no se pueda usar como vector de flood al log.
Route::post('/log-frontend-error', [ClientLogController::class, 'store'])
    ->middleware('throttle:30,1')
    ->name('log-frontend-error');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'permission:dashboard.ver'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Reportes
    Route::get('/reportes', [ReporteController::class, 'index'])->middleware('permission:reportes.ver')->name('reportes.index');
    Route::get('/reportes/financiero/pdf', [ReporteController::class, 'exportarFinancieroPdf'])->middleware('permission:reportes.ver')->name('reportes.financiero.pdf');
    Route::get('/reportes/ocupacion/pdf', [ReporteController::class, 'exportarOcupacionPdf'])->middleware('permission:reportes.ver')->name('reportes.ocupacion.pdf');
    Route::get('/reportes/consumo/pdf', [ReporteController::class, 'exportarConsumoPdf'])->middleware('permission:reportes.ver')->name('reportes.consumo.pdf');

    // Periodos
    Route::get('/periodos', [PeriodoController::class, 'index'])->middleware('permission:periodos.ver')->name('periodos.index');
    Route::post('/periodos', [PeriodoController::class, 'store'])->middleware('permission:periodos.crear')->name('periodos.store');
    Route::patch('/periodos/{periodo}', [PeriodoController::class, 'update'])->middleware('permission:periodos.cerrar')->name('periodos.update');

    // Inquilinos
    Route::get('/inquilinos', [InquilinoController::class, 'index'])->middleware('permission:inquilinos.ver')->name('inquilinos.index');
    Route::post('/inquilinos', [InquilinoController::class, 'store'])->middleware('permission:inquilinos.crear')->name('inquilinos.store');
    Route::patch('/inquilinos/{inquilino}', [InquilinoController::class, 'update'])->middleware('permission:inquilinos.editar')->name('inquilinos.update');
    Route::patch('/inquilinos/{inquilino}/estado', [InquilinoController::class, 'toggleEstado'])->middleware('permission:inquilinos.eliminar')->name('inquilinos.estado');

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
    Route::patch('/unidades/{unidad}/estado', [UnidadController::class, 'toggleEstado'])->middleware('permission:unidades.editar')->name('unidades.estado');
    Route::post('/unidades/medidor-compartido', [UnidadMedidorCompartidoController::class, 'store'])->middleware('permission:unidades.editar')->name('unidades.medidor.store');
    Route::delete('/unidades/medidor-compartido/{medidorCompartido}', [UnidadMedidorCompartidoController::class, 'destroy'])->middleware('permission:unidades.editar')->name('unidades.medidor.destroy');

    // Lecturas
    Route::get('/lecturas', [LecturaController::class, 'index'])->middleware('permission:lecturas.ver')->name('lecturas.index');
    Route::post('/lecturas', [LecturaController::class, 'save'])->middleware('permission:lecturas.registrar')->name('lecturas.save');
    Route::post('/lecturas/sync', [LecturaController::class, 'sync'])->middleware('permission:lecturas.sincronizar')->name('lecturas.sync');
    Route::post('/lecturas/corte', [LecturaController::class, 'registrarCorte'])->middleware('permission:lecturas.registrar')->name('lecturas.corte.registrar');

    // Recibo de luz
    Route::get('/recibo', [ReciboController::class, 'index'])->middleware('permission:recibo.ver')->name('recibo.index');
    Route::post('/recibo', [ReciboController::class, 'store'])->middleware('permission:recibo.editar')->name('recibo.store');
    Route::post('/recibo/copiar-anterior', [ReciboController::class, 'copyFromPrevious'])->middleware('permission:recibo.editar')->name('recibo.copiar-anterior');

    // Ocupaciones
    Route::get('/ocupaciones', [OcupacionController::class, 'index'])->middleware('permission:ocupaciones.ver')->name('ocupaciones.index');
    Route::post('/ocupaciones', [OcupacionController::class, 'store'])->middleware('permission:ocupaciones.crear')->name('ocupaciones.store');
    Route::patch('/ocupaciones/{ocupacion}', [OcupacionController::class, 'update'])->middleware('permission:ocupaciones.crear')->name('ocupaciones.update');
    Route::delete('/ocupaciones/{ocupacion}', [OcupacionController::class, 'destroy'])->middleware('permission:ocupaciones.finalizar')->name('ocupaciones.destroy');
    Route::patch('/ocupaciones/{ocupacion}/anular', [OcupacionController::class, 'anular'])->middleware('permission:ocupaciones.finalizar')->name('ocupaciones.anular');
    // Sin permiso propio en el catálogo (docs/requerimientos-proyecto.md
    // punto 6) -- exige los dos que ya representan lo que la acción hace
    // (crear + finalizar) en vez de agregar uno nuevo solo para esto.
    Route::post('/ocupaciones/{ocupacion}/trasladar', [OcupacionController::class, 'trasladar'])->middleware(['permission:ocupaciones.crear', 'permission:ocupaciones.finalizar'])->name('ocupaciones.trasladar');

    // Notificaciones (historial de renovaciones pendientes/resueltas) -- disponible
    // para cualquier usuario autenticado, no solo quien puede finalizar ocupaciones.
    Route::get('/notificaciones', [NotificacionController::class, 'index'])->name('notificaciones.index');
    Route::patch('/notificaciones/marcar-leidas', [NotificacionController::class, 'marcarLeidas'])->name('notificaciones.marcar-leidas');

    // Liquidación
    Route::get('/liquidacion', [LiquidacionController::class, 'index'])->middleware('permission:liquidacion.ver')->name('liquidacion.index');
    Route::post('/liquidacion/generar', [LiquidacionController::class, 'generar'])->middleware('permission:liquidacion.generar')->name('liquidacion.generar');

    // Cobros
    Route::get('/cobros', [CobroController::class, 'index'])->middleware('permission:cobros.ver')->name('cobros.index');
    Route::get('/cobros/pagos', [CobroController::class, 'index'])->middleware('permission:cobros.pagos.ver')->name('cobros.pagos.index');
    Route::get('/cobros/detalle', [CobroController::class, 'detail'])->middleware('permission:cobros.ver')->name('cobros.detalle');
    Route::post('/cobros/generar', [CobroController::class, 'generar'])->middleware('permission:cobros.generar')->name('cobros.generar');
    Route::post('/cobros/forzar-actualizacion', [CobroController::class, 'forceRefresh'])->middleware('permission:cobros.forzar_actualizacion')->name('cobros.forzar');
    Route::post('/cobros/overrides', [CobroOverrideController::class, 'store'])->middleware('permission:cobros.generar')->name('cobros.overrides.store');
    Route::delete('/cobros/overrides/{override}', [CobroOverrideController::class, 'destroy'])->middleware('permission:cobros.generar')->name('cobros.overrides.destroy');

    // Pagos
    Route::post('/pagos', [PagoController::class, 'store'])->middleware('permission:cobros.pagos.registrar')->name('pagos.store');
    Route::post('/pagos/{pago}/reversa', [PagoController::class, 'reversa'])->middleware('permission:cobros.pagos.anular')->name('pagos.reversa');
    Route::get('/pagos/{pago}/auditoria', [PagoController::class, 'auditoria'])->middleware('permission:cobros.ver')->name('pagos.auditoria');

    // Comprobantes de pago (subidos por inquilinos desde el portal, revisados aquí)
    Route::get('/cobros/comprobantes', [ComprobantePagoController::class, 'index'])->middleware('permission:cobros.comprobantes.ver')->name('comprobantes.index');
    Route::patch('/cobros/comprobantes/{comprobante}/aprobar', [ComprobantePagoController::class, 'aprobar'])->middleware('permission:cobros.comprobantes.revisar')->name('comprobantes.aprobar');
    Route::patch('/cobros/comprobantes/{comprobante}/rechazar', [ComprobantePagoController::class, 'rechazar'])->middleware('permission:cobros.comprobantes.revisar')->name('comprobantes.rechazar');
    // Sin middleware de permiso especifico: la autorizacion (staff con
    // cobros.comprobantes.ver O el inquilino dueño) se resuelve dentro del
    // controller, igual que el resto del portal -- ver imagen().
    Route::get('/cobros/comprobantes/{comprobante}/imagen', [ComprobantePagoController::class, 'imagen'])->name('comprobantes.imagen');

    // Avisos
    Route::get('/avisos', [AvisoController::class, 'index'])->middleware('permission:avisos.ver')->name('avisos.index');

    // Usuarios
    Route::get('/usuarios', [UsuarioController::class, 'index'])->middleware('permission:usuarios.ver')->name('usuarios.index');
    Route::post('/usuarios', [UsuarioController::class, 'store'])->middleware('permission:usuarios.crear')->name('usuarios.store');
    Route::patch('/usuarios/{usuario}', [UsuarioController::class, 'update'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.update');
    Route::patch('/usuarios/{usuario}/rol', [UsuarioController::class, 'asignarRol'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.asignar-rol');
    Route::patch('/usuarios/{usuario}/estado', [UsuarioController::class, 'toggleEstado'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.estado');
    Route::patch('/usuarios/{usuario}/password', [UsuarioController::class, 'resetPassword'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.password');
    // Roles y permisos, y Campos del perfil viven en rutas propias (no bajo
    // /usuarios/*) porque son submodulos independientes de Configuracion, no
    // paginas hijas de Usuarios -- si comparten prefijo el sidebar los marca
    // ambos como activos a la vez.
    Route::get('/roles-permisos', [RolePermissionController::class, 'index'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.roles');
    Route::post('/roles-permisos', [RolePermissionController::class, 'store'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.roles.store');
    Route::patch('/roles-permisos/toggle', [RolePermissionController::class, 'toggle'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.roles.toggle');
    Route::get('/perfil-campos', [PerfilCampoController::class, 'index'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.perfil-campos');
    Route::patch('/perfil-campos/{campo}', [PerfilCampoController::class, 'update'])->middleware('permission:usuarios.asignar_rol')->name('usuarios.perfil-campos.update');

    // Consultas (del landing page publico)
    Route::get('/consultas', [ContactInquiryController::class, 'index'])->middleware('permission:consultas.ver')->name('consultas.index');
    Route::patch('/consultas/{consulta}', [ContactInquiryController::class, 'update'])->middleware('permission:consultas.gestionar')->name('consultas.update');
});

// Portal de Inquilinos -- fuera del panel admin, sin el catalogo de permisos
// {modulo}.{accion}, gateado solo por rol. De solo lectura salvo por las
// escrituras explicitamente permitidas (comprobante de pago, datos de
// contacto propios, password propia), que siempre resuelven la propiedad
// desde el usuario/id_persona autenticado, nunca de la request. La
// ocupacion.activa corre primero: si el contrato ya finalizo, ni siquiera
// llega a completar-perfil, se le cierra la sesion directamente.
Route::middleware(['auth', 'role:Inquilino', 'ocupacion.activa'])->prefix('portal')->name('portal.')->group(function () {
    Route::get('/completar-perfil', [PortalPerfilController::class, 'edit'])->name('perfil.completar');
    Route::patch('/completar-perfil', [PortalPerfilController::class, 'update'])->name('perfil.actualizar');
    Route::put('/completar-perfil/password', [PortalPerfilController::class, 'updatePassword'])->name('perfil.password');

    Route::middleware('perfil.completo')->group(function () {
        Route::get('/', [PortalController::class, 'index'])->name('index');
        Route::post('/comprobantes', [PortalComprobanteController::class, 'store'])->name('comprobantes.store');
        Route::get('/notificaciones', [PortalNotificacionController::class, 'index'])->name('notificaciones.index');
        Route::patch('/notificaciones/marcar-leidas', [PortalNotificacionController::class, 'marcarLeidas'])->name('notificaciones.marcar-leidas');
        Route::get('/cobros/{cobro}/recibo', [PortalReciboController::class, 'show'])->name('recibo');
        Route::get('/recibos/descargar', [PortalReciboController::class, 'descargarTodos'])->name('recibos.descargar-todos');
    });
});

require __DIR__.'/auth.php';
