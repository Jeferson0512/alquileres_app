<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Recuerda en sesión el último periodo elegido vía ?periodo_id= -- sin esto,
 * cambiar de periodo en una vista (Lecturas, Recibo, Liquidación...) y
 * después navegar a otra por el sidebar hacía que Periodo::actual() volviera
 * a caer en el periodo más reciente, porque cada request nuevo llegaba sin
 * ?periodo_id= en la URL. El PeriodSwitcher del topbar es compartido entre
 * vistas, así que el periodo elegido también debería serlo.
 */
class RememberPeriodoActual
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->filled('periodo_id')) {
            $request->session()->put('periodo_id', $request->integer('periodo_id'));
        }

        return $next($request);
    }
}
