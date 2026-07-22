<?php

namespace App\Http\Controllers;

use App\Models\ProfileField;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PerfilCampoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Usuarios/PerfilCampos', [
            'campos' => ProfileField::orderBy('id')->get(['id', 'code', 'label', 'required']),
        ]);
    }

    public function update(Request $request, ProfileField $campo): RedirectResponse
    {
        $data = $request->validate(['required' => ['required', 'boolean']]);
        $campo->update($data);

        return back()->with('success', "Campo \"{$campo->label}\" actualizado correctamente");
    }
}
