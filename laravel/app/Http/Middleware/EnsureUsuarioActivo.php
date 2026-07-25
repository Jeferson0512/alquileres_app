<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Corta la sesion apenas la cuenta de un usuario (Admin/Supervisor/
 * Inquilino) queda INACTIVO -- se re-evalua en cada visita, no solo al
 * momento del login, para el caso en que se da de baja a alguien que ya
 * tiene una sesion abierta. Mismo patron que EnsureOcupacionActiva.
 */
class EnsureUsuarioActivo
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->estado === 'INACTIVO') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Tu cuenta ha sido desactivada. Contacta al administrador si crees que esto es un error.',
            ]);
        }

        return $next($request);
    }
}
