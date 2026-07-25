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

    /**
     * Solo fecha_fin y observacion son editables -- año/mes/fecha_inicio
     * identifican el periodo y el cierre del anterior ya se hace solo al
     * crear uno nuevo (ver PeriodoService::crear), asi que no hay boton de
     * "cerrar" manual aqui.
     */
    public function update(Request $request, Periodo $periodo): RedirectResponse
    {
        $data = $request->validate([
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:'.$periodo->fecha_inicio->toDateString()],
            'observacion' => ['nullable', 'string', 'max:255'],
        ]);
        $data = array_filter($data, fn ($v) => $v !== null);

        if (empty($data)) {
            return back()->withErrors(['general' => 'No se recibieron campos para actualizar']);
        }

        $periodo->update($data);

        return back()->with('success', 'Periodo actualizado correctamente');
    }
}
