<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/common.php';

function fetchPagoBaseRow(PDO $pdo, int $idPago): array
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
                p.motivo_reversa,
                p.created_at,
                p.updated_at,
                c.id_periodo,
                c.id_persona,
                c.id_unidad,
                u.codigo_unidad,
                u.nombre_unidad,
                CONCAT(pr.nombres, ' ', pr.apellidos) AS inquilino
            FROM pagos p
            INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
            INNER JOIN unidades u ON u.id_unidad = c.id_unidad
            INNER JOIN personas pr ON pr.id_persona = c.id_persona
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
                p.observacion,
                p.created_at,
                p.updated_at,
                c.id_periodo,
                c.id_persona,
                c.id_unidad,
                u.codigo_unidad,
                u.nombre_unidad,
                CONCAT(pr.nombres, ' ', pr.apellidos) AS inquilino
            FROM pagos p
            INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
            INNER JOIN unidades u ON u.id_unidad = c.id_unidad
            INNER JOIN personas pr ON pr.id_persona = c.id_persona
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

function listPagosRows(PDO $pdo, int $idCobro, int $idPeriodo): array
{
    if (pagosDetalleSchemaDisponible($pdo)) {
        $sql = "
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
                p.motivo_reversa,
                p.created_at,
                p.updated_at,
                c.id_periodo,
                u.codigo_unidad,
                u.nombre_unidad,
                CONCAT(pr.nombres, ' ', pr.apellidos) AS inquilino
            FROM pagos p
            INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
            INNER JOIN unidades u ON u.id_unidad = c.id_unidad
            INNER JOIN personas pr ON pr.id_persona = c.id_persona
            WHERE 1 = 1
        ";
    } else {
        $sql = "
            SELECT
                p.id_pago,
                p.id_cobro,
                p.fecha_pago,
                p.monto_pagado,
                p.metodo_pago,
                p.numero_operacion,
                p.observacion,
                p.created_at,
                p.updated_at,
                c.id_periodo,
                u.codigo_unidad,
                u.nombre_unidad,
                CONCAT(pr.nombres, ' ', pr.apellidos) AS inquilino
            FROM pagos p
            INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
            INNER JOIN unidades u ON u.id_unidad = c.id_unidad
            INNER JOIN personas pr ON pr.id_persona = c.id_persona
            WHERE 1 = 1
        ";
    }

    $params = [];
    if ($idCobro > 0) {
        $sql .= ' AND p.id_cobro = :id_cobro';
        $params['id_cobro'] = $idCobro;
    }
    if ($idPeriodo > 0) {
        $sql .= ' AND c.id_periodo = :id_periodo';
        $params['id_periodo'] = $idPeriodo;
    }

    $sql .= ' ORDER BY p.fecha_pago DESC, p.id_pago DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll();
}

function attachAplicacionesToRows(PDO $pdo, array $rows): array
{
    if ($rows === [] || !pagosDetalleSchemaDisponible($pdo)) {
        return $rows;
    }

    $ids = array_map(static fn(array $row): int => (int) $row['id_pago'], $rows);
    $aplicaciones = getPagoAplicaciones($pdo, $ids);

    foreach ($rows as &$row) {
        $idPago = (int) $row['id_pago'];
        $row['aplicaciones'] = $aplicaciones[$idPago] ?? [];
    }
    unset($row);

    return $rows;
}

function resolveAplicacionesForBody(PDO $pdo, int $idCobro, array $body, float $montoPagado): array
{
    $modoAplicacion = strtoupper(trim((string) ($body['modo_aplicacion'] ?? 'AUTOMATICA')));
    if (!in_array($modoAplicacion, ['AUTOMATICA', 'MANUAL'], true)) {
        throw new RuntimeException('modo_aplicacion debe ser AUTOMATICA o MANUAL.');
    }

    $conceptos = getCobroConceptos($pdo, $idCobro);
    if ($modoAplicacion === 'MANUAL') {
        $aplicaciones = buildAplicacionesManuales($conceptos, is_array($body['aplicaciones'] ?? null) ? $body['aplicaciones'] : [], $montoPagado);
    } else {
        $aplicaciones = buildAplicacionesAutomaticas($conceptos, $montoPagado);
    }

    if ($aplicaciones === []) {
        throw new RuntimeException('No existe saldo disponible para aplicar el pago.');
    }

    return [$modoAplicacion, $aplicaciones];
}

