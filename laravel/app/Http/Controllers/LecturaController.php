<?php

namespace App\Http\Controllers;

use App\Models\LecturaCorte;
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

        // Cortes intermedios (Fase 1: solo se guarda el numero, no cambia
        // ningun cobro todavia) -- solo los que vinieron con un valor; uno
        // vacio en el input no borra un id_corte valido, se ignora.
        $cortes = $request->input('cortes', []);
        if (is_array($cortes)) {
            foreach ($cortes as $corte) {
                if (!isset($corte['id']) || $corte['lectura_corte'] === null || $corte['lectura_corte'] === '') {
                    continue;
                }

                LecturaCorte::where('id', (int) $corte['id'])
                    ->where('id_periodo', $periodo->id_periodo)
                    ->update(['lectura_corte' => (float) $corte['lectura_corte'], 'registrado_por' => $request->user()->name]);
            }
        }

        return back()->with('success', 'Lecturas guardadas correctamente');
    }

    public function sync(Request $request, LecturaService $service): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $resultado = $service->sincronizar($periodo);

        return back()->with('success', "Lecturas sincronizadas: {$resultado['insertados']} nuevas, {$resultado['actualizados']} actualizadas");
    }

    /**
     * Corte manual: la unica via para partir un tramo sin que haya cambio
     * de ocupacion (ej. lectura de control a mitad de contrato). Los
     * cortes por cambio de inquilino los sigue creando sincronizar().
     */
    public function registrarCorte(Request $request, LecturaService $service): RedirectResponse
    {
        $data = $request->validate([
            'periodo_id' => ['required', 'integer', 'exists:periodos,id_periodo'],
            'id_unidad' => ['required', 'integer', 'exists:unidades,id_unidad'],
            'fecha_corte' => ['required', 'date'],
            'lectura_corte' => ['required', 'numeric', 'min:0'],
            'observacion' => ['nullable', 'string', 'max:255'],
        ]);

        $periodo = Periodo::actual($data['periodo_id']);

        $service->registrarCorteManual(
            $periodo,
            $data['id_unidad'],
            $data['fecha_corte'],
            (float) $data['lectura_corte'],
            $data['observacion'] ?? null,
            $request->user()->name,
        );

        return back()->with('success', 'Corte registrado correctamente');
    }
}
