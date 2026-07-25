<?php

namespace App\Http\Controllers;

use App\Models\ComprobantePago;
use App\Services\PagoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ComprobantePagoController extends Controller
{
    public function index(Request $request): Response
    {
        $estado = $request->query('estado', 'TODOS');

        $comprobantes = ComprobantePago::with(['cobro.persona', 'cobro.unidad', 'cobro.periodo'])
            ->when($estado !== 'TODOS', fn ($q) => $q->where('estado', $estado))
            // En "Todos" se prioriza lo pendiente primero (necesita accion), luego
            // aprobados y al final rechazados -- dentro de cada grupo, lo mas
            // reciente primero.
            ->when($estado === 'TODOS', fn ($q) => $q->orderByRaw("FIELD(estado, 'PENDIENTE', 'APROBADO', 'RECHAZADO')"))
            ->orderByDesc('created_at')
            ->paginate(20)->withQueryString()
            ->through(function (ComprobantePago $c) {
                $c->imagen_url = $c->imagen_path ? route('comprobantes.imagen', $c->id) : null;

                return $c;
            });

        return Inertia::render('Cobros/Comprobantes', [
            'comprobantes' => $comprobantes,
            'estadoFiltro' => $estado,
        ]);
    }

    /**
     * Sirve la imagen del comprobante desde el disco privado -- solo si
     * quien pide es staff con permiso de revisión o el inquilino dueño del
     * comprobante. Nunca por URL directa/publica (ver PortalComprobanteController::store).
     */
    public function imagen(Request $request, ComprobantePago $comprobante): StreamedResponse
    {
        $esStaffAutorizado = $request->user()->can('cobros.comprobantes.ver');
        $esDueno = $request->user()->id_persona !== null && $request->user()->id_persona === $comprobante->id_persona;
        abort_unless($esStaffAutorizado || $esDueno, 403);
        abort_unless($comprobante->imagen_path, 404);

        return Storage::disk('local')->response($comprobante->imagen_path);
    }

    /**
     * Igual que Cobros > Pagos, el admin puede aplicar el monto completo
     * automaticamente o elegir a que servicios especificos va (mismo
     * modo_aplicacion/aplicaciones que PagoService ya sabe manejar).
     */
    public function aprobar(Request $request, ComprobantePago $comprobante, PagoService $pagoService): RedirectResponse
    {
        if ($comprobante->estado !== 'PENDIENTE') {
            throw ValidationException::withMessages(['general' => 'Solo se puede aprobar un comprobante en estado PENDIENTE.']);
        }

        $data = $request->validate([
            'modo_aplicacion' => ['nullable', 'string'],
            'aplicaciones' => ['nullable', 'array'],
            'aplicaciones.*.id_cobro_detalle' => ['required_with:aplicaciones', 'integer'],
            'aplicaciones.*.monto_aplicado' => ['required_with:aplicaciones', 'numeric'],
        ]);

        DB::transaction(function () use ($comprobante, $pagoService, $request, $data) {
            $pago = $pagoService->registrar($comprobante->cobro, [
                'monto_pagado' => $comprobante->monto_declarado,
                'fecha_pago' => $comprobante->fecha_pago_declarada,
                'metodo_pago' => $comprobante->metodo_pago,
                'numero_operacion' => $comprobante->numero_operacion,
                'modo_aplicacion' => $data['modo_aplicacion'] ?? 'AUTOMATICA',
                'aplicaciones' => $data['aplicaciones'] ?? [],
            ], $request->user()->name);

            $comprobante->update([
                'estado' => 'APROBADO',
                'id_pago' => $pago->id_pago,
                'revisado_por' => $request->user()->name,
                'fecha_revision' => now(),
            ]);
        });

        return back()->with('success', 'Comprobante aprobado y pago registrado correctamente');
    }

    public function rechazar(Request $request, ComprobantePago $comprobante): RedirectResponse
    {
        $data = $request->validate([
            'motivo_rechazo' => ['required', 'string', 'max:255'],
        ]);

        if ($comprobante->estado !== 'PENDIENTE') {
            throw ValidationException::withMessages(['general' => 'Solo se puede rechazar un comprobante en estado PENDIENTE.']);
        }

        $comprobante->update([
            'estado' => 'RECHAZADO',
            'motivo_rechazo' => $data['motivo_rechazo'],
            'revisado_por' => $request->user()->name,
            'fecha_revision' => now(),
        ]);

        return back()->with('success', 'Comprobante rechazado');
    }
}
