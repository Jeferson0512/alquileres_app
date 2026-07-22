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
            'usuarios' => User::with('roles:id,name')->orderBy('name')->get(['id', 'name', 'email'])
                ->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'rol' => $u->roles->first()?->name]),
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
            'password' => ['required', Password::min(8)],
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

    public function asignarRol(Request $request, User $usuario): RedirectResponse
    {
        $data = $request->validate([
            'rol' => ['required', 'string', 'exists:roles,name'],
        ]);

        $usuario->syncRoles([$data['rol']]);

        return back()->with('success', 'Rol actualizado correctamente');
    }
}
