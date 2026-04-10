<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../pagos/common.php';
require_once __DIR__ . '/common.php';

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);
    $rows = buildCobrosProgramados($pdo, $periodoId);

    $stmtPagos = $pdo->prepare(" 
        SELECT COUNT(*) AS total
        FROM pagos p
        INNER JOIN cobros_mensuales c ON c.id_cobro = p.id_cobro
        WHERE c.id_periodo = :periodoId
    ");
    $stmtPagos->execute(['periodoId' => $periodoId]);
    $totalPagos = (int) ($stmtPagos->fetch()['total'] ?? 0);

    if ($totalPagos > 0) {
        jsonResponse([
            'ok' => false,
            'message' => 'No se pueden regenerar los cobros de este periodo porque ya tiene pagos registrados. Esto protege el historial de pagos y saldos.'
        ], 409);
    }

    $schemaDetalle = pagosDetalleSchemaDisponible($pdo);
    $conceptosMap = $schemaDetalle ? getConceptosActivosMap($pdo) : [];

    $pdo->beginTransaction();

    if ($schemaDetalle) {
        $pdo->prepare(" 
            DELETE cd
            FROM cobros_mensuales_detalle cd
            INNER JOIN cobros_mensuales c ON c.id_cobro = cd.id_cobro
            WHERE c.id_periodo = :periodoId
        ")->execute(['periodoId' => $periodoId]);
    }

    $pdo->prepare("DELETE FROM cobros_mensuales WHERE id_periodo = :periodoId")
        ->execute(['periodoId' => $periodoId]);

    $insert = $pdo->prepare(" 
        INSERT INTO cobros_mensuales (
            id_periodo, id_persona, id_unidad, monto_alquiler, monto_luz, ajuste_minimo_luz, monto_agua,
            monto_gas, otros_conceptos, descuento, mora, total_cobrar,
            fecha_vencimiento, estado_pago, observacion
        ) VALUES (
            :id_periodo, :id_persona, :id_unidad, :monto_alquiler, :monto_luz, :ajuste_minimo_luz, :monto_agua,
            :monto_gas, :monto_mant, 0, 0, :total_cobrar, :fecha_vencimiento, 'PENDIENTE', :observacion
        )
    ");

    foreach ($rows as $row) {
        $insert->execute([
            'id_periodo'    => $periodoId,
            'id_persona'    => (int) $row['id_persona'],
            'id_unidad'     => (int) $row['id_unidad'],
            'monto_alquiler' => $row['monto_alquiler'],
            'monto_luz'     => $row['monto_luz'],
            'ajuste_minimo_luz' => $row['ajuste_minimo_luz'],
            'monto_agua'    => $row['monto_agua'],
            'monto_gas'     => $row['monto_gas'],
            'monto_mant'    => $row['otros_conceptos'],
            'total_cobrar'  => $row['total_cobrar'],
            'fecha_vencimiento' => $row['fecha_vencimiento'],
            'observacion'   => $row['observacion']
        ]);

        if ($schemaDetalle) {
            $idCobro = (int) $pdo->lastInsertId();
            createCobroDetalleLineas($pdo, $idCobro, $row['detalles'], $conceptosMap);
        }
    }

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'message' => 'Cobros generados correctamente'
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
