<?php

namespace App\Http\Controllers;

use App\Models\Inmueble;
use App\Models\TarifaAuditoria;
use App\Models\TarifaServicio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TarifaController extends Controller
{
    public function index(): Response
    {
        $idInmueble = Inmueble::activoActual()->id_inmueble;

        return Inertia::render('Tarifas/Index', [
            'tarifas' => TarifaServicio::where('id_inmueble', $idInmueble)
                ->orderBy('id_tarifa')
                ->get(['id_tarifa', 'id_inmueble', 'servicio', 'descripcion', 'monto', 'por_unidad', 'activo']),
        ]);
    }

    public function update(Request $request, TarifaServicio $tarifa): RedirectResponse
    {
        $data = $request->validate([
            'descripcion' => ['nullable', 'string', 'max:200'],
            'monto' => ['nullable', 'numeric', 'min:0'],
            'activo' => ['nullable', 'boolean'],
        ]);

        if (empty($data)) {
            return back()->withErrors(['general' => 'Sin campos a actualizar']);
        }

        $before = $tarifa->toArray();

        if (isset($data['monto'])) {
            $data['monto'] = round((float) $data['monto'], 2);
        }

        $tarifa->update($data);

        TarifaAuditoria::create([
            'id_tarifa' => $tarifa->id_tarifa,
            'accion' => 'ACTUALIZADO',
            'actor' => $request->user()->name,
            'payload_before' => $before,
            'payload_after' => $tarifa->fresh()->toArray(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Tarifa actualizada correctamente');
    }
}
