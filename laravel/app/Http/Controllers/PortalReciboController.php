<?php

namespace App\Http\Controllers;

use App\Models\CobroMensual;
use App\Models\ConfigCobranza;
use App\Models\Inmueble;
use App\Models\Pago;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Recibo descargable (PDF) de un cobro propio del inquilino -- disponible
 * tanto para el cobro pendiente actual como para cualquier periodo ya
 * pagado del historial, mismo documento, solo cambia el sello de estado.
 * Ver skill reglas-negocio-facturacion: "recibo" (este documento, con
 * folio) es distinto de "comprobante" (la foto que sube el inquilino).
 */
class PortalReciboController extends Controller
{
    public function show(Request $request, CobroMensual $cobro)
    {
        abort_unless($cobro->id_persona === $request->user()->id_persona, 403);

        $datos = $this->datosDelRecibo($cobro);

        $pdf = Pdf::loadView('portal.recibo', $datos);

        Log::channel('portal')->info('Recibo individual generado', [
            'id_cobro' => $cobro->id_cobro,
            'id_persona' => $cobro->id_persona,
            'folio' => $datos['folio'],
        ]);

        // stream() en vez de download(): abre el PDF inline en una pestaña
        // nueva (el visor nativo del navegador) para que el inquilino lo
        // vea antes de decidir guardarlo, en vez de forzar la descarga a
        // ciegas -- el propio visor ya trae su botón de descarga.
        return $pdf->stream($this->nombreArchivo($cobro));
    }

    /**
     * Un solo PDF con un recibo por pagina, para todos los cobros PAGADO --
     * de un anio especifico, o de todos si no se pasa `anio` (o se pasa
     * "todos") -- pensado para quien necesita justificar gastos o presentar
     * comprobantes de un periodo largo de una vez, sin descargar uno por uno.
     */
    public function descargarTodos(Request $request)
    {
        $idPersona = $request->user()->id_persona;
        $anioParam = $request->query('anio', 'todos');
        $anio = ($anioParam === 'todos' || $anioParam === '') ? null : (int) $anioParam;

        $cobros = CobroMensual::query()
            ->where('id_persona', $idPersona)
            ->where('estado_pago', 'PAGADO')
            ->when($anio, fn ($q) => $q->whereHas('periodo', fn ($qq) => $qq->where('anio', $anio)))
            ->with(['periodo', 'unidad', 'persona'])
            ->get()
            ->sortBy(fn (CobroMensual $c) => $c->periodo->anio * 100 + $c->periodo->mes)
            ->values();

        abort_if($cobros->isEmpty(), 404, $anio ? "No tienes cobros pagados en {$anio}." : 'No tienes cobros pagados.');

        $recibos = $cobros->map(fn (CobroMensual $cobro) => $this->datosDelRecibo($cobro))->all();

        $pdf = Pdf::loadView('portal.recibos-lote', [
            'recibos' => $recibos,
            'anio' => $anio ?? 'todos los años',
        ]);

        Log::channel('portal')->info('Lote de recibos generado', [
            'id_persona' => $idPersona,
            'anio' => $anio ?? 'todos',
            'cantidad' => count($recibos),
        ]);

        return $pdf->download($anio ? "recibos-{$anio}.pdf" : 'recibos-todos.pdf');
    }

