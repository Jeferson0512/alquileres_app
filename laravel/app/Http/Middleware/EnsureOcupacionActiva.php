<?php

namespace App\Http\Middleware;

use App\Models\OcupacionUnidad;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Corta el acceso al portal apenas la ocupacion del inquilino deja de
 * estar ACTIVO (contrato finalizado/anulado) -- se re-evalua en cada
 * visita, no solo al momento del login, para el caso en que el Admin
 * finaliza el contrato mientras el inquilino ya tiene una sesion abierta.
 */
class EnsureOcupacionActiva
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $tieneOcupacionActiva = $user->id_persona
            && OcupacionUnidad::where('id_persona', $user->id_persona)->where('estado', 'ACTIVO')->exists();

        if (!$tieneOcupacionActiva) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Tu contrato ha finalizado. Contacta al administrador si crees que esto es un error.',
            ]);
        }

        return $next($request);
    }
}
