<?php

namespace App\Http\Middleware;

use App\Models\ProfileField;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bloquea el portal del inquilino hasta que su Persona tenga completos
 * todos los campos que HOY estan marcados `required` en `profile_fields`
 * (ver Usuarios > Campos del perfil). Se re-evalua en cada visita -- no
 * hay un flag "ya completo" guardado, asi que si el Admin marca un campo
 * nuevo como obligatorio despues, se vuelve a pedir automaticamente.
 */
class EnsurePerfilCompleto
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $persona = $user?->persona;

        if ($persona && !$request->routeIs('portal.perfil.completar')) {
            $faltaAlgo = ProfileField::where('required', true)->get()
                ->contains(fn (ProfileField $campo) => empty($persona->{$campo->code}));

            if ($faltaAlgo) {
                return redirect()->route('portal.perfil.completar');
            }
        }

        return $next($request);
    }
}
