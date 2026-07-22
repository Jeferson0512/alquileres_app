<?php

namespace App\Http\Controllers;

use App\Models\UnidadMedidorCompartido;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UnidadMedidorCompartidoController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'id_unidad_titular' => ['required', 'integer', 'different:id_unidad_dependiente'],
            'id_unidad_dependiente' => ['required', 'integer'],
            'porcentaje_dependiente' => ['required', 'numeric', 'min:0', 'max:100'],
            'activo' => ['nullable', 'boolean'],
            'observacion' => ['nullable', 'string', 'max:255'],
        ]);

        $data['activo'] = $data['activo'] ?? true;
        $data['porcentaje_dependiente'] = round((float) $data['porcentaje_dependiente'], 2);

        UnidadMedidorCompartido::updateOrCreate(
            ['id_unidad_dependiente' => $data['id_unidad_dependiente']],
            $data
        );

        return back()->with('success', 'Relación de medidor compartido guardada');
    }

    public function destroy(UnidadMedidorCompartido $medidorCompartido): RedirectResponse
    {
        $medidorCompartido->delete();

        return back()->with('success', 'Relación eliminada');
    }
}
