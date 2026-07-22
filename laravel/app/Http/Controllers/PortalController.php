<?php

namespace App\Http\Controllers;

use App\Models\OcupacionUnidad;
use App\Services\AvisoService;
use App\Services\CobroService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Portal de solo lectura para el rol Inquilino -- ver docs del plan
 * "Portal de Inquilinos". Todas las consultas filtran explicitamente por
 * el id_persona del usuario autenticado, nunca por un parametro de la URL.
 */
class PortalController extends Controller
{
    public function index(Request $request, CobroService $cobroService, AvisoService $avisoService): Response
    {
        $user = $request->user();
        abort_unless($user->id_persona, 403, 'Tu cuenta no está vinculada a ningún inquilino.');

        $ocupacion = OcupacionUnidad::where('id_persona', $user->id_persona)
            ->where('estado', 'ACTIVO')
            ->with('unidad')
            ->first();

        $vencimiento = collect($avisoService->vencimientosContrato())
            ->firstWhere('id_persona', $user->id_persona);

        return Inertia::render('Portal/Index', [
            'persona' => $user->persona->only(['nombres', 'apellidos']),
            'ocupacion' => $ocupacion,
            'cobros' => $cobroService->listarParaPersona($user->id_persona),
            'vencimiento' => $vencimiento,
        ]);
    }
}
