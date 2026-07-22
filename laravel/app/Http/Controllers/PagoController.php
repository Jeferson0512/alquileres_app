<?php

namespace App\Http\Controllers;

use App\Models\CobroMensual;
use App\Models\Pago;
use App\Services\PagoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PagoController extends Controller
{
    public function store(Request $request, PagoService $service): RedirectResponse
    {
        $idCobro = $request->integer('id_cobro');
        $cobro = CobroMensual::findOrFail($idCobro);

        $service->registrar($cobro, $request->all(), $request->user()->name);

        return back()->with('success', 'Pago registrado correctamente');
    }

    public function reversa(Request $request, Pago $pago, PagoService $service): RedirectResponse
    {
        $data = $request->validate([
            'motivo_reversa' => ['required', 'string', 'max:255'],
            'fecha_reversa' => ['nullable', 'date'],
        ]);

        $service->reversar(
            $pago,
            $data['motivo_reversa'],
            $request->user()->name,
            $data['fecha_reversa'] ?? now()->toDateString()
        );

        return back()->with('success', 'Pago anulado correctamente');
    }

    public function auditoria(Pago $pago): Response
    {
        return Inertia::render('Pagos/Auditoria', [
            'pago' => $pago,
            'auditoria' => $pago->auditoria()->orderBy('created_at')->get(),
        ]);
    }
}
