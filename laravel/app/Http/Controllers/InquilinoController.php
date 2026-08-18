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
        $estado = $request->query('estado', 'ACTIVO');

        $inquilinos = Persona::inquilinos()
            ->when($q !== '', fn ($query) => $query->where(function ($sub) use ($q) {
                $sub->where('nombres', 'like', "%{$q}%")
                    ->orWhere('apellidos', 'like', "%{$q}%")
                    ->orWhere('numero_documento', 'like', "%{$q}%");
            }))
            ->when($estado !== 'TODOS', fn ($query) => $query->where('estado', $estado))
            ->withExists('user')
            ->with('ocupacionActiva.unidad:id_unidad,codigo_unidad,nombre_unidad')
            ->orderBy('apellidos')->orderBy('nombres')
            ->paginate(20)->withQueryString();

        return Inertia::render('Inquilinos/Index', [
            'inquilinos' => $inquilinos,
            'filtro' => $q,
            'estadoFiltro' => $estado,
            'totalActivos' => Persona::inquilinos()->where('estado', 'ACTIVO')->count(),
            'totalRegistrados' => Persona::inquilinos()->count(),
        ]);
    }

    /**
     * Un documento por tipo tiene un formato tecnico distinto -- validarlo
     * aqui evita que se registren inquilinos con numeros de documento que
     * despues no calzan con lo que pide, por ejemplo, la SUNAT para el DNI.
     */
    private const FORMATOS_DOCUMENTO = [
        'DNI' => ['patron' => '/^\d{8}$/', 'mensaje' => 'El DNI debe tener exactamente 8 dígitos.'],
        'RUC' => ['patron' => '/^\d{11}$/', 'mensaje' => 'El RUC debe tener exactamente 11 dígitos.'],
        'CE' => ['patron' => '/^[A-Za-z0-9]{6,12}$/', 'mensaje' => 'El Carné de Extranjería debe tener entre 6 y 12 caracteres alfanuméricos.'],
        'PASAPORTE' => ['patron' => '/^[A-Za-z0-9]{5,12}$/', 'mensaje' => 'El pasaporte debe tener entre 5 y 12 caracteres alfanuméricos.'],
    ];

    private function rules(?Persona $ignorar = null): array
    {
        return [
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'tipo_documento' => ['required', Rule::in(array_keys(self::FORMATOS_DOCUMENTO))],
            'numero_documento' => [
                'required', 'string', 'max:20',
                function ($attribute, $value, $fail) {
                    $formato = self::FORMATOS_DOCUMENTO[request('tipo_documento')] ?? null;
                    if ($formato && !preg_match($formato['patron'], $value)) {
                        $fail($formato['mensaje']);
                    }
                },
                Rule::unique('personas', 'numero_documento')
                    ->where(fn ($q) => $q->where('tipo_documento', request('tipo_documento')))
                    ->ignore($ignorar?->id_persona, 'id_persona'),
            ],
            'celular' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:120'],
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
        $data = $request->validate($this->rules($inquilino));
        $data['estado'] = $data['estado'] ?? 'ACTIVO';

        $inquilino->update($data);

        return back()->with('success', 'Inquilino actualizado correctamente');
    }

    public function toggleEstado(Persona $inquilino): RedirectResponse
    {
        $nuevoEstado = $inquilino->estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        $inquilino->update(['estado' => $nuevoEstado]);

        return back()->with('success', $nuevoEstado === 'INACTIVO' ? 'Inquilino dado de baja correctamente' : 'Inquilino reactivado correctamente');
    }
}
