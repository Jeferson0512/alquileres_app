<?php

namespace App\Http\Controllers;

use App\Models\ProfileField;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class PortalPerfilController extends Controller
{
    public function edit(Request $request): Response
    {
        $persona = $request->user()->persona;
        $campos = ProfileField::orderBy('id')->get(['code', 'label', 'required']);

        $incompleto = $campos->where('required', true)
            ->contains(fn (ProfileField $campo) => empty($persona->{$campo->code}));

        return Inertia::render('Portal/CompletarPerfil', [
            'persona' => $persona->only(['celular', 'email', 'direccion']),
            'campos' => $campos,
            'incompleto' => $incompleto,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $persona = $request->user()->persona;
        $requeridos = ProfileField::where('required', true)->pluck('code')->all();

        $data = $request->validate([
            'celular' => [in_array('celular', $requeridos) ? 'required' : 'nullable', 'string', 'max:30'],
            'email' => [
                in_array('email', $requeridos) ? 'required' : 'nullable', 'email', 'max:120',
                Rule::unique('users', 'email')->ignore($request->user()->id),
            ],
            'direccion' => [in_array('direccion', $requeridos) ? 'required' : 'nullable', 'string', 'max:255'],
        ]);

        $persona->update($data);

        // users.email (con el que el inquilino inicia sesion) y personas.email
        // (este formulario) son columnas independientes que solo se copiaron
        // una vez, al crear el acceso al portal (UsuarioController/
        // OcupacionController) -- sin este sync, cambiar el email aca dejaba
        // el login desactualizado en silencio. Nunca se sincroniza un email
        // vacio: haria que la proxima vez no pueda ni iniciar sesion.
        if (! empty($data['email']) && $data['email'] !== $request->user()->email) {
            $request->user()->update(['email' => $data['email']]);
        }

        return redirect()->route('portal.index')->with('success', 'Tus datos se actualizaron correctamente');
    }

    /**
     * El inquilino cambia su propia password. Igual que en el perfil del
     * admin (Auth\PasswordController): exige la password actual como unica
     * "verificacion" -- nunca se resuelve el usuario desde la request, solo
     * de la sesion autenticada.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Tu contraseña se actualizó correctamente');
    }
}
