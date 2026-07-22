<?php

namespace App\Http\Controllers;

use App\Mail\NewContactInquiryMail;
use App\Models\ContactInquiry;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Landing page publico -- reemplaza el Welcome.jsx de scaffold de Laravel.
 * Sin autenticacion: cualquier visitante puede verlo y enviar una consulta.
 */
class LandingController extends Controller
{
    public function index(): Response
    {
        $unidadesDisponibles = DB::table('unidades as u')
            ->leftJoin('ocupacion_unidad as o', function ($j) {
                $j->on('o.id_unidad', '=', 'u.id_unidad')->where('o.estado', 'ACTIVO');
            })
            ->whereNull('o.id_ocupacion')
            ->where('u.estado', 'ACTIVO')
            ->whereNotIn('u.tipo_unidad', ['AREA_COMUN', 'MEDIDOR_GENERAL'])
            ->orderBy('u.codigo_unidad')
            ->get(['u.id_unidad', 'u.codigo_unidad', 'u.nombre_unidad', 'u.tipo_unidad', 'u.tarifa_alquiler_base', 'u.piso']);

        return Inertia::render('Landing', [
            'unidadesDisponibles' => $unidadesDisponibles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'message' => ['required', 'string', 'max:2000'],
            'unit_id' => ['nullable', 'integer', 'exists:unidades,id_unidad'],
        ]);

        if (empty($data['email']) && empty($data['phone'])) {
            return back()->withErrors(['email' => 'Déjanos al menos un email o un teléfono para poder contactarte.'])->withInput();
        }

        $inquiry = ContactInquiry::create($data);

        try {
            $adminEmail = User::role('Admin')->value('email');
            if ($adminEmail) {
                Mail::to($adminEmail)->send(new NewContactInquiryMail($inquiry));
            }
        } catch (\Throwable $e) {
            // La consulta ya quedo guardada en el panel (Consultas) aunque el
            // correo falle -- no bloqueamos la respuesta al visitante por esto.
            Log::warning('No se pudo enviar el correo de nueva consulta: '.$e->getMessage());
        }

        return back()->with('success', '¡Gracias! Te contactaremos pronto.');
    }
}
