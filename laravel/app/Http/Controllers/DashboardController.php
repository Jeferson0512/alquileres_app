<?php

namespace App\Http\Controllers;

use App\Models\Periodo;
use App\Models\ReciboLuz;
use App\Services\AvisoService;
use App\Services\CobroService;
use App\Services\DashboardService;
use App\Services\LiquidacionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(
        Request $request,
        DashboardService $dashboardService,
        LiquidacionService $liquidacionService,
        CobroService $cobroService,
        AvisoService $avisoService,
    ): Response {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);

        try {
            $preview = $liquidacionService->preview($periodo);
        } catch (ValidationException $e) {
            $preview = null;
        }

        $cobros = $cobroService->listarParaPeriodo($periodo);

        return Inertia::render('Dashboard', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'recibo' => ReciboLuz::where('id_periodo', $periodo->id_periodo)->first(),
            'preview' => $preview,
            'stats' => $dashboardService->stats($periodo),
            'tendencia' => $dashboardService->tendenciaMensual(),
            'estadoCobros' => [
                'PENDIENTE' => collect($cobros)->where('estado_pago', 'PENDIENTE')->count(),
                'PARCIAL' => collect($cobros)->where('estado_pago', 'PARCIAL')->count(),
                'PAGADO' => collect($cobros)->where('estado_pago', 'PAGADO')->count(),
            ],
            'morosidadTotal' => round(collect($cobros)->sum('deuda_anterior'), 2),
            'vencimientosContrato' => $avisoService->vencimientosContrato(),
            'consumoAnterior' => $dashboardService->consumoPorUnidadPeriodoAnterior($periodo),
        ]);
    }
}
