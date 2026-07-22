<?php

namespace App\Http\Controllers;

use App\Models\CobroOverrideServicio;
use App\Models\Periodo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CobroOverrideController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $data = $request->validate([
            'id_unidad' => ['required', 'integer'],
            'id_persona' => ['required', 'integer'],
            'servicio' => ['required', Rule::in(['AGUA', 'GAS', 'MANTENIMIENTO'])],
            'monto' => ['required', 'numeric', 'min:0'],
            'observacion' => ['nullable', 'string', 'max:255'],
        ]);

        CobroOverrideServicio::updateOrCreate(
            ['id_periodo' => $periodo->id_periodo, 'id_unidad' => $data['id_unidad'], 'id_persona' => $data['id_persona'], 'servicio' => $data['servicio']],
            ['monto' => round($data['monto'], 2), 'observacion' => $data['observacion'] ?? null]
        );

        return back()->with('success', 'Override guardado');
    }

    public function destroy(Request $request, CobroOverrideServicio $override): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $override->delete();

        return back()->with('success', 'Override eliminado');
    }
}
