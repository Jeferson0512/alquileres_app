<?php

namespace App\Providers;

use App\Services\SecurityAuditService;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Politica minima para cualquier Password::defaults() de la app (login,
        // reset, cambio de password). No se agrega ->uncompromised() a proposito:
        // esa opcion consulta una API externa (Have I Been Pwned) por cada
        // password, y este servidor no siempre tiene salida a internet garantizada.
        Password::defaults(fn () => Password::min(8)->mixedCase()->numbers());

        // Por defecto, RedirectIfAuthenticated manda a cualquier usuario ya
        // logueado que visite /login (u otra ruta "guest") a la ruta llamada
        // "dashboard" sin fijarse si tiene permiso -- un Inquilino no tiene
        // dashboard.ver, asi que terminaba en un 403 crudo en ingles (la
        // excepcion de Spatie) en vez de volver a su portal.
        RedirectIfAuthenticated::redirectUsing(function (Request $request) {
            return $request->user()?->hasRole('Inquilino')
                ? route('portal.index')
                : route('dashboard');
        });

        // Auditoria de seguridad -- antes no quedaba ningun registro de quien
        // inicio sesion, fallo, cerro sesion o reseteo su contraseña. Se
        // engancha a los eventos nativos que Auth::attempt()/logout()/
        // Password::reset() ya disparan solos, sin tocar los controllers de
        // Breeze. Ver SecurityAuditService y, para lo que no tiene evento
        // propio (solicitud de reset, eliminacion de cuenta), las llamadas
        // manuales en PasswordResetLinkController y ProfileController.
        Event::listen(Login::class, fn (Login $e) => app(SecurityAuditService::class)->log('LOGIN_OK', $e->user->id, $e->user->email));
        Event::listen(Failed::class, fn (Failed $e) => app(SecurityAuditService::class)->log('LOGIN_FALLIDO', $e->user?->id, $e->credentials['email'] ?? null));
        Event::listen(Logout::class, fn (Logout $e) => app(SecurityAuditService::class)->log('LOGOUT', $e->user?->id, $e->user?->email));
        Event::listen(PasswordReset::class, fn (PasswordReset $e) => app(SecurityAuditService::class)->log('PASSWORD_RESET_COMPLETADO', $e->user->id, $e->user->email));
    }
}