    private function datosDelRecibo(CobroMensual $cobro): array
    {
        $cobro->loadMissing(['periodo', 'unidad', 'persona']);

        $detalles = $cobro->detalles()->with('concepto')->orderBy('orden_visual')->get();
        $pagadoTotal = (float) Pago::where('id_cobro', $cobro->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado');
        $saldoTotal = max((float) $cobro->total_cobrar - $pagadoTotal, 0);

        $ultimoPago = Pago::where('id_cobro', $cobro->id_cobro)
            ->where('estado', 'REGISTRADO')
            ->whereNotNull('numero_comprobante')
            ->orderByDesc('id_pago')
            ->first();

        $estado = $saldoTotal <= 0.009 ? 'PAGADO' : ($pagadoTotal > 0 ? 'PARCIAL' : 'PENDIENTE');
        $estadoLabels = ['PAGADO' => 'Pagado', 'PARCIAL' => 'Parcial', 'PENDIENTE' => 'Pendiente'];

        $config = ConfigCobranza::where('id_inmueble', Inmueble::activoActual()->id_inmueble)->first();
        $inmueble = Inmueble::activoActual();

        $meses = [1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril', 5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto', 9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'];

        return [
            'emisor' => ['nombre' => $inmueble->nombre, 'direccion' => $inmueble->direccion],
            'folio' => $ultimoPago->numero_comprobante ?? sprintf('REF-%06d', $cobro->id_cobro),
            'folioEsReal' => (bool) $ultimoPago,
            'fechaEmision' => now()->translatedFormat('d \d\e F, Y'),
            'inquilino' => ['nombre' => trim($cobro->persona->nombres.' '.$cobro->persona->apellidos)],
            'unidad' => ['codigo' => $cobro->unidad->codigo_unidad, 'nombre' => $cobro->unidad->nombre_unidad],
            'periodoTexto' => ($meses[$cobro->periodo->mes] ?? $cobro->periodo->mes).' '.$cobro->periodo->anio,
            'estado' => $estado,
            'estadoLabel' => $estadoLabels[$estado],
            'conceptos' => $detalles->map(fn ($d) => [
                'nombre' => $d->concepto->nombre,
                'detalle' => $this->detalleConcepto($d, $cobro),
                'monto' => (float) $d->monto_programado,
            ])->all(),
            'deudaAnterior' => $this->deudaAnterior($cobro),
            'subtotalPeriodo' => (float) $cobro->total_cobrar,
            'pagadoTotal' => $pagadoTotal,
            'saldoTotal' => $saldoTotal,
            'pago' => [
                'yape_titular' => $config->yape_titular ?? null,
                'yape_numero' => $config->yape_numero ?? null,
                'banco_nombre' => $config->banco_nombre ?? null,
                'banco_titular' => $config->banco_titular ?? null,
                'banco_cuenta' => $config->banco_cuenta ?? null,
                'banco_cci' => $config->banco_cci ?? null,
            ],
        ];
    }

    private function nombreArchivo(CobroMensual $cobro): string
    {
        return sprintf('recibo-%s-%02d-%d.pdf', $cobro->unidad->codigo_unidad, $cobro->periodo->mes, $cobro->periodo->anio);
    }

    /**
     * Para Luz, replica la regla de minimo_kwh_aviso (ver skill
     * reglas-negocio-facturacion): si el consumo real del periodo esta por
     * debajo del umbral configurado, se oculta el numero real de kWh.
     *
     * Lee el snapshot cobros_mensuales.consumo_kwh en vez de re-consultar
     * liquidacion_luz_detalle -- con mas de un tramo por unidad (Fase 2),
     * matchear por (periodo, unidad) ya no encuentra al saliente, y de
     * paso evita que regenerar una liquidacion vieja cambie los kWh
     * impresos en un recibo ya cobrado (RF-16).
     *
     * El umbral se evalua contra el consumo del PERIODO COMPLETO de la
     * unidad (todos los tramos/cobros sumados, decision 5.6) -- un tramo
     * corto individual case casi siempre por debajo del minimo aunque el
     * total del mes sea consumo normal. Lo que se MUESTRA sigue siendo el
     * consumo propio de este cobro (su tramo), no el total de la unidad.
     */
    private function detalleConcepto(\App\Models\CobroMensualDetalle $detalle, CobroMensual $cobro): string
    {
        if ($detalle->concepto->codigo !== 'LUZ') {
            return $detalle->descripcion ?? '';
        }

        $consumoPeriodoUnidad = (float) DB::table('cobros_mensuales')
            ->where('id_periodo', $cobro->id_periodo)
            ->where('id_unidad', $cobro->id_unidad)
            ->where('estado_pago', '!=', 'ANULADO')
            ->sum('consumo_kwh');

        $minimoKwh = (float) (ConfigCobranza::where('id_inmueble', $cobro->unidad->id_inmueble)->value('minimo_kwh_aviso') ?? 13.5);
        $consumoMostrado = $consumoPeriodoUnidad < $minimoKwh ? 0 : (float) $cobro->consumo_kwh;

        return number_format($consumoMostrado, 2).' kWh del periodo';
    }

    /**
     * Suma de saldo_pendiente de OTROS cobros (misma persona+unidad) de
     * periodos anteriores al de este recibo -- mismo criterio que ya usa
     * CobroService::listarParaPeriodo() para el admin.
     */
    private function deudaAnterior(CobroMensual $cobro): float
    {
        return (float) DB::table('cobros_mensuales as ca')
            ->join('periodos as pprev', 'pprev.id_periodo', '=', 'ca.id_periodo')
            ->where('ca.id_persona', $cobro->id_persona)
            ->where('ca.id_unidad', $cobro->id_unidad)
            ->where('ca.id_cobro', '!=', $cobro->id_cobro)
            ->where('ca.estado_pago', '!=', 'ANULADO')
            ->where('pprev.fecha_inicio', '<', $cobro->periodo->fecha_inicio)
            ->get(['ca.id_cobro', 'ca.total_cobrar'])
            ->sum(function ($ca) {
                $pagado = (float) Pago::where('id_cobro', $ca->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado');
                return max((float) $ca->total_cobrar - $pagado, 0);
            });
    }
}
