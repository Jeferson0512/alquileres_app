<?php

namespace App\Http\Controllers;

use App\Models\Periodo;
use App\Services\LiquidacionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LiquidacionController extends Controller
{
    public function index(Request $request, LiquidacionService $service): Response
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);

        try {
            $preview = $service->preview($periodo);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $preview = ['meta' => null, 'data' => []];
        }

        return Inertia::render('Liquidacion/Index', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'meta' => $preview['meta'],
            'data' => $preview['data'],
        ]);
    }

    public function generar(Request $request, LiquidacionService $service): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $ajustes = [];
        foreach ($request->input('ajustes', []) as $item) {
            if (!empty($item['id_unidad'])) {
                $ajustes[(int) $item['id_unidad']] = (float) ($item['ajuste'] ?? 0);
            }
        }

        $service->generar($periodo, $ajustes);

        return back()->with('success', 'Liquidación generada correctamente');
    }
}
