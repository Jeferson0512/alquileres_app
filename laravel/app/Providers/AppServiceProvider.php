<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Http\Request;
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
    }
}
