<?php

namespace App\Http\Controllers;

use App\Models\Periodo;
use App\Services\PeriodoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeriodoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Periodos/Index', [
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get([
                'id_periodo', 'anio', 'mes', 'fecha_inicio', 'fecha_fin', 'estado', 'observacion',
            ]),
        ]);
    }

    public function store(Request $request, PeriodoService $service): RedirectResponse
    {
        $service->crear($request->only(['anio', 'mes', 'fecha_inicio', 'fecha_fin', 'estado', 'observacion']));

        return back()->with('success', 'Periodo creado correctamente');
    }

    public function update(Request $request, Periodo $periodo): RedirectResponse
    {
        $data = $request->only(['observacion', 'estado', 'fecha_inicio', 'fecha_fin']);
        $data = array_filter($data, fn ($v) => $v !== null);

        if (isset($data['estado']) && !in_array($data['estado'], ['ABIERTO', 'CERRADO', 'ANULADO'], true)) {
            unset($data['estado']);
        }

        if (empty($data)) {
            return back()->withErrors(['general' => 'No se recibieron campos para actualizar']);
        }

        $periodo->update($data);

        return back()->with('success', 'Periodo actualizado correctamente');
    }
}
