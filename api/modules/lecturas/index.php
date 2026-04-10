<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);
    $periodo = getPeriodoRow($pdo, $periodoId);

    $sql = "
        SELECT
            l.id_lectura,
            u.id_unidad,
            u.codigo_unidad,
            u.nombre_unidad,
            u.piso,
            l.lectura_anterior,
            l.lectura_actual,
            ROUND(GREATEST(l.lectura_actual - l.lectura_anterior, 0), 2) AS consumo,
                        (
                                SELECT lp.lectura_actual
                                FROM lecturas_unidad lp
                                INNER JOIN periodos pp ON pp.id_periodo = lp.id_periodo
                                WHERE lp.id_unidad = u.id_unidad
                                    AND pp.fecha_fin < :fechaInicio
                                ORDER BY pp.fecha_fin DESC, lp.id_lectura DESC
                                LIMIT 1
                        ) AS lectura_referencia_anterior,
            CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) AS inquilino,
            o.monto_alquiler
        FROM lecturas_unidad l
        INNER JOIN unidades u ON u.id_unidad = l.id_unidad
        LEFT JOIN ocupacion_unidad o ON o.id_ocupacion = l.id_ocupacion
        LEFT JOIN personas p ON p.id_persona = o.id_persona
        WHERE l.id_periodo = :periodoId
        ORDER BY u.codigo_unidad
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'periodoId' => $periodoId,
        'fechaInicio' => $periodo['fecha_inicio'],
    ]);

    $rows = array_map(function ($row) {
        $referencia = $row['lectura_referencia_anterior'];
        $auditoriaEstado = 'SIN_HISTORICO';

        if ($referencia !== null) {
            $actual = round((float) $row['lectura_anterior'], 2);
            $esperado = round((float) $referencia, 2);
            $auditoriaEstado = abs($actual - $esperado) < 0.01 ? 'OK' : 'REVISAR';
        }

        $row['lectura_referencia_anterior'] = $referencia !== null ? round((float) $referencia, 2) : null;
        $row['auditoria_lectura_anterior'] = $auditoriaEstado;
        return $row;
    }, $stmt->fetchAll());

    jsonResponse([
        'ok' => true,
        'data' => $rows
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
