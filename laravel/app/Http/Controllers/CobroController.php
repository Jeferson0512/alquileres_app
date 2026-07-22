<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Periodo;
use App\Services\CobroService;
use App\Services\PagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CobroController extends Controller
{
    public function index(Request $request, CobroService $service): Response
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);

        return Inertia::render('Cobros/Index', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'cobros' => $service->listarParaPeriodo($periodo),
        ]);
    }

    public function generar(Request $request, CobroService $service): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $service->generar($periodo);

        return back()->with('success', 'Cobros generados correctamente');
    }

    public function forceRefresh(Request $request, CobroService $service): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $descartar = array_map('intval', $request->input('descartar_pago_ids', []));

        $resultado = $service->forceRefresh($periodo, $descartar);

        $mensaje = $resultado['modo'] === 'PURGE_REVERSED_REGENERATE'
            ? 'Cobros regenerados limpiando el historial reversado del periodo.'
            : "Cobros actualizados. Pagos reversados: {$resultado['pagos_reversados']}, descartados: {$resultado['pagos_descartados']}, reaplicados: {$resultado['pagos_reaplicados']}.";

        return back()->with('success', $mensaje);
    }

    public function detail(Request $request, PagoService $pagoService): JsonResponse
    {
        $idCobro = $request->integer('id_cobro');
        $conceptos = $pagoService->conceptosDeCobro($idCobro);
        $pagos = Pago::where('id_cobro', $idCobro)->orderByDesc('fecha_pago')->orderByDesc('id_pago')
            ->get(['id_pago', 'fecha_pago', 'monto_pagado', 'metodo_pago', 'estado']);

        return response()->json(['ok' => true, 'data' => ['conceptos' => $conceptos, 'pagos' => $pagos]]);
    }
}
