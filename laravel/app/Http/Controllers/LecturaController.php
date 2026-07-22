<?php

namespace App\Http\Controllers;

use App\Models\LecturaUnidad;
use App\Models\Periodo;
use App\Services\LecturaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LecturaController extends Controller
{
    public function index(Request $request, LecturaService $service): Response
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);

        return Inertia::render('Lecturas/Index', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'lecturas' => $service->filasParaPeriodo($periodo),
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $items = $request->input('items', []);
        if (!is_array($items) || empty($items)) {
            return back()->withErrors(['general' => 'No se recibieron lecturas']);
        }

        foreach ($items as $item) {
            LecturaUnidad::where('id_lectura', (int) ($item['id_lectura'] ?? 0))
                ->where('id_periodo', $periodo->id_periodo)
                ->update(['lectura_actual' => (float) ($item['lectura_actual'] ?? 0)]);
        }

        return back()->with('success', 'Lecturas guardadas correctamente');
    }

    public function sync(Request $request, LecturaService $service): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $resultado = $service->sincronizar($periodo);

        return back()->with('success', "Lecturas sincronizadas: {$resultado['insertados']} nuevas, {$resultado['actualizados']} actualizadas");
    }
}
