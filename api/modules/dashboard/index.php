<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);

    $sql = "
        SELECT
            (SELECT COUNT(*) FROM ocupacion_unidad WHERE estado = 'ACTIVO') AS total_ocupados,
            (SELECT IFNULL(SUM(monto_alquiler),0) FROM ocupacion_unidad WHERE estado = 'ACTIVO') AS total_alquiler,
            (SELECT IFNULL(SUM(total_pagar_luz),0) FROM liquidacion_luz_detalle WHERE id_periodo = :periodoIdLuz AND estado <> 'ANULADO') AS total_luz,
            (SELECT IFNULL(SUM(total_cobrar),0) FROM cobros_mensuales WHERE id_periodo = :periodoIdCobro AND estado_pago <> 'ANULADO') AS total_cobrar
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'periodoIdLuz' => $periodoId,
        'periodoIdCobro' => $periodoId,
    ]);
    $data = $stmt->fetch();

    jsonResponse([
        'ok' => true,
        'data' => $data
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
