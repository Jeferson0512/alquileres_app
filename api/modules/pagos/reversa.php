<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/common.php';

try {
    $pdo = Database::getConnection();
    requireDetalleSchema($pdo);

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'POST') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $idPago = isset($_GET['id']) ? (int) $_GET['id'] : 0;
    if ($idPago <= 0) {
        jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
    }

    $body = getJsonBody();
    $motivoReversa = trim((string) ($body['motivo_reversa'] ?? ''));
    $reversadoPor = trim((string) ($body['reversado_por'] ?? ''));
    $fechaReversa = trim((string) ($body['fecha_reversa'] ?? ''));

    if ($motivoReversa === '' || $reversadoPor === '' || $fechaReversa === '') {
        jsonResponse(['ok' => false, 'message' => 'motivo_reversa, reversado_por y fecha_reversa son obligatorios'], 422);
    }

    $before = getPagoSnapshot($pdo, $idPago);
    if (($before['estado'] ?? 'REGISTRADO') !== 'REGISTRADO') {
        jsonResponse(['ok' => false, 'message' => 'Solo se puede reversar un pago en estado REGISTRADO'], 409);
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare(" 
        UPDATE pagos
        SET
            estado = 'REVERSADO',
            reversado_por = :reversado_por,
            fecha_reversa = :fecha_reversa,
            motivo_reversa = :motivo_reversa,
            updated_at = NOW()
        WHERE id_pago = :id
    ");
    $stmt->execute([
        'id' => $idPago,
        'reversado_por' => $reversadoPor,
        'fecha_reversa' => $fechaReversa,
        'motivo_reversa' => $motivoReversa,
    ]);

    syncCobroStatus($pdo, (int) $before['id_cobro']);

    $after = getPagoSnapshot($pdo, $idPago);
    createPagoAudit($pdo, $idPago, 'REVERSADO', $reversadoPor, $before, $after);

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'message' => 'Pago reversado correctamente',
        'data' => [
            'id_pago' => $idPago,
            'estado' => $after['estado'],
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