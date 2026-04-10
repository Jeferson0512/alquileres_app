<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../pagos/common.php';

try {
    $pdo = Database::getConnection();

    $idPersona = isset($_GET['id_persona']) ? (int) $_GET['id_persona'] : 0;
    $idUnidad = isset($_GET['id_unidad']) ? (int) $_GET['id_unidad'] : 0;
    $idPeriodo = isset($_GET['id_periodo']) ? (int) $_GET['id_periodo'] : 0;

    if ($idPersona <= 0 || $idUnidad <= 0 || $idPeriodo <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id_persona, id_unidad e id_periodo son obligatorios'], 422);
    }

    // Modo compatible: si el esquema por concepto aun no esta desplegado, no romper UI.
    if (!pagosDetalleSchemaDisponible($pdo)) {
        jsonResponse([
            'ok' => true,
            'data' => [
                'id_persona' => $idPersona,
                'id_unidad' => $idUnidad,
                'id_periodo_actual' => $idPeriodo,
                'deuda_anterior_total' => 0,
                'periodos' => [],
                'compat_mode' => true,
            ],
        ]);
    }

    $stmt = $pdo->prepare(" 
        SELECT
            c.id_periodo,
            p.anio,
            p.mes,
            SUM(GREATEST(cd.monto_programado - IFNULL(x.pagado, 0), 0)) AS saldo_pendiente
        FROM cobros_mensuales c
        INNER JOIN periodos p ON p.id_periodo = c.id_periodo
        INNER JOIN periodos p_actual ON p_actual.id_periodo = :id_periodo_actual
        INNER JOIN cobros_mensuales_detalle cd ON cd.id_cobro = c.id_cobro
        LEFT JOIN (
            SELECT
                pd.id_cobro_detalle,
                SUM(CASE WHEN pg.estado = 'REGISTRADO' THEN pd.monto_aplicado ELSE 0 END) AS pagado
            FROM pagos_detalle pd
            INNER JOIN pagos pg ON pg.id_pago = pd.id_pago
            GROUP BY pd.id_cobro_detalle
        ) x ON x.id_cobro_detalle = cd.id_cobro_detalle
        WHERE c.id_persona = :id_persona
          AND c.id_unidad = :id_unidad
          AND c.estado_pago <> 'ANULADO'
          AND p.fecha_inicio < p_actual.fecha_inicio
        GROUP BY c.id_periodo, p.anio, p.mes
        HAVING saldo_pendiente > 0
        ORDER BY p.anio, p.mes
    ");
    $stmt->execute([
        'id_periodo_actual' => $idPeriodo,
        'id_persona' => $idPersona,
        'id_unidad' => $idUnidad,
    ]);

    $periodos = [];
    $total = 0.0;
    foreach ($stmt->fetchAll() as $row) {
        $saldo = round((float) $row['saldo_pendiente'], 2);
        $periodos[] = [
            'id_periodo' => (int) $row['id_periodo'],
            'anio' => (int) $row['anio'],
            'mes' => (int) $row['mes'],
            'saldo_pendiente' => $saldo,
        ];
        $total += $saldo;
    }

    jsonResponse([
        'ok' => true,
        'data' => [
            'id_persona' => $idPersona,
            'id_unidad' => $idUnidad,
            'id_periodo_actual' => $idPeriodo,
            'deuda_anterior_total' => round($total, 2),
            'periodos' => $periodos,
        ],
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}