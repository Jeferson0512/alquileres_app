<?php

namespace App\Services;

use App\Models\CobroMensual;
use App\Models\CobroMensualDetalle;
use App\Models\Pago;
use App\Models\PagoAuditoria;
use App\Models\PagoDetalle;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Replica api/modules/pagos/{common,index,reversa}.php — solo el "modo
 * moderno" (pago por concepto), que es el unico que existe en esta base
 * (conceptos_cobro/pagos_detalle/pagos_auditoria siempre estan desplegados).
 */
class PagoService
{
    private const METODOS_VALIDOS = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'OTRO'];

    public function normalizarMetodoPago(?string $metodo): string
    {
        $metodo = strtoupper(trim((string) $metodo));
        return in_array($metodo, self::METODOS_VALIDOS, true) ? $metodo : 'EFECTIVO';
    }

    /**
     * Conceptos (lineas de cobros_mensuales_detalle) con su saldo pendiente
     * ya descontando pagos_detalle de pagos REGISTRADO.
     */
    public function conceptosDeCobro(int $idCobro): array
    {
        return DB::table('cobros_mensuales_detalle as cd')
            ->join('conceptos_cobro as cc', 'cc.id_concepto', '=', 'cd.id_concepto')
            ->leftJoin('pagos_detalle as pd', 'pd.id_cobro_detalle', '=', 'cd.id_cobro_detalle')
            ->leftJoin('pagos as p', 'p.id_pago', '=', 'pd.id_pago')
            ->where('cd.id_cobro', $idCobro)
            ->groupBy('cd.id_cobro_detalle', 'cd.id_cobro', 'cc.codigo', 'cc.nombre', 'cc.permite_pago_directo', 'cd.descripcion', 'cd.monto_programado', 'cc.prioridad_aplicacion', 'cd.orden_visual')
            ->orderBy('cc.prioridad_aplicacion')->orderBy('cd.orden_visual')
            ->get([
                'cd.id_cobro_detalle', 'cd.id_cobro', 'cc.codigo', 'cc.nombre', 'cc.permite_pago_directo', 'cd.descripcion', 'cd.monto_programado',
                DB::raw("IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END), 0) as monto_pagado"),
                DB::raw("GREATEST(cd.monto_programado - IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END), 0), 0) as saldo_pendiente"),
            ])
            ->map(fn ($row) => (array) $row)->all();
    }

    private function aplicacionesAutomaticas(array $conceptos, float $montoPagado): array
    {
        $restante = round($montoPagado, 2);
        $aplicaciones = [];

        foreach ($conceptos as $concepto) {
            $saldo = round((float) $concepto['saldo_pendiente'], 2);
            if ($restante <= 0 || $saldo <= 0 || (int) $concepto['permite_pago_directo'] !== 1) {
                continue;
            }

            $monto = round(min($restante, $saldo), 2);
            if ($monto <= 0) {
                continue;
            }

            $aplicaciones[] = ['id_cobro_detalle' => (int) $concepto['id_cobro_detalle'], 'codigo' => $concepto['codigo'], 'monto_aplicado' => $monto];
            $restante = round($restante - $monto, 2);
        }

        if ($restante > 0) {
            throw ValidationException::withMessages(['monto_pagado' => 'El monto pagado excede el saldo disponible del cobro.']);
        }

        return $aplicaciones;
    }

    private function aplicacionesManuales(array $conceptos, array $input, float $montoPagado): array
    {
        if ($input === []) {
            throw ValidationException::withMessages(['aplicaciones' => 'Las aplicaciones son obligatorias cuando el modo es MANUAL.']);
        }

        $conceptosById = collect($conceptos)->keyBy('id_cobro_detalle');
        $result = [];
        $total = 0.0;
        $seen = [];

        foreach ($input as $item) {
            $idDetalle = (int) ($item['id_cobro_detalle'] ?? 0);
            $monto = round((float) ($item['monto_aplicado'] ?? 0), 2);

            if ($idDetalle <= 0 || $monto <= 0) {
                throw ValidationException::withMessages(['aplicaciones' => 'Cada aplicación manual requiere id_cobro_detalle y monto_aplicado válidos.']);
            }
            if (isset($seen[$idDetalle])) {
                throw ValidationException::withMessages(['aplicaciones' => 'No se puede repetir la misma línea de cobro en una aplicación manual.']);
            }
            $concepto = $conceptosById->get($idDetalle);
            if (!$concepto) {
                throw ValidationException::withMessages(['aplicaciones' => 'Una aplicación manual referencia una línea de cobro no válida.']);
            }
            if ((int) $concepto['permite_pago_directo'] !== 1) {
                throw ValidationException::withMessages(['aplicaciones' => 'El concepto seleccionado no permite pago directo.']);
            }
            if ($monto > round((float) $concepto['saldo_pendiente'], 2)) {
                throw ValidationException::withMessages(['aplicaciones' => 'Una aplicación manual excede el saldo disponible del concepto.']);
            }

            $result[] = ['id_cobro_detalle' => $idDetalle, 'codigo' => $concepto['codigo'], 'monto_aplicado' => $monto];
            $seen[$idDetalle] = true;
            $total = round($total + $monto, 2);
        }

        if (round($total, 2) !== round($montoPagado, 2)) {
            throw ValidationException::withMessages(['aplicaciones' => 'La suma de aplicaciones manuales debe ser igual al monto pagado.']);
        }

        return $result;
    }

    public function sincronizarEstadoCobro(CobroMensual $cobro): void
    {
        if ($cobro->estado_pago === 'ANULADO') {
            return;
        }

        $pagado = (float) Pago::where('id_cobro', $cobro->id_cobro)->where('estado', 'REGISTRADO')->sum('monto_pagado');
        $total = (float) $cobro->total_cobrar;

        $estado = 'PENDIENTE';
        if ($pagado > 0 && $pagado < $total) {
            $estado = 'PARCIAL';
        } elseif ($pagado >= $total && $total > 0) {
            $estado = 'PAGADO';
        }

        $cobro->update(['estado_pago' => $estado]);
    }

    /**
     * Registra un pago sobre un cobro, aplicandolo automaticamente en orden
     * de prioridad de conceptos, o segun aplicaciones manuales explicitas.
     */
    public function registrar(CobroMensual $cobro, array $body, ?string $registradoPor): Pago
    {
        if ($cobro->estado_pago === 'ANULADO') {
            throw ValidationException::withMessages(['general' => 'No se puede registrar pagos sobre un cobro anulado.']);
        }

        $montoPagado = round((float) ($body['monto_pagado'] ?? 0), 2);
        if ($montoPagado <= 0 || empty($body['fecha_pago'])) {
            throw ValidationException::withMessages(['monto_pagado' => 'fecha_pago y monto_pagado son obligatorios']);
        }

        $metodoPago = $this->normalizarMetodoPago($body['metodo_pago'] ?? null);
        $conceptos = $this->conceptosDeCobro($cobro->id_cobro);

        $modo = strtoupper(trim((string) ($body['modo_aplicacion'] ?? 'AUTOMATICA')));
        $aplicaciones = $modo === 'MANUAL'
            ? $this->aplicacionesManuales($conceptos, is_array($body['aplicaciones'] ?? null) ? $body['aplicaciones'] : [], $montoPagado)
            : $this->aplicacionesAutomaticas($conceptos, $montoPagado);

        return DB::transaction(function () use ($cobro, $body, $montoPagado, $metodoPago, $aplicaciones, $modo, $registradoPor) {
            $pago = Pago::create([
                'id_cobro' => $cobro->id_cobro,
                'fecha_pago' => $body['fecha_pago'],
                'monto_pagado' => $montoPagado,
                'metodo_pago' => $metodoPago,
                'numero_operacion' => $body['numero_operacion'] ?? null,
                'observacion' => $body['observacion'] ?? null,
                'estado' => 'REGISTRADO',
                'origen_registro' => 'MANUAL',
                'registrado_por' => $registradoPor,
            ]);

            foreach ($aplicaciones as $aplicacion) {
                PagoDetalle::create([
                    'id_pago' => $pago->id_pago,
                    'id_cobro_detalle' => $aplicacion['id_cobro_detalle'],
                    'monto_aplicado' => $aplicacion['monto_aplicado'],
                    'origen_aplicacion' => $modo === 'MANUAL' ? 'MANUAL' : 'AUTOMATICA',
                ]);
            }

            $this->sincronizarEstadoCobro($cobro->fresh());

            $after = $pago->fresh()->toArray();
            $after['aplicaciones'] = $aplicaciones;
            PagoAuditoria::create(['id_pago' => $pago->id_pago, 'accion' => 'CREADO', 'actor' => $registradoPor, 'payload_after' => $after, 'created_at' => now()]);
            PagoAuditoria::create(['id_pago' => $pago->id_pago, 'accion' => 'APLICADO', 'actor' => $registradoPor, 'payload_after' => $after, 'created_at' => now()]);

            return $pago;
        });
    }

    public function reversar(Pago $pago, string $motivo, string $reversadoPor, string $fechaReversa): void
    {
        if ($pago->estado !== 'REGISTRADO') {
            throw ValidationException::withMessages(['general' => 'Solo se puede reversar un pago en estado REGISTRADO']);
        }

        DB::transaction(function () use ($pago, $motivo, $reversadoPor, $fechaReversa) {
            $before = $pago->toArray();

            $pago->update([
                'estado' => 'REVERSADO',
                'reversado_por' => $reversadoPor,
                'fecha_reversa' => $fechaReversa,
                'motivo_reversa' => $motivo,
            ]);

            $this->sincronizarEstadoCobro($pago->cobro);

            PagoAuditoria::create([
                'id_pago' => $pago->id_pago, 'accion' => 'REVERSADO', 'actor' => $reversadoPor,
                'payload_before' => $before, 'payload_after' => $pago->fresh()->toArray(), 'created_at' => now(),
            ]);
        });
    }

    /**
     * Re-crea un pago previamente reversado (usado por CobroService::forceRefresh
     * para preservar pagos activos al regenerar los montos de un periodo).
     */
    public function reaplicarPago(Pago $pagoOriginal, string $actor): void
    {
        $cobro = $pagoOriginal->cobro;
        if ($cobro->estado_pago === 'ANULADO') {
            throw new \RuntimeException('No se puede reaplicar un pago sobre un cobro anulado.');
        }

        $montoPagado = round((float) $pagoOriginal->monto_pagado, 2);
        $conceptos = $this->conceptosDeCobro($cobro->id_cobro);
        $aplicacionesPrevias = $pagoOriginal->detalle()->get(['id_cobro_detalle', 'monto_aplicado'])->map(fn ($d) => [
            'id_cobro_detalle' => $d->id_cobro_detalle, 'monto_aplicado' => (float) $d->monto_aplicado,
        ])->all();
        $aplicaciones = $this->aplicacionesManuales($conceptos, $aplicacionesPrevias, $montoPagado);

        $nuevo = Pago::create([
            'id_cobro' => $cobro->id_cobro,
            'fecha_pago' => $pagoOriginal->fecha_pago,
            'monto_pagado' => $montoPagado,
            'metodo_pago' => $pagoOriginal->metodo_pago,
            'numero_operacion' => $pagoOriginal->numero_operacion,
            'observacion' => $pagoOriginal->observacion,
            'estado' => 'REGISTRADO',
            'origen_registro' => 'MANUAL',
            'registrado_por' => $actor,
        ]);

        foreach ($aplicaciones as $aplicacion) {
            PagoDetalle::create([
                'id_pago' => $nuevo->id_pago, 'id_cobro_detalle' => $aplicacion['id_cobro_detalle'],
                'monto_aplicado' => $aplicacion['monto_aplicado'], 'origen_aplicacion' => 'MANUAL',
            ]);
        }

        $this->sincronizarEstadoCobro($cobro->fresh());

        $after = $nuevo->fresh()->toArray();
        $after['aplicaciones'] = $aplicaciones;
        PagoAuditoria::create(['id_pago' => $nuevo->id_pago, 'accion' => 'CREADO', 'actor' => $actor, 'payload_after' => $after, 'created_at' => now()]);
        PagoAuditoria::create(['id_pago' => $nuevo->id_pago, 'accion' => 'APLICADO', 'actor' => $actor, 'payload_after' => $after, 'created_at' => now()]);
    }
}
