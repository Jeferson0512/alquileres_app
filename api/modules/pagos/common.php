<?php

require_once __DIR__ . '/../../config/helpers.php';

function emptyToNull(array $data, string $key): ?string
{
    if (!array_key_exists($key, $data)) {
        return null;
    }

    $value = trim((string) $data[$key]);
    return $value === '' ? null : $value;
}

function normalizeMetodoPago(array $body): string
{
    $metodo = strtoupper(trim((string) ($body['metodo_pago'] ?? 'EFECTIVO')));
    $permitidos = ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'OTRO'];

    return in_array($metodo, $permitidos, true) ? $metodo : 'EFECTIVO';
}

function normalizeNumeroOperacion(array $body, string $metodoPago): ?string
{
    $numeroOperacion = emptyToNull($body, 'numero_operacion');

    // Para efectivo no es obligatorio, pero si se informa debe tener formato válido.
    if ($metodoPago === 'EFECTIVO' && $numeroOperacion === null) {
        return null;
    }

    if ($numeroOperacion === null) {
        jsonResponse([
            'ok' => false,
            'message' => 'El numero de operacion es obligatorio para el metodo de pago seleccionado'
        ], 422);
    }

    return strtoupper(trim((string) $numeroOperacion));
}

function pagosDetalleSchemaDisponible(PDO $pdo): bool
{
    static $cached = null;

    if ($cached !== null) {
        return $cached;
    }

    $stmt = $pdo->query("SELECT DATABASE() AS db_name");
    $dbName = (string) (($stmt->fetch()['db_name'] ?? ''));

    if ($dbName === '') {
        return $cached = false;
    }

    $stmt = $pdo->prepare(" 
        SELECT COUNT(*) AS total
        FROM information_schema.tables
        WHERE table_schema = :db
          AND table_name IN ('conceptos_cobro', 'cobros_mensuales_detalle', 'pagos_detalle', 'pagos_auditoria')
    ");
    $stmt->execute(['db' => $dbName]);
    $tables = (int) (($stmt->fetch()['total'] ?? 0));

    if ($tables < 4) {
        return $cached = false;
    }

    $stmt = $pdo->prepare(" 
        SELECT COUNT(*) AS total
        FROM information_schema.columns
        WHERE table_schema = :db
          AND table_name = 'pagos'
          AND column_name IN ('estado', 'origen_registro', 'registrado_por', 'reversado_por', 'fecha_reversa', 'motivo_reversa')
    ");
    $stmt->execute(['db' => $dbName]);
    $columns = (int) (($stmt->fetch()['total'] ?? 0));

    return $cached = $columns >= 6;
}

function syncCobroStatus(PDO $pdo, int $idCobro): void
{
    $stmtCobro = $pdo->prepare('SELECT total_cobrar, estado_pago FROM cobros_mensuales WHERE id_cobro = :id LIMIT 1');
    $stmtCobro->execute(['id' => $idCobro]);
    $cobro = $stmtCobro->fetch();

    if (!$cobro) {
        return;
    }

    if (($cobro['estado_pago'] ?? '') === 'ANULADO') {
        return;
    }

    if (pagosDetalleSchemaDisponible($pdo)) {
        $stmtPagado = $pdo->prepare(" 
            SELECT IFNULL(SUM(CASE WHEN estado = 'REGISTRADO' THEN monto_pagado ELSE 0 END), 0) AS total_pagado
            FROM pagos
            WHERE id_cobro = :id
        ");
    } else {
        $stmtPagado = $pdo->prepare('SELECT IFNULL(SUM(monto_pagado), 0) AS total_pagado FROM pagos WHERE id_cobro = :id');
    }

    $stmtPagado->execute(['id' => $idCobro]);
    $pagado = (float) (($stmtPagado->fetch()['total_pagado'] ?? 0));

    $totalCobrar = (float) $cobro['total_cobrar'];
    $nuevoEstado = 'PENDIENTE';

    if ($pagado <= 0) {
        $nuevoEstado = 'PENDIENTE';
    } elseif ($pagado < $totalCobrar) {
        $nuevoEstado = 'PARCIAL';
    } else {
        $nuevoEstado = 'PAGADO';
    }

    $stmtUpdate = $pdo->prepare(" 
        UPDATE cobros_mensuales
        SET estado_pago = :estado_pago, updated_at = NOW()
        WHERE id_cobro = :id
    ");
    $stmtUpdate->execute([
        'estado_pago' => $nuevoEstado,
        'id' => $idCobro,
    ]);
}

function getCobroHeader(PDO $pdo, int $idCobro): array
{
    $stmt = $pdo->prepare(" 
        SELECT
            c.id_cobro,
            c.id_periodo,
            c.id_persona,
            c.id_unidad,
            c.total_cobrar,
            c.estado_pago,
            c.fecha_vencimiento,
            c.observacion,
            p.anio,
            p.mes,
            u.codigo_unidad,
            u.nombre_unidad,
            CONCAT(pr.nombres, ' ', pr.apellidos) AS inquilino
        FROM cobros_mensuales c
        INNER JOIN periodos p ON p.id_periodo = c.id_periodo
        INNER JOIN unidades u ON u.id_unidad = c.id_unidad
        INNER JOIN personas pr ON pr.id_persona = c.id_persona
        WHERE c.id_cobro = :id
        LIMIT 1
    ");
    $stmt->execute(['id' => $idCobro]);
    $row = $stmt->fetch();

    if (!$row) {
        throw new RuntimeException('Cobro no encontrado');
    }

    return $row;
}

function getCobroConceptos(PDO $pdo, int $idCobro): array
{
    $stmt = $pdo->prepare(" 
        SELECT
            cd.id_cobro_detalle,
            cd.id_cobro,
            cc.codigo,
            cc.nombre,
            cc.permite_pago_directo,
            cd.descripcion,
            cd.monto_programado,
            IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END), 0) AS monto_pagado,
            GREATEST(cd.monto_programado - IFNULL(SUM(CASE WHEN p.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END), 0), 0) AS saldo_pendiente
        FROM cobros_mensuales_detalle cd
        INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
        LEFT JOIN pagos_detalle pd ON pd.id_cobro_detalle = cd.id_cobro_detalle
        LEFT JOIN pagos p ON p.id_pago = pd.id_pago
        WHERE cd.id_cobro = :id
        GROUP BY
            cd.id_cobro_detalle,
            cd.id_cobro,
            cc.codigo,
            cc.nombre,
            cc.permite_pago_directo,
            cd.descripcion,
            cd.monto_programado,
            cc.prioridad_aplicacion,
            cd.orden_visual
        ORDER BY cc.prioridad_aplicacion, cd.orden_visual, cd.id_cobro_detalle
    ");
    $stmt->execute(['id' => $idCobro]);

    return $stmt->fetchAll();
}

function buildAplicacionesAutomaticas(array $conceptos, float $montoPagado): array
{
    $restante = round($montoPagado, 2);
    $aplicaciones = [];

    foreach ($conceptos as $concepto) {
        $saldo = round((float) ($concepto['saldo_pendiente'] ?? 0), 2);
        $permitePagoDirecto = (int) ($concepto['permite_pago_directo'] ?? 0) === 1;

        if ($restante <= 0 || $saldo <= 0 || !$permitePagoDirecto) {
            continue;
        }

        $montoAplicado = round(min($restante, $saldo), 2);
        if ($montoAplicado <= 0) {
            continue;
        }

        $aplicaciones[] = [
            'id_cobro_detalle' => (int) $concepto['id_cobro_detalle'],
            'codigo' => $concepto['codigo'],
            'monto_aplicado' => $montoAplicado,
        ];

        $restante = round($restante - $montoAplicado, 2);
    }

    if ($restante > 0) {
        throw new RuntimeException('El monto pagado excede el saldo disponible del cobro.');
    }

    return $aplicaciones;
}

function buildAplicacionesManuales(array $conceptos, array $aplicacionesInput, float $montoPagado): array
{
    if ($aplicacionesInput === []) {
        throw new RuntimeException('Las aplicaciones son obligatorias cuando modo_aplicacion es MANUAL.');
    }

    $conceptosById = [];
    foreach ($conceptos as $concepto) {
        $conceptosById[(int) $concepto['id_cobro_detalle']] = $concepto;
    }

    $result = [];
    $total = 0.0;
    $seen = [];

    foreach ($aplicacionesInput as $item) {
        $idCobroDetalle = (int) ($item['id_cobro_detalle'] ?? 0);
        $montoAplicado = round((float) ($item['monto_aplicado'] ?? 0), 2);

        if ($idCobroDetalle <= 0 || $montoAplicado <= 0) {
            throw new RuntimeException('Cada aplicacion manual requiere id_cobro_detalle y monto_aplicado validos.');
        }

        if (isset($seen[$idCobroDetalle])) {
            throw new RuntimeException('No se puede repetir la misma linea de cobro en una aplicacion manual.');
        }

        if (!isset($conceptosById[$idCobroDetalle])) {
            throw new RuntimeException('Una aplicacion manual referencia una linea de cobro no valida.');
        }

        $concepto = $conceptosById[$idCobroDetalle];
        if ((int) ($concepto['permite_pago_directo'] ?? 0) !== 1) {
            throw new RuntimeException('El concepto seleccionado no permite pago directo.');
        }

        $saldo = round((float) ($concepto['saldo_pendiente'] ?? 0), 2);
        if ($montoAplicado > $saldo) {
            throw new RuntimeException('Una aplicacion manual excede el saldo disponible del concepto.');
        }

        $result[] = [
            'id_cobro_detalle' => $idCobroDetalle,
            'codigo' => $concepto['codigo'],
            'monto_aplicado' => $montoAplicado,
        ];
        $seen[$idCobroDetalle] = true;
        $total = round($total + $montoAplicado, 2);
    }

    if (round($total, 2) !== round($montoPagado, 2)) {
        throw new RuntimeException('La suma de aplicaciones manuales debe ser igual a monto_pagado.');
    }

    return $result;
}

function createPagoAudit(PDO $pdo, int $idPago, string $accion, ?string $actor, ?array $before, ?array $after): void
{
    if (!pagosDetalleSchemaDisponible($pdo)) {
        return;
    }

    $stmt = $pdo->prepare(" 
        INSERT INTO pagos_auditoria (
            id_pago,
            accion,
            actor,
            payload_before,
            payload_after
        ) VALUES (
            :id_pago,
            :accion,
            :actor,
            :payload_before,
            :payload_after
        )
    ");

    $stmt->execute([
        'id_pago' => $idPago,
        'accion' => $accion,
        'actor' => $actor,
        'payload_before' => $before ? json_encode($before, JSON_UNESCAPED_UNICODE) : null,
        'payload_after' => $after ? json_encode($after, JSON_UNESCAPED_UNICODE) : null,
    ]);
}

function insertPagoDetalle(PDO $pdo, int $idPago, array $aplicaciones, string $origenAplicacion): void
{
    $stmt = $pdo->prepare(" 
        INSERT INTO pagos_detalle (
            id_pago,
            id_cobro_detalle,
            monto_aplicado,
            origen_aplicacion,
            observacion
        ) VALUES (
            :id_pago,
            :id_cobro_detalle,
            :monto_aplicado,
            :origen_aplicacion,
            :observacion
        )
    ");

    foreach ($aplicaciones as $aplicacion) {
        $stmt->execute([
            'id_pago' => $idPago,
            'id_cobro_detalle' => $aplicacion['id_cobro_detalle'],
            'monto_aplicado' => $aplicacion['monto_aplicado'],
            'origen_aplicacion' => $origenAplicacion,
            'observacion' => null,
        ]);
    }
}

function getPagoAplicaciones(PDO $pdo, array $paymentIds): array
{
    if ($paymentIds === [] || !pagosDetalleSchemaDisponible($pdo)) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($paymentIds), '?'));
    $stmt = $pdo->prepare(" 
        SELECT
            pd.id_pago,
            pd.id_cobro_detalle,
            cc.codigo,
            cc.nombre,
            pd.monto_aplicado,
            pd.origen_aplicacion
        FROM pagos_detalle pd
        INNER JOIN cobros_mensuales_detalle cd ON cd.id_cobro_detalle = pd.id_cobro_detalle
        INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
        WHERE pd.id_pago IN ($placeholders)
        ORDER BY pd.id_pago, cd.id_cobro_detalle
    ");
    $stmt->execute(array_values($paymentIds));

    $grouped = [];
    foreach ($stmt->fetchAll() as $row) {
        $idPago = (int) $row['id_pago'];
        $grouped[$idPago][] = [
            'id_cobro_detalle' => (int) $row['id_cobro_detalle'],
            'codigo' => $row['codigo'],
            'nombre' => $row['nombre'],
            'monto_aplicado' => (float) $row['monto_aplicado'],
            'origen_aplicacion' => $row['origen_aplicacion'],
        ];
    }

    return $grouped;
}

function getPagoSnapshot(PDO $pdo, int $idPago): array
{
    if (pagosDetalleSchemaDisponible($pdo)) {
        $stmt = $pdo->prepare(" 
            SELECT
                p.id_pago,
                p.id_cobro,
                p.fecha_pago,
                p.monto_pagado,
                p.metodo_pago,
                p.numero_operacion,
                p.observacion,
                p.estado,
                p.origen_registro,
                p.registrado_por,
                p.reversado_por,
                p.fecha_reversa,
                p.motivo_reversa
            FROM pagos p
            WHERE p.id_pago = :id
            LIMIT 1
        ");
    } else {
        $stmt = $pdo->prepare(" 
            SELECT
                p.id_pago,
                p.id_cobro,
                p.fecha_pago,
                p.monto_pagado,
                p.metodo_pago,
                p.numero_operacion,
                p.observacion
            FROM pagos p
            WHERE p.id_pago = :id
            LIMIT 1
        ");
    }

    $stmt->execute(['id' => $idPago]);
    $row = $stmt->fetch();

    if (!$row) {
        throw new RuntimeException('Pago no encontrado');
    }

    return $row;
}

function requireDetalleSchema(PDO $pdo): void
{
    if (!pagosDetalleSchemaDisponible($pdo)) {
        throw new RuntimeException('El esquema de pagos por concepto no esta desplegado. Ejecuta primero los scripts SQL de schema y migracion.');
    }
}