<?php

namespace App\Http\Controllers;

use App\Models\OcupacionUnidad;
use App\Models\Persona;
use App\Models\Unidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OcupacionController extends Controller
{
    public function index(): Response
    {
        $ocupacions = OcupacionUnidad::with(['unidad:id_unidad,codigo_unidad,nombre_unidad', 'persona:id_persona,nombres,apellidos'])
            ->orderByDesc('fecha_inicio')->orderByDesc('id_ocupacion')
            ->get();

        return Inertia::render('Ocupaciones/Index', [
            'ocupaciones' => $ocupacions,
            'unidades' => Unidad::where('estado', 'ACTIVO')->orderBy('codigo_unidad')->get(['id_unidad', 'codigo_unidad', 'nombre_unidad']),
            'inquilinos' => Persona::inquilinos()->where('estado', 'ACTIVO')->orderBy('apellidos')->get(['id_persona', 'nombres', 'apellidos']),
        ]);
    }

    private function rules(): array
    {
        return [
            'id_unidad' => ['required', 'integer'],
            'id_persona' => ['required', 'integer'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'monto_alquiler' => ['nullable', 'numeric', 'min:0'],
            'garantia' => ['nullable', 'numeric', 'min:0'],
            'estado' => ['nullable', Rule::in(['ACTIVO', 'FINALIZADO', 'ANULADO'])],
            'observacion' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function assertSinActivaSolapada(int $idUnidad, ?int $exceptId = null): void
    {
        $existe = OcupacionUnidad::where('id_unidad', $idUnidad)
            ->where('estado', 'ACTIVO')
            ->when($exceptId, fn ($q) => $q->where('id_ocupacion', '!=', $exceptId))
            ->exists();

        if ($existe) {
            throw ValidationException::withMessages(['id_unidad' => 'La unidad ya tiene una ocupación activa']);
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['estado'] = $data['estado'] ?? 'ACTIVO';
        $data['monto_alquiler'] = $data['monto_alquiler'] ?? 0;
        $data['garantia'] = $data['garantia'] ?? 0;

        if ($data['estado'] === 'ACTIVO') {
            $this->assertSinActivaSolapada($data['id_unidad']);
        }

        OcupacionUnidad::create($data);

        return back()->with('success', 'Ocupación creada correctamente');
    }

    public function update(Request $request, OcupacionUnidad $ocupacion): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['estado'] = $data['estado'] ?? 'ACTIVO';
        $data['monto_alquiler'] = $data['monto_alquiler'] ?? 0;
        $data['garantia'] = $data['garantia'] ?? 0;

        if ($data['estado'] === 'ACTIVO') {
            $this->assertSinActivaSolapada($data['id_unidad'], $ocupacion->id_ocupacion);
        }

        $ocupacion->update($data);

        return back()->with('success', 'Ocupación actualizada correctamente');
    }

    public function destroy(OcupacionUnidad $ocupacion): RedirectResponse
    {
        $ocupacion->update([
            'estado' => 'FINALIZADO',
            'fecha_fin' => $ocupacion->fecha_fin ?? now()->toDateString(),
        ]);

        return back()->with('success', 'Ocupación finalizada correctamente');
    }
}
