<?php

namespace App\Http\Controllers;

use App\Models\OcupacionUnidad;
use App\Models\Persona;
use App\Models\RenovacionPendiente;
use App\Models\Unidad;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OcupacionController extends Controller
{
    public function index(Request $request): Response
    {
        $estado = $request->query('estado', 'ACTIVO');

        $ocupacions = OcupacionUnidad::with(['unidad:id_unidad,codigo_unidad,nombre_unidad', 'persona:id_persona,nombres,apellidos'])
            ->join('unidades as u', 'u.id_unidad', '=', 'ocupacion_unidad.id_unidad')
            ->when($estado !== 'TODOS', fn ($query) => $query->where('ocupacion_unidad.estado', $estado))
            ->orderBy('u.piso')->orderBy('u.codigo_unidad')
            ->select('ocupacion_unidad.*')
            ->paginate(20)->withQueryString();

        // Si viene de un clic en la notificacion de "renovacion pendiente",
        // resuelve la ocupacion anterior para que el frontend pre-llene el
        // formulario de "Nueva ocupacion" igual que si acabara de finalizar.
        $renovarDesde = null;
        $renovacionId = $request->query('renovar_de');
        if ($renovacionId) {
            $pendiente = RenovacionPendiente::where('id', $renovacionId)->where('estado', 'PENDIENTE')->first();
            $renovarDesde = $pendiente?->ocupacionAnterior;
        }

        return Inertia::render('Ocupaciones/Index', [
            'ocupaciones' => $ocupacions,
            'estadoFiltro' => $estado,
            'unidades' => Unidad::where('estado', 'ACTIVO')->orderBy('codigo_unidad')->get(['id_unidad', 'codigo_unidad', 'nombre_unidad', 'tarifa_alquiler_base']),
            'inquilinos' => Persona::inquilinos()->where('estado', 'ACTIVO')->orderBy('apellidos')
                ->withExists('user')
                ->get(['id_persona', 'nombres', 'apellidos', 'email']),
            'renovarDesde' => $renovarDesde,
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
            'renovada_de_id' => ['nullable', 'integer', 'exists:ocupacion_unidad,id_ocupacion'],
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

    /**
     * Valida los campos de alta de cuenta (si vinieron) ANTES de tocar la
     * base de datos -- se llama antes de abrir la transaccion para que un
     * error de validacion nunca deje una ocupacion creada/editada a medias
     * sin su usuario. El email del login SIEMPRE se deriva de la Persona
     * (nunca se confia en lo que mande el cliente) -- lo unico que el
     * Admin realmente elige aqui es la contraseña inicial.
     */
    private function validarDatosUsuarioPortal(Request $request, int $idPersona): ?array
    {
        if (!$request->boolean('crear_usuario')) {
            return null;
        }

        if (User::where('id_persona', $idPersona)->exists()) {
            throw ValidationException::withMessages(['crear_usuario' => 'Este inquilino ya tiene una cuenta de acceso al portal.']);
        }

        $persona = Persona::findOrFail($idPersona);
        if (empty($persona->email)) {
            throw ValidationException::withMessages(['crear_usuario' => 'Este inquilino no tiene email registrado. Agrégaselo primero desde Inquilinos.']);
        }
        if (User::where('email', $persona->email)->exists()) {
            throw ValidationException::withMessages(['crear_usuario' => 'Ya existe una cuenta con ese email.']);
        }

        $validated = $request->validate([
            'usuario_password' => ['required', Password::min(8)],
        ]);

        return ['email' => $persona->email, 'password' => $validated['usuario_password']];
    }

    private function crearUsuarioPortal(int $idPersona, array $usuarioData): void
    {
        $persona = Persona::find($idPersona);
        $usuario = User::create([
            'name' => trim($persona->nombres.' '.$persona->apellidos),
            'email' => $usuarioData['email'],
            'password' => $usuarioData['password'],
            'id_persona' => $idPersona,
        ]);
        $usuario->assignRole('Inquilino');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        // Toda ocupacion nueva nace ACTIVO -- los demas estados solo se
        // alcanzan despues via los botones dedicados (Finalizar/Anular),
        // nunca eligiendolo de entrada al registrar.
        $data['estado'] = 'ACTIVO';
        $data['monto_alquiler'] = $data['monto_alquiler'] ?? 0;
        $data['garantia'] = $data['garantia'] ?? 0;

        $this->assertSinActivaSolapada($data['id_unidad']);

        $usuarioData = $this->validarDatosUsuarioPortal($request, $data['id_persona']);

        $renovacionResuelta = false;

        DB::transaction(function () use ($data, $usuarioData, $request, &$renovacionResuelta) {
            $nueva = OcupacionUnidad::create($data);

            if ($usuarioData) {
                $this->crearUsuarioPortal($data['id_persona'], $usuarioData);
            }

            if (!empty($data['renovada_de_id'])) {
                $pendiente = RenovacionPendiente::where('id_ocupacion_anterior', $data['renovada_de_id'])
                    ->where('estado', 'PENDIENTE')
                    ->first();

                if ($pendiente) {
                    $pendiente->update([
                        'estado' => 'RESUELTA',
                        'id_ocupacion_nueva' => $nueva->id_ocupacion,
                        'resuelto_por' => $request->user()->name,
                        'resuelto_en' => now(),
                    ]);
                    $renovacionResuelta = true;
                }
            }
        });

        $mensaje = match (true) {
            $renovacionResuelta => 'Renovación completada correctamente',
            (bool) $usuarioData => 'Ocupación creada y acceso al portal habilitado correctamente',
            default => 'Ocupación creada correctamente',
        };

        return back()->with('success', $mensaje);
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

        $usuarioData = $this->validarDatosUsuarioPortal($request, $data['id_persona']);

        DB::transaction(function () use ($ocupacion, $data, $usuarioData) {
            $ocupacion->update($data);

            if ($usuarioData) {
                $this->crearUsuarioPortal($data['id_persona'], $usuarioData);
            }
        });

        return back()->with('success', $usuarioData
            ? 'Ocupación actualizada y acceso al portal habilitado correctamente'
            : 'Ocupación actualizada correctamente');
    }

    public function destroy(Request $request, OcupacionUnidad $ocupacion): RedirectResponse
    {
        $data = $request->validate([
            'motivo_fin' => ['required', Rule::in(['RENOVACION', 'MUDANZA', 'OTRO'])],
            'motivo_fin_detalle' => ['nullable', 'string', 'max:255', Rule::requiredIf($request->input('motivo_fin') === 'OTRO')],
            'fecha_fin' => ['nullable', 'date'],
        ]);

        DB::transaction(function () use ($ocupacion, $data, $request) {
            $ocupacion->update([
                'estado' => 'FINALIZADO',
                'fecha_fin' => $data['fecha_fin'] ?? $ocupacion->fecha_fin ?? now()->toDateString(),
                'motivo_fin' => $data['motivo_fin'],
                'motivo_fin_detalle' => $data['motivo_fin_detalle'] ?? null,
            ]);

            // Rastro server-side de la renovacion pendiente -- si el admin
            // cierra la pestaña antes de crear la nueva ocupacion, esto es
            // lo que permite recordarselo despues via notificaciones.
            if ($data['motivo_fin'] === 'RENOVACION') {
                RenovacionPendiente::create([
                    'id_ocupacion_anterior' => $ocupacion->id_ocupacion,
                    'estado' => 'PENDIENTE',
                    'creado_por' => $request->user()->name,
                ]);
            }
        });

        $mensaje = $data['motivo_fin'] === 'RENOVACION'
            ? 'Contrato marcado como renovado. Completa los datos de la nueva ocupación.'
            : 'Ocupación finalizada correctamente';

        return back()->with('success', $mensaje);
    }

    /**
     * Para cuando una ocupacion se creo por error -- distinto de Finalizar
     * (que es el cierre normal de un contrato que si se llego a vivir).
     */
    public function anular(OcupacionUnidad $ocupacion): RedirectResponse
    {
        $ocupacion->update(['estado' => 'ANULADO']);

        return back()->with('success', 'Ocupación anulada correctamente');
    }
}
