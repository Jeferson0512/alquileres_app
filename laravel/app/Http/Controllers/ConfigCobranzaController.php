<?php

namespace App\Http\Controllers;

use App\Models\ConfigCobranza;
use App\Models\Inmueble;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConfigCobranzaController extends Controller
{
    public function index(): Response
    {
        $idInmueble = Inmueble::activoActual()->id_inmueble;

        $config = ConfigCobranza::where('id_inmueble', $idInmueble)->first();

        return Inertia::render('ConfigCobranza/Index', [
            'config' => $config ?? [
                'id_inmueble' => $idInmueble,
                'monto_minimo_luz' => 0,
                'minimo_kwh_aviso' => 13.5,
                'yape_titular' => '',
                'yape_numero' => '',
                'yape_qr' => '',
                'banco_nombre' => '',
                'banco_titular' => '',
                'banco_cuenta' => '',
                'banco_cci' => '',
                'mensaje_base' => '',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $idInmueble = Inmueble::activoActual()->id_inmueble;

        $data = $request->validate([
            'monto_minimo_luz' => ['nullable', 'numeric', 'min:0'],
            'minimo_kwh_aviso' => ['nullable', 'numeric', 'min:0'],
            'yape_titular' => ['nullable', 'string', 'max:120'],
            'yape_numero' => ['nullable', 'string', 'max:30'],
            'yape_qr' => ['nullable', 'string', 'max:255'],
            'banco_nombre' => ['nullable', 'string', 'max:120'],
            'banco_titular' => ['nullable', 'string', 'max:120'],
            'banco_cuenta' => ['nullable', 'string', 'max:50'],
            'banco_cci' => ['nullable', 'string', 'max:50'],
            'mensaje_base' => ['nullable', 'string', 'max:255'],
        ]);

        $data['monto_minimo_luz'] = round((float) ($data['monto_minimo_luz'] ?? 0), 2);
        $data['minimo_kwh_aviso'] = round((float) ($data['minimo_kwh_aviso'] ?? 13.5), 2);

        ConfigCobranza::updateOrCreate(['id_inmueble' => $idInmueble], $data);

        return back()->with('success', 'Configuración de cobranza actualizada correctamente');
    }

    public function uploadQr(Request $request): RedirectResponse
    {
        $request->validate([
            'qr' => ['required', 'file', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
        ]);

        $path = $request->file('qr')->store('qr', 'public');

        return back()->with('success', 'QR subido correctamente')->with('qr_path', Storage::url($path));
    }
}
