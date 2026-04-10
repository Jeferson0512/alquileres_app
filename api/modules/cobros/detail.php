<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../pagos/common.php';

try {
    $pdo = Database::getConnection();

    $idCobro = isset($_GET['id_cobro']) ? (int) $_GET['id_cobro'] : 0;
    if ($idCobro <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id_cobro es obligatorio'], 422);
    }

    // Modo compatible: devuelve cabecera de cobro aunque no exista detalle por concepto.
    if (!pagosDetalleSchemaDisponible($pdo)) {
        $stmt = $pdo->prepare(" 
            SELECT
                c.id_cobro,
                c.id_periodo,
                p.anio,
                p.mes,
                c.id_persona,
                c.id_unidad,
                u.codigo_unidad,
                u.nombre_unidad,
                CONCAT(pr.nombres, ' ', pr.apellidos) AS inquilino,
                c.total_cobrar,
                IFNULL((SELECT SUM(pg.monto_pagado) FROM pagos pg WHERE pg.id_cobro = c.id_cobro), 0) AS total_pagado,
                GREATEST(c.total_cobrar - IFNULL((SELECT SUM(pg.monto_pagado) FROM pagos pg WHERE pg.id_cobro = c.id_cobro), 0), 0) AS saldo_pendiente,
                c.estado_pago,
                c.fecha_vencimiento,
                c.observacion
            FROM cobros_mensuales c
            INNER JOIN periodos p ON p.id_periodo = c.id_periodo
            INNER JOIN unidades u ON u.id_unidad = c.id_unidad
            INNER JOIN personas pr ON pr.id_persona = c.id_persona
            WHERE c.id_cobro = :id
            LIMIT 1
        ");
        $stmt->execute(['id' => $idCobro]);
        $header = $stmt->fetch();

        if (!$header) {
            jsonResponse(['ok' => false, 'message' => 'Cobro no encontrado'], 404);
        }

        jsonResponse([
            'ok' => true,
            'data' => [
                'id_cobro' => (int) $header['id_cobro'],
                'id_periodo' => (int) $header['id_periodo'],
                'periodo' => [
                    'anio' => (int) $header['anio'],
                    'mes' => (int) $header['mes'],
                ],
                'id_persona' => (int) $header['id_persona'],
                'id_unidad' => (int) $header['id_unidad'],
                'codigo_unidad' => $header['codigo_unidad'],
                'nombre_unidad' => $header['nombre_unidad'],
                'inquilino' => $header['inquilino'],
                'total_cobrar' => (float) $header['total_cobrar'],
                'total_pagado' => (float) $header['total_pagado'],
                'saldo_pendiente' => (float) $header['saldo_pendiente'],
                'estado_pago' => $header['estado_pago'],
                'fecha_vencimiento' => $header['fecha_vencimiento'],
                'observacion' => $header['observacion'],
                'conceptos' => [],
                'compat_mode' => true,
            ],
        ]);
    }

    $header = getCobroHeader($pdo, $idCobro);
    $conceptos = getCobroConceptos($pdo, $idCobro);

    $totalPagado = 0.0;
    $saldoPendiente = 0.0;
    foreach ($conceptos as &$concepto) {
        $concepto['id_cobro_detalle'] = (int) $concepto['id_cobro_detalle'];
        $concepto['permite_pago_directo'] = (int) $concepto['permite_pago_directo'] === 1;
        $concepto['monto_programado'] = (float) $concepto['monto_programado'];
        $concepto['monto_pagado'] = (float) $concepto['monto_pagado'];
        $concepto['saldo_pendiente'] = (float) $concepto['saldo_pendiente'];
        $totalPagado += $concepto['monto_pagado'];
        $saldoPendiente += $concepto['saldo_pendiente'];
    }
    unset($concepto);

    jsonResponse([
        'ok' => true,
        'data' => [
            'id_cobro' => (int) $header['id_cobro'],
            'id_periodo' => (int) $header['id_periodo'],
            'periodo' => [
                'anio' => (int) $header['anio'],
                'mes' => (int) $header['mes'],
            ],
            'id_persona' => (int) $header['id_persona'],
            'id_unidad' => (int) $header['id_unidad'],
            'codigo_unidad' => $header['codigo_unidad'],
            'nombre_unidad' => $header['nombre_unidad'],
            'inquilino' => $header['inquilino'],
            'total_cobrar' => (float) $header['total_cobrar'],
            'total_pagado' => round($totalPagado, 2),
            'saldo_pendiente' => round($saldoPendiente, 2),
            'estado_pago' => $header['estado_pago'],
            'fecha_vencimiento' => $header['fecha_vencimiento'],
            'observacion' => $header['observacion'],
            'conceptos' => $conceptos,
        ],
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}