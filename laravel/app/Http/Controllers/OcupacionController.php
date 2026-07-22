<?php

namespace App\Http\Controllers;

use App\Models\OcupacionUnidad;
use App\Models\Persona;
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
    public function index(): Response
    {
        $ocupacions = OcupacionUnidad::with(['unidad:id_unidad,codigo_unidad,nombre_unidad', 'persona:id_persona,nombres,apellidos'])
            ->orderByDesc('fecha_inicio')->orderByDesc('id_ocupacion')
            ->get();

        return Inertia::render('Ocupaciones/Index', [
            'ocupaciones' => $ocupacions,
            'unidades' => Unidad::where('estado', 'ACTIVO')->orderBy('codigo_unidad')->get(['id_unidad', 'codigo_unidad', 'nombre_unidad']),
            'inquilinos' => Persona::inquilinos()->where('estado', 'ACTIVO')->orderBy('apellidos')
                ->withExists('user')
                ->get(['id_persona', 'nombres', 'apellidos', 'email']),
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
        $data['estado'] = $data['estado'] ?? 'ACTIVO';
        $data['monto_alquiler'] = $data['monto_alquiler'] ?? 0;
        $data['garantia'] = $data['garantia'] ?? 0;

        if ($data['estado'] === 'ACTIVO') {
            $this->assertSinActivaSolapada($data['id_unidad']);
        }

        $usuarioData = $this->validarDatosUsuarioPortal($request, $data['id_persona']);

        DB::transaction(function () use ($data, $usuarioData) {
            OcupacionUnidad::create($data);

            if ($usuarioData) {
                $this->crearUsuarioPortal($data['id_persona'], $usuarioData);
            }
        });

        return back()->with('success', $usuarioData
            ? 'Ocupación creada y acceso al portal habilitado correctamente'
            : 'Ocupación creada correctamente');
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

    public function destroy(OcupacionUnidad $ocupacion): RedirectResponse
    {
        $ocupacion->update([
            'estado' => 'FINALIZADO',
            'fecha_fin' => $ocupacion->fecha_fin ?? now()->toDateString(),
        ]);

        return back()->with('success', 'Ocupación finalizada correctamente');
    }
}
