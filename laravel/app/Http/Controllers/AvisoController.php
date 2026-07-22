<?php

namespace App\Http\Controllers;

use App\Models\ConfigCobranza;
use App\Models\Inmueble;
use App\Models\Periodo;
use App\Services\AvisoService;
use App\Services\CobroService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AvisoController extends Controller
{
    public function index(Request $request, CobroService $cobroService, AvisoService $avisoService): Response
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $idInmueble = Inmueble::activoActual()->id_inmueble;

        return Inertia::render('Avisos/Index', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'cobros' => $cobroService->listarParaPeriodo($periodo),
            'config' => ConfigCobranza::where('id_inmueble', $idInmueble)->first() ?? [
                'id_inmueble' => $idInmueble,
                'monto_minimo_luz' => 0,
                'minimo_kwh_aviso' => 13.5,
                'yape_titular' => '',
                'yape_numero' => '',
                'yape_qr' => '',
                'banco_nombre' => '',
                'banco_titular' => '',
                'banco_cuenta' => '',
                'banco_cci' => '',
                'mensaje_base' => '',
            ],
            'vencimientosContrato' => $avisoService->vencimientosContrato(),
        ]);
    }
}
