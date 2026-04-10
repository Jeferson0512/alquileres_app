<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/common.php';

try {
    $pdo = Database::getConnection();
    requireDetalleSchema($pdo);

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'GET') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $idPago = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($idPago <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
    }

    $stmt = $pdo->prepare(" 
        SELECT
            id_pago_auditoria,
            id_pago,
            accion,
            actor,
            payload_before,
            payload_after,
            created_at
        FROM pagos_auditoria
        WHERE id_pago = :id
        ORDER BY created_at ASC, id_pago_auditoria ASC
    ");
    $stmt->execute(['id' => $idPago]);

    $data = [];
    foreach ($stmt->fetchAll() as $row) {
        $data[] = [
            'id_pago_auditoria' => (int) $row['id_pago_auditoria'],
            'id_pago' => (int) $row['id_pago'],
            'accion' => $row['accion'],
            'actor' => $row['actor'],
            'payload_before' => $row['payload_before'] ? json_decode((string) $row['payload_before'], true) : null,
            'payload_after' => $row['payload_after'] ? json_decode((string) $row['payload_after'], true) : null,
            'created_at' => $row['created_at'],
        ];
    }

    jsonResponse(['ok' => true, 'data' => $data]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}