<?php

namespace App\Http\Controllers;

use App\Models\Unidad;
use App\Models\UnidadMedidorCompartido;
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
            // Todos los códigos existentes (cualquier estado) para sugerir el
            // siguiente correlativo por piso en el formulario de alta -- si no
            // se incluyeran las dadas de baja, se podría repetir un código que
            // ya se usó antes.
            'todosCodigos' => Unidad::select('piso', 'codigo_unidad')->get(),
        ]);
    }

    private function rules(?Unidad $ignorar = null): array
    {
        return [
            'id_inmueble' => ['required', 'integer', 'min:1'],
            'codigo_unidad' => [
                'required', 'string', 'max:20',
                // Mismo constraint que ya existe en la base (uq_unidad_codigo,
                // por id_inmueble) -- validarlo acá evita el 500 crudo de una
                // violación de índice único y da un mensaje claro en su lugar.
                Rule::unique('unidades', 'codigo_unidad')
                    ->where(fn ($q) => $q->where('id_inmueble', request('id_inmueble')))
                    ->ignore($ignorar?->id_unidad, 'id_unidad'),
            ],
            'nombre_unidad' => ['required', 'string', 'max:100'],
            'piso' => ['required', 'integer', 'min:0', 'max:50'],
            'tipo_unidad' => ['nullable', Rule::in(Unidad::TIPOS)],
            'tiene_medidor' => ['nullable', Rule::in(['SI', 'NO'])],
            'medidor_codigo' => ['nullable', 'string', 'max:50'],
            'tarifa_alquiler_base' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'observacion' => ['nullable', 'string', 'max:255'],
            'estado' => ['nullable', Rule::in(['ACTIVO', 'INACTIVO'])],
        ];
    }

    private const MENSAJES = [
        'codigo_unidad.unique' => 'Ya existe una unidad con este código en el inmueble.',
    ];

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules(), self::MENSAJES);
        $data['tipo_unidad'] = $data['tipo_unidad'] ?? 'CUARTO';
        $data['tiene_medidor'] = $data['tiene_medidor'] ?? 'SI';
        $data['estado'] = $data['estado'] ?? 'ACTIVO';
        $data['tarifa_alquiler_base'] = $data['tarifa_alquiler_base'] ?? 0;

        Unidad::create($data);

        return back()->with('success', 'Unidad creada correctamente');
    }

    public function update(Request $request, Unidad $unidad): RedirectResponse
    {
        $data = $request->validate($this->rules($unidad), self::MENSAJES);
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

        // No tiene sentido operativo dar de baja una unidad que ahora mismo
        // tiene un inquilino viviendo ahí -- primero hay que finalizar esa
        // ocupación (igual que assertSinActivaSolapada cuida el caso inverso).
        if ($nuevoEstado === 'INACTIVO' && $unidad->ocupaciones()->where('estado', 'ACTIVO')->exists()) {
            return back()->with('error', 'No se puede dar de baja: la unidad tiene una ocupación activa. Finalizá el contrato primero.');
        }

        // Si esta unidad es el medidor titular de otra(s) unidad(es)
        // dependientes (ver UnidadMedidorCompartido), darla de baja las deja
        // sin medidor de referencia para calcular su prorrateo de luz.
        if ($nuevoEstado === 'INACTIVO' && UnidadMedidorCompartido::where('id_unidad_titular', $unidad->id_unidad)->where('activo', true)->exists()) {
            return back()->with('error', 'No se puede dar de baja: esta unidad es el medidor titular de otra(s) unidad(es) dependientes. Reasigná esa relación primero.');
        }

        $unidad->update(['estado' => $nuevoEstado]);

        return back()->with('success', $nuevoEstado === 'INACTIVO' ? 'Unidad dada de baja correctamente' : 'Unidad reactivada correctamente');
    }
}
