<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InquilinoController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));

        $inquilinos = Persona::inquilinos()
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('nombres', 'like', "%{$q}%")
                    ->orWhere('apellidos', 'like', "%{$q}%")
                    ->orWhere('numero_documento', 'like', "%{$q}%");
            }))
            ->orderBy('apellidos')->orderBy('nombres')
            ->get();

        return Inertia::render('Inquilinos/Index', [
            'inquilinos' => $inquilinos,
            'filtro' => $q,
        ]);
    }

    private function rules(): array
    {
        return [
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'tipo_documento' => ['nullable', 'string', 'max:20'],
            'numero_documento' => ['nullable', 'string', 'max:20'],
            'celular' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:120'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'observacion' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', Rule::in(['ACTIVO', 'INACTIVO'])],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['tipo_persona'] = 'INQUILINO';
        $data['estado'] = $data['estado'] ?? 'ACTIVO';

        Persona::create($data);

        return back()->with('success', 'Inquilino creado correctamente');
    }

    public function update(Request $request, Persona $inquilino): RedirectResponse
    {
        $data = $request->validate($this->rules());
        $data['estado'] = $data['estado'] ?? 'ACTIVO';

        $inquilino->update($data);

        return back()->with('success', 'Inquilino actualizado correctamente');
    }

    public function destroy(Persona $inquilino): RedirectResponse
    {
        $inquilino->update(['estado' => 'INACTIVO']);

        return back()->with('success', 'Inquilino desactivado correctamente');
    }
}
