<?php

namespace App\Http\Controllers;

use App\Models\Unidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UnidadController extends Controller
{
    public function index(Request $request): Response
    {
        $estado = $request->query('estado', 'ACTIVO');

        return Inertia::render('Unidades/Index', [
            'unidades' => Unidad::when($estado !== 'TODOS', fn ($query) => $query->where('estado', $estado))
                ->orderBy('piso')->orderBy('codigo_unidad')->paginate(20)->withQueryString(),
            'tipos' => Unidad::TIPOS,
            'estadoFiltro' => $estado,
        ]);
    }

    private function rules(): array
    {
        return [
            'id_inmueble' => ['required', 'integer', 'min:1'],
            'codigo_unidad' => ['required', 'string', 'max:20'],
            'nombre_unidad' => ['required', 'string', 'max:100'],
            'piso' => ['required', 'integer'],
            'tipo_unidad' => ['nullable', Rule::in(Unidad::TIPOS)],
            'tiene_medidor' => ['nullable', Rule::in(['SI', 'NO'])],
            'medidor_codigo' => ['nullable', 'string', 'max:50'],
            'tarifa_alquiler_base' => ['nullable', 'numeric', 'min:0'],
            'observacion' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', Rule::in(['ACTIVO', 'INACTIVO'])],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['tipo_unidad'] = $data['tipo_unidad'] ?? 'CUARTO';
        $data['tiene_medidor'] = $data['tiene_medidor'] ?? 'SI';
        $data['estado'] = $data['estado'] ?? 'ACTIVO';
        $data['tarifa_alquiler_base'] = $data['tarifa_alquiler_base'] ?? 0;

        Unidad::create($data);

        return back()->with('success', 'Unidad creada correctamente');
    }

    public function update(Request $request, Unidad $unidad): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['tipo_unidad'] = $data['tipo_unidad'] ?? 'CUARTO';
        $data['tiene_medidor'] = $data['tiene_medidor'] ?? 'SI';
        $data['estado'] = $data['estado'] ?? 'ACTIVO';
        $data['tarifa_alquiler_base'] = $data['tarifa_alquiler_base'] ?? 0;

        $unidad->update($data);

        return back()->with('success', 'Unidad actualizada correctamente');
    }

    public function toggleEstado(Unidad $unidad): RedirectResponse
    {
        $nuevoEstado = $unidad->estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        $unidad->update(['estado' => $nuevoEstado]);

        return back()->with('success', $nuevoEstado === 'INACTIVO' ? 'Unidad dada de baja correctamente' : 'Unidad reactivada correctamente');
    }
}
