<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../pagos/common.php';
require_once __DIR__ . '/common.php';

function getPagosPeriodoConAplicaciones(PDO $pdo, int $periodoId): array
{
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
        WHERE c.id_periodo = :periodoId
        ORDER BY p.fecha_pago DESC, p.id_pago DESC
    ");
    $stmt->execute(['periodoId' => $periodoId]);

    $rows = $stmt->fetchAll();
    if ($rows === []) {
        return [];
    }

    $aplicaciones = getPagoAplicaciones($pdo, array_map(static fn(array $row): int => (int) $row['id_pago'], $rows));
    foreach ($rows as &$row) {
        $row['aplicaciones'] = $aplicaciones[(int) $row['id_pago']] ?? [];
    }
    unset($row);

    return $rows;
}

function replayPagoForForceRefresh(PDO $pdo, array $pago, string $actor): void
{
    $idCobro = (int) $pago['id_cobro'];
    $cobro = getCobroHeader($pdo, $idCobro);
    if (($cobro['estado_pago'] ?? '') === 'ANULADO') {
        throw new RuntimeException('No se puede reaplicar un pago sobre un cobro anulado.');
    }

    $montoPagado = round((float) ($pago['monto_pagado'] ?? 0), 2);
    $conceptos = getCobroConceptos($pdo, $idCobro);
    $aplicaciones = buildAplicacionesManuales($conceptos, is_array($pago['aplicaciones'] ?? null) ? $pago['aplicaciones'] : [], $montoPagado);

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

    $stmt->execute([
        'id_cobro' => $idCobro,
        'fecha_pago' => $pago['fecha_pago'],
        'monto_pagado' => $montoPagado,
        'metodo_pago' => normalizeMetodoPago($pago),
        'numero_operacion' => $pago['numero_operacion'] ?: null,
        'observacion' => $pago['observacion'] ?: null,
        'registrado_por' => $actor,
    ]);

    $idPago = (int) $pdo->lastInsertId();
    insertPagoDetalle($pdo, $idPago, $aplicaciones, 'MANUAL');
    syncCobroStatus($pdo, $idCobro);

    $after = getPagoSnapshot($pdo, $idPago);
    $after['aplicaciones'] = $aplicaciones;
    createPagoAudit($pdo, $idPago, 'CREADO', $actor, null, $after);
    createPagoAudit($pdo, $idPago, 'APLICADO', $actor, null, $after);
}

function getPeriodoCobrosActuales(PDO $pdo, int $periodoId): array
{
    $stmt = $pdo->prepare(" 
        SELECT id_cobro, id_persona, id_unidad
        FROM cobros_mensuales
        WHERE id_periodo = :periodoId
          AND estado_pago <> 'ANULADO'
    ");
    $stmt->execute(['periodoId' => $periodoId]);

    $result = [];
    foreach ($stmt->fetchAll() as $row) {
        $result[buildCobroPeriodoKey((int) $row['id_unidad'], (int) $row['id_persona'])] = [
            'id_cobro' => (int) $row['id_cobro'],
            'id_persona' => (int) $row['id_persona'],
            'id_unidad' => (int) $row['id_unidad'],
        ];
    }

    return $result;
}

function getDetalleCodesByCobro(PDO $pdo, array $cobroIds): array
{
    if ($cobroIds === []) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($cobroIds), '?'));
    $stmt = $pdo->prepare(" 
        SELECT cd.id_cobro, cc.codigo, cd.id_cobro_detalle
        FROM cobros_mensuales_detalle cd
        INNER JOIN conceptos_cobro cc ON cc.id_concepto = cd.id_concepto
        WHERE cd.id_cobro IN ($placeholders)
        ORDER BY cd.id_cobro, cc.prioridad_aplicacion, cd.orden_visual
    ");
    $stmt->execute(array_values($cobroIds));

    $result = [];
    foreach ($stmt->fetchAll() as $row) {
        $idCobro = (int) $row['id_cobro'];
        $result[$idCobro][$row['codigo']] = (int) $row['id_cobro_detalle'];
    }

    return $result;
}

function normalizeCodigoSet(array $detalles): array
{
    $codes = array_map(static fn(array $detalle): string => (string) $detalle['codigo'], $detalles);
    sort($codes);
    return $codes;
}

