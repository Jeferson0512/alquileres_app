<?php

namespace App\Http\Controllers;

use App\Models\CobroMensual;
use App\Models\CobroOverrideServicio;
use App\Models\Periodo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CobroOverrideController extends Controller
{
    private const CAMPO_A_SERVICIO = ['agua' => 'AGUA', 'gas' => 'GAS', 'mantenimiento' => 'MANTENIMIENTO'];

    /**
     * Guarda de una vez los 3 montos de servicio para un inquilino/unidad
     * en el periodo actual -- reemplazan la tarifa general SOLO para ese
     * periodo. No afectan el cobro ya generado hasta que se corra
     * "Forzar actualización" (ver CobroService::forceRefresh).
     */
    public function store(Request $request): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $data = $request->validate([
            'id_unidad' => ['required', 'integer'],
            'id_persona' => ['required', 'integer'],
            'agua' => ['nullable', 'numeric', 'min:0'],
            'gas' => ['nullable', 'numeric', 'min:0'],
            'mantenimiento' => ['nullable', 'numeric', 'min:0'],
        ]);

        $cobro = CobroMensual::where('id_periodo', $periodo->id_periodo)
            ->where('id_unidad', $data['id_unidad'])
            ->where('id_persona', $data['id_persona'])
            ->first();

        if ($cobro && in_array($cobro->estado_pago, ['PAGADO', 'ANULADO'], true)) {
            throw ValidationException::withMessages([
                'general' => 'No se pueden ajustar los servicios de un cobro que ya está pagado o anulado.',
            ]);
        }

        foreach (self::CAMPO_A_SERVICIO as $campo => $servicio) {
            if (!array_key_exists($campo, $data) || $data[$campo] === null) {
                continue;
            }

            CobroOverrideServicio::updateOrCreate(
                ['id_periodo' => $periodo->id_periodo, 'id_unidad' => $data['id_unidad'], 'id_persona' => $data['id_persona'], 'servicio' => $servicio],
                ['monto' => round($data[$campo], 2)]
            );
        }

        return back()->with('success', 'Servicios actualizados. Usa "Forzar actualización" para reflejarlo en los cobros.');
    }

    public function destroy(Request $request, CobroOverrideServicio $override): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $override->delete();

        return back()->with('success', 'Override eliminado');
    }
}
