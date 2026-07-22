<?php

namespace App\Http\Controllers;

use App\Models\ContactInquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Consultas/Index', [
            'consultas' => ContactInquiry::with('unidad:id_unidad,codigo_unidad,nombre_unidad')
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }

    public function update(Request $request, ContactInquiry $consulta): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:NUEVO,CONTACTADO,DESCARTADO'],
        ]);

        $consulta->update($data);

        return back()->with('success', 'Consulta actualizada correctamente');
    }
}