function reversePagoForForceRefresh(PDO $pdo, int $idPago, string $actor, string $motivo, string $fechaReversa): void
{
    $before = getPagoSnapshot($pdo, $idPago);
    if (($before['estado'] ?? 'REGISTRADO') !== 'REGISTRADO') {
        return;
    }

    $stmt = $pdo->prepare(" 
        UPDATE pagos
        SET
            estado = 'REVERSADO',
            reversado_por = :actor,
            fecha_reversa = :fecha_reversa,
            motivo_reversa = :motivo,
            updated_at = NOW()
        WHERE id_pago = :id
    ");
    $stmt->execute([
        'id' => $idPago,
        'actor' => $actor,
        'fecha_reversa' => $fechaReversa,
        'motivo' => $motivo,
    ]);

    $after = getPagoSnapshot($pdo, $idPago);
    createPagoAudit($pdo, $idPago, 'REVERSADO', $actor, $before, $after);
}

function rebuildCobrosAfterPurgingReversed(PDO $pdo, int $periodoId, array $programados, array $conceptosMap): void
{
    $stmtPagos = $pdo->prepare(" 
        SELECT p.id_pago
        FROM pagos p
        INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
        WHERE c.id_periodo = :periodoId
    ");
    $stmtPagos->execute(['periodoId' => $periodoId]);
    $pagoIds = array_map(static fn(array $row): int => (int) $row['id_pago'], $stmtPagos->fetchAll());

    if ($pagoIds !== []) {
        $placeholders = implode(',', array_fill(0, count($pagoIds), '?'));
        $pdo->prepare("DELETE FROM pagos_auditoria WHERE id_pago IN ($placeholders)")->execute($pagoIds);
        $pdo->prepare("DELETE FROM pagos_detalle WHERE id_pago IN ($placeholders)")->execute($pagoIds);
        $pdo->prepare("DELETE FROM pagos WHERE id_pago IN ($placeholders)")->execute($pagoIds);
    }

    $pdo->prepare(" 
        DELETE cd
        FROM cobros_mensuales_detalle cd
        INNER JOIN cobros_mensuales c ON c.id_cobro = cd.id_cobro
        WHERE c.id_periodo = :periodoId
    ")->execute(['periodoId' => $periodoId]);

    $pdo->prepare("DELETE FROM cobros_mensuales WHERE id_periodo = :periodoId")
        ->execute(['periodoId' => $periodoId]);

    $insert = $pdo->prepare(" 
        INSERT INTO cobros_mensuales (
            id_periodo, id_persona, id_unidad, monto_alquiler, monto_luz, ajuste_minimo_luz, monto_agua,
            monto_gas, otros_conceptos, descuento, mora, total_cobrar,
            fecha_vencimiento, estado_pago, observacion
        ) VALUES (
            :id_periodo, :id_persona, :id_unidad, :monto_alquiler, :monto_luz, :ajuste_minimo_luz, :monto_agua,
            :monto_gas, :otros_conceptos, 0, 0, :total_cobrar, :fecha_vencimiento, 'PENDIENTE', :observacion
        )
    ");

    foreach ($programados as $row) {
        $insert->execute([
            'id_periodo' => $periodoId,
            'id_persona' => (int) $row['id_persona'],
            'id_unidad' => (int) $row['id_unidad'],
            'monto_alquiler' => $row['monto_alquiler'],
            'monto_luz' => $row['monto_luz'],
            'ajuste_minimo_luz' => $row['ajuste_minimo_luz'],
            'monto_agua' => $row['monto_agua'],
            'monto_gas' => $row['monto_gas'],
            'otros_conceptos' => $row['otros_conceptos'],
            'total_cobrar' => $row['total_cobrar'],
            'fecha_vencimiento' => $row['fecha_vencimiento'],
            'observacion' => $row['observacion'],
        ]);

        $idCobroNuevo = (int) $pdo->lastInsertId();
        createCobroDetalleLineas($pdo, $idCobroNuevo, $row['detalles'], $conceptosMap);
    }
}

try {
    $pdo = Database::getConnection();
    requireDetalleSchema($pdo);

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'POST') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $periodoId = getPeriodoId($pdo);
    $body = getJsonBody();
    $descartarPagoIds = array_values(array_unique(array_map('intval', is_array($body['descartar_pago_ids'] ?? null) ? $body['descartar_pago_ids'] : [])));

    $programados = buildCobrosProgramados($pdo, $periodoId);
    $programadosByKey = [];
    foreach ($programados as $row) {
        $programadosByKey[$row['key']] = $row;
    }

    $actualesByKey = getPeriodoCobrosActuales($pdo, $periodoId);
    if ($actualesByKey === []) {
        jsonResponse(['ok' => false, 'message' => 'No existen cobros generados en este periodo. Usa primero la generación normal.'], 409);
    }

    $pagos = getPagosPeriodoConAplicaciones($pdo, $periodoId);
    $pagosRegistrados = array_values(array_filter($pagos, static fn(array $row): bool => strtoupper((string) ($row['estado'] ?? 'REGISTRADO')) === 'REGISTRADO'));
    usort($pagosRegistrados, static function (array $a, array $b): int {
        $ka = ($a['fecha_pago'] ?? '') . '#' . str_pad((string) ($a['id_pago'] ?? 0), 12, '0', STR_PAD_LEFT);
        $kb = ($b['fecha_pago'] ?? '') . '#' . str_pad((string) ($b['id_pago'] ?? 0), 12, '0', STR_PAD_LEFT);
        return $ka <=> $kb;
    });

    $descartarLookup = array_fill_keys($descartarPagoIds, true);
    $pagosPreservados = array_values(array_filter($pagosRegistrados, static fn(array $row): bool => !isset($descartarLookup[(int) $row['id_pago']])));

    $actor = 'ADMIN_UI_FORCE_REFRESH';
    $motivo = 'Actualizacion forzada de cobros del periodo';
    $fechaReversa = date('Y-m-d');

    $actualKeys = array_keys($actualesByKey);
    $programmedKeys = array_keys($programadosByKey);
    sort($actualKeys);
    sort($programmedKeys);
    $structureChanged = ($actualKeys !== $programmedKeys);

    $detalleCodesByCobro = getDetalleCodesByCobro($pdo, array_map(static fn(array $row): int => $row['id_cobro'], array_values($actualesByKey)));
    if (!$structureChanged) {
        foreach ($actualesByKey as $key => $actual) {
            $expectedCodes = normalizeCodigoSet($programadosByKey[$key]['detalles']);
            $currentCodes = array_keys($detalleCodesByCobro[$actual['id_cobro']] ?? []);
            sort($currentCodes);
            if ($currentCodes !== $expectedCodes) {
                $structureChanged = true;
                break;
            }
        }
    }

    $conceptosMap = getConceptosActivosMap($pdo);

    if ($structureChanged && $pagosRegistrados === []) {
        $pdo->beginTransaction();
        rebuildCobrosAfterPurgingReversed($pdo, $periodoId, $programados, $conceptosMap);
        $pdo->commit();

        jsonResponse([
            'ok' => true,
            'message' => 'Cobros regenerados limpiando el historial reversado del periodo para reconstruir la estructura actual.',
            'data' => [
                'pagos_reversados' => 0,
                'pagos_descartados' => 0,
                'pagos_reaplicados' => 0,
                'modo' => 'PURGE_REVERSED_REGENERATE',
            ],
        ]);
    }

    if ($structureChanged) {
        jsonResponse([
            'ok' => false,
            'message' => 'No se puede forzar la actualización porque una o más líneas de cobro por concepto cambiaron y existen pagos activos por preservar. Este caso requiere revisión manual.'
        ], 409);
    }

    $stmtUpdateCobro = $pdo->prepare(" 
        UPDATE cobros_mensuales
        SET
            monto_alquiler = :monto_alquiler,
            monto_luz = :monto_luz,
            ajuste_minimo_luz = :ajuste_minimo_luz,
            monto_agua = :monto_agua,
            monto_gas = :monto_gas,
            otros_conceptos = :otros_conceptos,
            total_cobrar = :total_cobrar,
            fecha_vencimiento = :fecha_vencimiento,
            estado_pago = 'PENDIENTE',
            observacion = :observacion,
            updated_at = NOW()
        WHERE id_cobro = :id_cobro
    ");

    $stmtUpdateDetalle = $pdo->prepare(" 
        UPDATE cobros_mensuales_detalle
        SET
            monto_programado = :monto_programado,
            descripcion = :descripcion,
            orden_visual = :orden_visual,
            updated_at = NOW()
        WHERE id_cobro_detalle = :id_cobro_detalle
    ");

    $pdo->beginTransaction();

    foreach ($pagosRegistrados as $pago) {
        reversePagoForForceRefresh($pdo, (int) $pago['id_pago'], $actor, $motivo, $fechaReversa);
    }

    foreach ($actualesByKey as $key => $actual) {
        $programado = $programadosByKey[$key];
        $stmtUpdateCobro->execute([
            'id_cobro' => $actual['id_cobro'],
            'monto_alquiler' => $programado['monto_alquiler'],
            'monto_luz' => $programado['monto_luz'],
            'ajuste_minimo_luz' => $programado['ajuste_minimo_luz'],
            'monto_agua' => $programado['monto_agua'],
            'monto_gas' => $programado['monto_gas'],
            'otros_conceptos' => $programado['otros_conceptos'],
            'total_cobrar' => $programado['total_cobrar'],
            'fecha_vencimiento' => $programado['fecha_vencimiento'],
            'observacion' => $programado['observacion'],
        ]);

        $detalleIds = $detalleCodesByCobro[$actual['id_cobro']] ?? [];
        foreach ($programado['detalles'] as $detalle) {
            if (!isset($detalleIds[$detalle['codigo']])) {
                throw new RuntimeException('No se encontró la línea de detalle requerida para actualizar el cobro de forma segura.');
            }

            $stmtUpdateDetalle->execute([
                'id_cobro_detalle' => $detalleIds[$detalle['codigo']],
                'monto_programado' => $detalle['monto'],
                'descripcion' => $detalle['descripcion'],
                'orden_visual' => $detalle['orden_visual'],
            ]);
        }
    }

    foreach ($actualesByKey as $actual) {
        syncCobroStatus($pdo, (int) $actual['id_cobro']);
    }

    $reaplicados = 0;
    foreach ($pagosPreservados as $pago) {
        replayPagoForForceRefresh($pdo, $pago, $actor);
        $reaplicados++;
    }

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'message' => 'Cobros actualizados con preservación de pagos seleccionados.',
        'data' => [
            'pagos_reversados' => count($pagosRegistrados),
            'pagos_descartados' => count($pagosRegistrados) - count($pagosPreservados),
            'pagos_reaplicados' => $reaplicados,
        ],
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}