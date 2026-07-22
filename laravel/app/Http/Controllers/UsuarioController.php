<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
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
                ->get(['id_persona', 'nombres', 'apellidos']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'rol' => ['required', 'string', 'exists:roles,name'],
            'id_persona' => ['required_if:rol,Inquilino', 'nullable', 'integer', 'exists:personas,id_persona', 'unique:users,id_persona'],
        ]);

        $usuario = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'id_persona' => $data['id_persona'] ?? null,
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
