<?php

namespace App\Http\Controllers;

use App\Models\Periodo;
use App\Models\ReciboLuz;
use App\Services\DashboardService;
use App\Services\LiquidacionService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request, DashboardService $dashboardService, LiquidacionService $liquidacionService): Response
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);

        try {
            $preview = $liquidacionService->preview($periodo);
        } catch (ValidationException $e) {
            $preview = null;
        }

        return Inertia::render('Dashboard', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'recibo' => ReciboLuz::where('id_periodo', $periodo->id_periodo)->first(),
            'preview' => $preview,
            'stats' => $dashboardService->stats($periodo),
        ]);
    }
}
