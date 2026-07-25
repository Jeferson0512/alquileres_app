<?php

namespace App\Http\Controllers;

use App\Models\CobroMensual;
use App\Models\ComprobantePago;
use App\Services\PagoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PortalComprobanteController extends Controller
{
    public function store(Request $request, PagoService $pagoService): RedirectResponse
    {
        $esEfectivo = strtoupper(trim((string) $request->input('metodo_pago'))) === 'EFECTIVO';

        $data = $request->validate([
            'id_cobro' => ['required', 'integer'],
            'monto_declarado' => ['required', 'numeric', 'min:0.01'],
            'fecha_pago_declarada' => ['required', 'date'],
            'metodo_pago' => ['nullable', 'string'],
            // En YAPE/PLIN/TRANSFERENCIA/OTRO este campo es el N° de operación;
            // en EFECTIVO no existe operación, así que se reutiliza para anotar
            // a quién se le entregó el efectivo (obligatorio en ese caso).
            'numero_operacion' => [$esEfectivo ? 'required' : 'nullable', 'string', 'max:60'],
            // En efectivo no siempre hay una foto que respalde el pago (se
            // entrega en mano); en los demas metodos si es obligatoria.
            'imagen' => [$esEfectivo ? 'nullable' : 'required', 'file', 'mimes:png,jpg,jpeg,webp', 'max:5120'],
        ], [
            'numero_operacion.required' => 'Indica a quién le entregaste el efectivo.',
        ]);

        $cobro = CobroMensual::findOrFail($data['id_cobro']);
        abort_unless($cobro->id_persona === $request->user()->id_persona, 403, 'Este cobro no pertenece a tu cuenta.');

        $yaPendiente = ComprobantePago::where('id_cobro', $cobro->id_cobro)->where('estado', 'PENDIENTE')->exists();
        if ($yaPendiente) {
            throw ValidationException::withMessages(['general' => 'Ya tienes un comprobante en revisión para este cobro.']);
        }

        // Disco privado a proposito: es la constancia de pago de un inquilino
        // (a veces con datos personales visibles en la captura) -- no debe
        // quedar accesible por URL directa sin pasar por ComprobantePagoController::imagen().
        $path = $request->hasFile('imagen') ? $request->file('imagen')->store('comprobantes', 'local') : null;

        ComprobantePago::create([
            'id_cobro' => $cobro->id_cobro,
            'id_persona' => $request->user()->id_persona,
            'monto_declarado' => round((float) $data['monto_declarado'], 2),
            'fecha_pago_declarada' => $data['fecha_pago_declarada'],
            'metodo_pago' => $pagoService->normalizarMetodoPago($data['metodo_pago'] ?? null),
            'numero_operacion' => $data['numero_operacion'] ?? null,
            'imagen_path' => $path,
            'estado' => 'PENDIENTE',
        ]);

        return back()->with('success', 'Comprobante enviado. Un administrador lo revisará pronto.');
    }
}
