<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'POST') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
    $isLocal = in_array($remoteAddr, ['127.0.0.1', '::1', ''], true);
    if (!$isLocal) {
        jsonResponse(['ok' => false, 'message' => 'Solo disponible en localhost'], 403);
    }

    $body = getJsonBody();
    $marker = trim((string) ($body['marker'] ?? ''));
    $idPersona = (int) ($body['id_persona'] ?? 0);
    $idUnidad = (int) ($body['id_unidad'] ?? 0);
    $idOcupacion = (int) ($body['id_ocupacion'] ?? 0);

    if ($marker === '' || strpos($marker, 'E2E_') !== 0 || $idPersona <= 0 || $idUnidad <= 0) {
        jsonResponse(['ok' => false, 'message' => 'Payload E2E invalido'], 422);
    }

    $pdo = Database::getConnection();
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id_cobro FROM cobros_mensuales WHERE id_persona = :id_persona OR id_unidad = :id_unidad');
    $stmt->execute(['id_persona' => $idPersona, 'id_unidad' => $idUnidad]);
    $cobroIds = array_map(static fn(array $row): int => (int) $row['id_cobro'], $stmt->fetchAll());

    if ($cobroIds !== []) {
        $inCobros = implode(',', array_fill(0, count($cobroIds), '?'));

        $stmt = $pdo->prepare("SELECT id_pago FROM pagos WHERE id_cobro IN ($inCobros)");
        $stmt->execute($cobroIds);
        $pagoIds = array_map(static fn(array $row): int => (int) $row['id_pago'], $stmt->fetchAll());

        if ($pagoIds !== []) {
            $inPagos = implode(',', array_fill(0, count($pagoIds), '?'));

            $stmt = $pdo->prepare("DELETE FROM pagos_detalle WHERE id_pago IN ($inPagos)");
            $stmt->execute($pagoIds);

            $stmt = $pdo->prepare("DELETE FROM pagos_auditoria WHERE id_pago IN ($inPagos)");
            $stmt->execute($pagoIds);
        }

        $stmt = $pdo->prepare("DELETE FROM pagos WHERE id_cobro IN ($inCobros)");
        $stmt->execute($cobroIds);

        $stmt = $pdo->prepare("DELETE FROM cobros_mensuales_detalle WHERE id_cobro IN ($inCobros)");
        $stmt->execute($cobroIds);

        $stmt = $pdo->prepare("DELETE FROM cobros_mensuales WHERE id_cobro IN ($inCobros)");
        $stmt->execute($cobroIds);
    }

    $stmt = $pdo->prepare('DELETE FROM liquidacion_luz_detalle WHERE id_persona = :id_persona OR id_unidad = :id_unidad');
    $stmt->execute(['id_persona' => $idPersona, 'id_unidad' => $idUnidad]);

    if ($idOcupacion > 0) {
        $stmt = $pdo->prepare('DELETE FROM lecturas_unidad WHERE id_ocupacion = :id_ocupacion');
        $stmt->execute(['id_ocupacion' => $idOcupacion]);
    }

    $stmt = $pdo->prepare('DELETE FROM ocupacion_unidad WHERE id_ocupacion = :id_ocupacion OR id_persona = :id_persona OR id_unidad = :id_unidad');
    $stmt->execute([
        'id_ocupacion' => $idOcupacion,
        'id_persona' => $idPersona,
        'id_unidad' => $idUnidad,
    ]);

    $stmt = $pdo->prepare('DELETE FROM unidades WHERE id_unidad = :id_unidad');
    $stmt->execute(['id_unidad' => $idUnidad]);

    $stmt = $pdo->prepare(" 
        DELETE FROM personas
        WHERE id_persona = :id_persona
          AND tipo_persona = 'INQUILINO'
    ");
    $stmt->execute(['id_persona' => $idPersona]);

    $pdo->commit();

    jsonResponse(['ok' => true, 'message' => 'Limpieza E2E completada']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
