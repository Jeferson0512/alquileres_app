<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);

    $stmtDb = $pdo->query('SELECT DATABASE() AS db_name');
    $dbName = (string) (($stmtDb->fetch()['db_name'] ?? ''));
    $hasPagoEstadoColumn = false;
    if ($dbName !== '') {
        $stmtCol = $pdo->prepare(" 
            SELECT COUNT(*) AS total
            FROM information_schema.columns
            WHERE table_schema = :db
              AND table_name = 'pagos'
              AND column_name = 'estado'
        ");
        $stmtCol->execute(['db' => $dbName]);
        $hasPagoEstadoColumn = ((int) (($stmtCol->fetch()['total'] ?? 0)) > 0);
    }

    $sumPagadoExprPg = $hasPagoEstadoColumn
        ? "IFNULL(SUM(CASE WHEN pg.estado = 'REGISTRADO' THEN pg.monto_pagado ELSE 0 END), 0)"
        : "IFNULL(SUM(pg.monto_pagado), 0)";
    $sumPagadoExprPg2 = $hasPagoEstadoColumn
        ? "IFNULL(SUM(CASE WHEN pg2.estado = 'REGISTRADO' THEN pg2.monto_pagado ELSE 0 END), 0)"
        : "IFNULL(SUM(pg2.monto_pagado), 0)";
    $sumPagadoExprPa = $hasPagoEstadoColumn
        ? "IFNULL(SUM(CASE WHEN pa.estado = 'REGISTRADO' THEN pa.monto_pagado ELSE 0 END), 0)"
        : "IFNULL(SUM(pa.monto_pagado), 0)";

    $stmtPeriodo = $pdo->prepare('SELECT fecha_inicio FROM periodos WHERE id_periodo = :periodoId LIMIT 1');
    $stmtPeriodo->execute(['periodoId' => $periodoId]);
    $periodo = $stmtPeriodo->fetch();
    $fechaInicioPeriodo = $periodo['fecha_inicio'] ?? null;

    $stmt = $pdo->prepare(" 
        SELECT
            c.id_cobro,
            c.id_persona,
            c.id_unidad,
            u.codigo_unidad,
            u.nombre_unidad,
            p.nombres,
            p.apellidos,
            CONCAT(p.nombres, ' ', p.apellidos) AS inquilino,
            ll.consumo_kwh,
            c.monto_alquiler,
            c.monto_luz,
            c.ajuste_minimo_luz,
            c.monto_agua,
            c.monto_gas,
            c.otros_conceptos,
            c.total_cobrar,
            (
                SELECT {$sumPagadoExprPg}
                FROM pagos pg
                WHERE pg.id_cobro = c.id_cobro
            ) AS pagado_total,
            GREATEST(
                c.total_cobrar - (
                    SELECT {$sumPagadoExprPg2}
                    FROM pagos pg2
                    WHERE pg2.id_cobro = c.id_cobro
                ),
                0
            ) AS saldo_pendiente,
            (
                SELECT IFNULL(SUM(GREATEST(ca.total_cobrar - IFNULL((SELECT {$sumPagadoExprPa} FROM pagos pa WHERE pa.id_cobro = ca.id_cobro), 0), 0)), 0)
                FROM cobros_mensuales ca
                INNER JOIN periodos pprev ON pprev.id_periodo = ca.id_periodo
                WHERE ca.id_persona = c.id_persona
                                    AND ca.id_unidad = c.id_unidad
                  AND ca.id_cobro <> c.id_cobro
                  AND ca.estado_pago <> 'ANULADO'
                AND (:fechaInicioPeriodoRef IS NOT NULL AND pprev.fecha_inicio < :fechaInicioPeriodoCmp)
            ) AS deuda_anterior,
            c.fecha_vencimiento,
            c.estado_pago,
            c.observacion
        FROM cobros_mensuales c
        INNER JOIN unidades u ON u.id_unidad = c.id_unidad
        INNER JOIN personas p ON p.id_persona = c.id_persona
        LEFT JOIN liquidacion_luz_detalle ll ON ll.id_periodo = c.id_periodo AND ll.id_unidad = c.id_unidad AND ll.id_persona = c.id_persona
        WHERE c.id_periodo = :periodoId
                    AND c.estado_pago <> 'ANULADO'
        ORDER BY u.codigo_unidad
    ");
    $stmt->execute([
        'periodoId' => $periodoId,
        'fechaInicioPeriodoRef' => $fechaInicioPeriodo,
        'fechaInicioPeriodoCmp' => $fechaInicioPeriodo,
    ]);

    jsonResponse([
        'ok' => true,
        'data' => $stmt->fetchAll()
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
