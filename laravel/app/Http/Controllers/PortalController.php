<?php

namespace App\Http\Controllers;

use App\Models\ComprobantePago;
use App\Models\ConfigCobranza;
use App\Models\Inmueble;
use App\Models\OcupacionUnidad;
use App\Services\AvisoService;
use App\Services\CobroService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Portal para el rol Inquilino -- ver docs del plan "Portal de Inquilinos".
 * Todas las consultas filtran explicitamente por el id_persona del usuario
 * autenticado, nunca por un parametro de la URL. Este controller en si es
 * de solo lectura; la unica escritura del portal (subir un comprobante de
 * pago) vive en PortalComprobanteController y repite la misma regla.
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

        $config = ConfigCobranza::where('id_inmueble', Inmueble::activoActual()->id_inmueble)->first();

        return Inertia::render('Portal/Index', [
            'persona' => $user->persona->only(['nombres', 'apellidos']),
            'ocupacion' => $ocupacion,
            'cobros' => $cobroService->listarParaPersona($user->id_persona),
            'vencimiento' => $vencimiento,
            'configCobranza' => [
                'yape_titular' => $config->yape_titular ?? null,
                'yape_numero' => $config->yape_numero ?? null,
                'yape_qr' => $config?->yape_qr ? Storage::url($config->yape_qr) : null,
            ],
            'misComprobantes' => ComprobantePago::where('id_persona', $user->id_persona)
                ->orderByDesc('created_at')
                ->get(['id', 'id_cobro', 'estado', 'monto_declarado', 'motivo_rechazo', 'created_at']),
        ]);
    }
}