function insertPagoLegacy(PDO $pdo, array $body): array
{
    $idCobro = (int) ($body['id_cobro'] ?? 0);
    $fechaPago = trim((string) ($body['fecha_pago'] ?? ''));
    $montoPagado = (float) ($body['monto_pagado'] ?? 0);
    $metodoPago = normalizeMetodoPago($body);
    $numeroOperacion = normalizeNumeroOperacion($body, $metodoPago);

    if ($idCobro <= 0 || $fechaPago === '' || $montoPagado <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id_cobro, fecha_pago y monto_pagado son obligatorios'], 422);
    }

    $stmt = $pdo->prepare(" 
        INSERT INTO pagos (
            id_cobro,
            fecha_pago,
            monto_pagado,
            metodo_pago,
            numero_operacion,
            observacion
        ) VALUES (
            :id_cobro,
            :fecha_pago,
            :monto_pagado,
            :metodo_pago,
            :numero_operacion,
            :observacion
        )
    ");

    $pdo->beginTransaction();
    $stmt->execute([
        'id_cobro' => $idCobro,
        'fecha_pago' => $fechaPago,
        'monto_pagado' => $montoPagado,
        'metodo_pago' => $metodoPago,
        'numero_operacion' => $numeroOperacion,
        'observacion' => emptyToNull($body, 'observacion'),
    ]);

    syncCobroStatus($pdo, $idCobro);
    $pdo->commit();

    return [
        'id_pago' => (int) $pdo->lastInsertId(),
        'id_cobro' => $idCobro,
    ];
}

function insertPagoDetalleMode(PDO $pdo, array $body): array
{
    $idCobro = (int) ($body['id_cobro'] ?? 0);
    $fechaPago = trim((string) ($body['fecha_pago'] ?? ''));
    $montoPagado = round((float) ($body['monto_pagado'] ?? 0), 2);
    $metodoPago = normalizeMetodoPago($body);
    $numeroOperacion = normalizeNumeroOperacion($body, $metodoPago);

    if ($idCobro <= 0 || $fechaPago === '' || $montoPagado <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id_cobro, fecha_pago y monto_pagado son obligatorios'], 422);
    }

    $cobro = getCobroHeader($pdo, $idCobro);
    if (($cobro['estado_pago'] ?? '') === 'ANULADO') {
        throw new RuntimeException('No se puede registrar pagos sobre un cobro anulado.');
    }

    [$modoAplicacion, $aplicaciones] = resolveAplicacionesForBody($pdo, $idCobro, $body, $montoPagado);
    $registradoPor = emptyToNull($body, 'registrado_por');

    $stmt = $pdo->prepare(" 
        INSERT INTO pagos (
            id_cobro,
            fecha_pago,
            monto_pagado,
            metodo_pago,
            numero_operacion,
            observacion,
            estado,
            origen_registro,
            registrado_por
        ) VALUES (
            :id_cobro,
            :fecha_pago,
            :monto_pagado,
            :metodo_pago,
            :numero_operacion,
            :observacion,
            'REGISTRADO',
            'MANUAL',
            :registrado_por
        )
    ");

    $pdo->beginTransaction();
    $stmt->execute([
        'id_cobro' => $idCobro,
        'fecha_pago' => $fechaPago,
        'monto_pagado' => $montoPagado,
        'metodo_pago' => $metodoPago,
        'numero_operacion' => $numeroOperacion,
        'observacion' => emptyToNull($body, 'observacion'),
        'registrado_por' => $registradoPor,
    ]);

    $idPago = (int) $pdo->lastInsertId();
    insertPagoDetalle($pdo, $idPago, $aplicaciones, $modoAplicacion);
    syncCobroStatus($pdo, $idCobro);

    $after = getPagoSnapshot($pdo, $idPago);
    $after['aplicaciones'] = $aplicaciones;
    createPagoAudit($pdo, $idPago, 'CREADO', $registradoPor, null, $after);
    createPagoAudit($pdo, $idPago, 'APLICADO', $registradoPor, null, $after);

    $pdo->commit();

    return [
        'id_pago' => $idPago,
        'id_cobro' => $idCobro,
        'estado_pago_cobro' => getCobroHeader($pdo, $idCobro)['estado_pago'],
        'aplicaciones' => $aplicaciones,
    ];
}

function updatePagoLegacy(PDO $pdo, int $id, array $body): void
{
    $idCobro = (int) ($body['id_cobro'] ?? 0);
    $fechaPago = trim((string) ($body['fecha_pago'] ?? ''));
    $montoPagado = (float) ($body['monto_pagado'] ?? 0);
    $metodoPago = normalizeMetodoPago($body);
    $numeroOperacion = normalizeNumeroOperacion($body, $metodoPago);

    if ($idCobro <= 0 || $fechaPago === '' || $montoPagado <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id_cobro, fecha_pago y monto_pagado son obligatorios'], 422);
    }

    $stmtPrev = $pdo->prepare('SELECT id_cobro FROM pagos WHERE id_pago = :id LIMIT 1');
    $stmtPrev->execute(['id' => $id]);
    $prev = $stmtPrev->fetch();
    if (!$prev) {
        jsonResponse(['ok' => false, 'message' => 'Pago no encontrado'], 404);
    }

    $idCobroAnterior = (int) $prev['id_cobro'];
    $stmt = $pdo->prepare(" 
        UPDATE pagos
        SET
            id_cobro = :id_cobro,
            fecha_pago = :fecha_pago,
            monto_pagado = :monto_pagado,
            metodo_pago = :metodo_pago,
            numero_operacion = :numero_operacion,
            observacion = :observacion,
            updated_at = NOW()
        WHERE id_pago = :id
    ");

    $pdo->beginTransaction();
    $stmt->execute([
        'id' => $id,
        'id_cobro' => $idCobro,
        'fecha_pago' => $fechaPago,
        'monto_pagado' => $montoPagado,
        'metodo_pago' => $metodoPago,
        'numero_operacion' => $numeroOperacion,
        'observacion' => emptyToNull($body, 'observacion'),
    ]);

    syncCobroStatus($pdo, $idCobroAnterior);
    if ($idCobroAnterior !== $idCobro) {
        syncCobroStatus($pdo, $idCobro);
    }
    $pdo->commit();
}

function updatePagoDetalleMode(PDO $pdo, int $id, array $body): array
{
    $before = getPagoSnapshot($pdo, $id);
    if (($before['estado'] ?? 'REGISTRADO') !== 'REGISTRADO') {
        throw new RuntimeException('Solo se puede editar un pago en estado REGISTRADO.');
    }

    $idCobro = (int) ($body['id_cobro'] ?? 0);
    $fechaPago = trim((string) ($body['fecha_pago'] ?? ''));
    $montoPagado = round((float) ($body['monto_pagado'] ?? 0), 2);
    $metodoPago = normalizeMetodoPago($body);
    $numeroOperacion = normalizeNumeroOperacion($body, $metodoPago);

    if ($idCobro <= 0 || $fechaPago === '' || $montoPagado <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id_cobro, fecha_pago y monto_pagado son obligatorios'], 422);
    }

    [$modoAplicacion, $aplicaciones] = resolveAplicacionesForBody($pdo, $idCobro, $body, $montoPagado);
    $actor = emptyToNull($body, 'registrado_por') ?? ($before['registrado_por'] ?? null);

    $stmt = $pdo->prepare(" 
        UPDATE pagos
        SET
            id_cobro = :id_cobro,
            fecha_pago = :fecha_pago,
            monto_pagado = :monto_pagado,
            metodo_pago = :metodo_pago,
            numero_operacion = :numero_operacion,
            observacion = :observacion,
            registrado_por = :registrado_por,
            updated_at = NOW()
        WHERE id_pago = :id
    ");

    $pdo->beginTransaction();
    $stmt->execute([
        'id' => $id,
        'id_cobro' => $idCobro,
        'fecha_pago' => $fechaPago,
        'monto_pagado' => $montoPagado,
        'metodo_pago' => $metodoPago,
        'numero_operacion' => $numeroOperacion,
        'observacion' => emptyToNull($body, 'observacion'),
        'registrado_por' => $actor,
    ]);

    $pdo->prepare('DELETE FROM pagos_detalle WHERE id_pago = :id')->execute(['id' => $id]);
    insertPagoDetalle($pdo, $id, $aplicaciones, $modoAplicacion);
    syncCobroStatus($pdo, (int) $before['id_cobro']);
    if ((int) $before['id_cobro'] !== $idCobro) {
        syncCobroStatus($pdo, $idCobro);
    }

    $after = getPagoSnapshot($pdo, $id);
    $after['aplicaciones'] = $aplicaciones;
    createPagoAudit($pdo, $id, 'ACTUALIZADO', $actor, $before, $after);

    $pdo->commit();

    return [
        'id_pago' => $id,
        'id_cobro' => $idCobro,
        'estado_pago_cobro' => getCobroHeader($pdo, $idCobro)['estado_pago'],
        'aplicaciones' => $aplicaciones,
    ];
}

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $schemaDetalle = pagosDetalleSchemaDisponible($pdo);

    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id > 0) {
            $row = fetchPagoBaseRow($pdo, $id);
            $rows = attachAplicacionesToRows($pdo, [$row]);
            jsonResponse(['ok' => true, 'data' => $rows[0]]);
        }

        $idCobro = isset($_GET['id_cobro']) ? (int) $_GET['id_cobro'] : 0;
        $idPeriodo = isset($_GET['id_periodo']) ? (int) $_GET['id_periodo'] : 0;
        $rows = listPagosRows($pdo, $idCobro, $idPeriodo);
        $rows = attachAplicacionesToRows($pdo, $rows);

        jsonResponse(['ok' => true, 'data' => $rows]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $data = $schemaDetalle ? insertPagoDetalleMode($pdo, $body) : insertPagoLegacy($pdo, $body);

        jsonResponse([
            'ok' => true,
            'message' => 'Pago registrado correctamente',
            'data' => $data,
        ], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $body = getJsonBody();
        if ($schemaDetalle) {
            $data = updatePagoDetalleMode($pdo, $id, $body);
            jsonResponse([
                'ok' => true,
                'message' => 'Pago actualizado correctamente',
                'data' => $data,
            ]);
        }

        updatePagoLegacy($pdo, $id, $body);
        jsonResponse(['ok' => true, 'message' => 'Pago actualizado correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        if ($schemaDetalle) {
            jsonResponse(['ok' => false, 'message' => 'En pagos por concepto no se elimina fisicamente. Usa la reversa.'], 409);
        }

        $stmtPrev = $pdo->prepare('SELECT id_cobro FROM pagos WHERE id_pago = :id LIMIT 1');
        $stmtPrev->execute(['id' => $id]);
        $prev = $stmtPrev->fetch();

        if (!$prev) {
            jsonResponse(['ok' => false, 'message' => 'Pago no encontrado'], 404);
        }

        $idCobro = (int) $prev['id_cobro'];
        $stmt = $pdo->prepare('DELETE FROM pagos WHERE id_pago = :id');

        $pdo->beginTransaction();
        $stmt->execute(['id' => $id]);
        syncCobroStatus($pdo, $idCobro);
        $pdo->commit();

        jsonResponse(['ok' => true, 'message' => 'Pago eliminado correctamente']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $status = str_contains(strtolower($e->getMessage()), 'no encontrado') ? 404 : 500;
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], $status);
}
