<?php

namespace App\Http\Controllers;

use App\Models\ProfileField;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalPerfilController extends Controller
{
    public function edit(Request $request): Response
    {
        $persona = $request->user()->persona;

        return Inertia::render('Portal/CompletarPerfil', [
            'persona' => $persona->only(['celular', 'email', 'direccion']),
            'campos' => ProfileField::orderBy('id')->get(['code', 'label', 'required']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $persona = $request->user()->persona;
        $requeridos = ProfileField::where('required', true)->pluck('code')->all();

        $data = $request->validate([
            'celular' => [in_array('celular', $requeridos) ? 'required' : 'nullable', 'string', 'max:30'],
            'email' => [in_array('email', $requeridos) ? 'required' : 'nullable', 'email', 'max:120'],
            'direccion' => [in_array('direccion', $requeridos) ? 'required' : 'nullable', 'string', 'max:255'],
        ]);

        $persona->update($data);

        return redirect()->route('portal.index');
    }
}
