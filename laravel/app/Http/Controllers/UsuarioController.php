<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UsuarioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Usuarios/Index', [
            'usuarios' => User::with('roles:id,name')->orderBy('name')->get(['id', 'name', 'email', 'estado', 'id_persona'])
                ->map(fn ($u) => [
                    'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'estado' => $u->estado,
                    'rol' => $u->roles->first()?->name, 'id_persona' => $u->id_persona,
                ]),
            'roles' => Role::orderBy('name')->pluck('name'),
            'personasDisponibles' => Persona::inquilinos()
                ->whereDoesntHave('user')
                ->orderBy('nombres')
                ->get(['id_persona', 'nombres', 'apellidos', 'email']),
        ]);
    }

    /**
     * Para el rol Inquilino, nombre y email del login SIEMPRE se derivan
     * de la Persona ya registrada -- nunca se confia en lo que mande el
     * cliente para esos dos campos, así no hay forma de que el login
     * quede con un nombre/email distinto al de su ficha real.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'password' => ['required', Password::defaults()],
            'rol' => ['required', 'string', 'exists:roles,name'],
        ]);

        if ($data['rol'] === 'Inquilino') {
            $request->validate([
                'id_persona' => ['required', 'integer', 'exists:personas,id_persona', 'unique:users,id_persona'],
            ]);

            $persona = Persona::findOrFail($request->integer('id_persona'));

            if (empty($persona->email)) {
                throw ValidationException::withMessages(['id_persona' => 'Este inquilino no tiene email registrado. Agrégaselo primero desde Inquilinos.']);
            }
            if (User::where('email', $persona->email)->exists()) {
                throw ValidationException::withMessages(['id_persona' => 'Ya existe una cuenta con ese email.']);
            }

            $name = trim($persona->nombres.' '.$persona->apellidos);
            $email = $persona->email;
            $idPersona = $persona->id_persona;
        } else {
            $extra = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            ]);
            $name = $extra['name'];
            $email = $extra['email'];
            $idPersona = null;
        }

        $usuario = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $data['password'],
            'id_persona' => $idPersona,
        ]);
        $usuario->assignRole($data['rol']);

        return back()->with('success', 'Usuario creado correctamente');
    }

    /**
     * Solo aplica a cuentas SIN Persona vinculada (Admin/Supervisor) -- las
     * de Inquilino siguen derivando nombre/email de su ficha (ver store()),
     * asi que para esas se edita desde Inquilinos, no desde aqui.
     */
    public function update(Request $request, User $usuario): RedirectResponse
    {
        if ($usuario->id_persona !== null) {
            throw ValidationException::withMessages(['general' => 'Esta cuenta está vinculada a un inquilino: edita su nombre/email desde Inquilinos.']);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$usuario->id],
        ]);

        $usuario->update($data);

        return back()->with('success', 'Usuario actualizado correctamente');
    }

    /**
     * Reseteo administrativo: el admin fija una contraseña nueva sin
     * necesitar la actual -- para cuando el usuario la olvido y no puede
     * entrar el mismo a cambiarla. Aplica a cualquier rol, incluido Inquilino.
     */
    public function resetPassword(Request $request, User $usuario): RedirectResponse
    {
        $data = $request->validate([
            'password' => ['required', Password::defaults()],
        ]);

        $usuario->update(['password' => $data['password']]);

        return back()->with('success', "Contraseña de {$usuario->name} actualizada correctamente");
    }

    public function asignarRol(Request $request, User $usuario): RedirectResponse
    {
        $data = $request->validate([
            'rol' => ['required', 'string', 'exists:roles,name'],
        ]);

        $usuario->syncRoles([$data['rol']]);

        return back()->with('success', 'Rol actualizado correctamente');
    }

    /**
     * Da de baja o reactiva el acceso de un usuario. No se puede
     * desactivar a uno mismo (te dejarias fuera del sistema en el acto)
     * ni al ultimo Admin activo (nadie podria administrar la app despues).
     */
    public function toggleEstado(Request $request, User $usuario): RedirectResponse
    {
        if ($usuario->id === $request->user()->id) {
            throw ValidationException::withMessages(['general' => 'No puedes desactivar tu propia cuenta.']);
        }

        $nuevoEstado = $usuario->estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

        if ($nuevoEstado === 'INACTIVO' && $usuario->hasRole('Admin')) {
            $otrosAdminsActivos = User::role('Admin')->where('estado', 'ACTIVO')->where('id', '!=', $usuario->id)->exists();
            if (!$otrosAdminsActivos) {
                throw ValidationException::withMessages(['general' => 'No puedes desactivar al único Admin activo.']);
            }
        }

        $usuario->update(['estado' => $nuevoEstado]);

        return back()->with('success', $nuevoEstado === 'INACTIVO' ? 'Usuario desactivado correctamente' : 'Usuario reactivado correctamente');
    }
}
