<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();

    $stmt = $pdo->query("
        SELECT
            id_periodo,
            anio,
            mes,
            fecha_inicio,
            fecha_fin,
            estado,
            observacion
        FROM periodos
        ORDER BY anio DESC, mes DESC
    ");

    jsonResponse([
        'ok'   => true,
        'data' => $stmt->fetchAll(),
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok'      => false,
        'message' => $e->getMessage(),
    ], 500);
}
