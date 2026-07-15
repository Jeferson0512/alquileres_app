<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $periodoId = getPeriodoId($pdo);

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM cobros_overrides_servicio WHERE id_periodo = :p");
        $stmt->execute(['p' => $periodoId]);
        jsonResponse(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        assertPeriodoEditable($pdo, $periodoId);
        $body = getJsonBody();
        $idUnidad = (int) ($body['id_unidad'] ?? 0);
        $idPersona = (int) ($body['id_persona'] ?? 0);
        $servicio = $body['servicio'] ?? '';
        $monto = (float) ($body['monto'] ?? 0);
        $observacion = isset($body['observacion']) ? trim((string) $body['observacion']) : null;

        if ($idUnidad <= 0 || $idPersona <= 0 || !in_array($servicio, ['AGUA', 'GAS', 'MANTENIMIENTO'], true)) {
            jsonResponse(['ok' => false, 'message' => 'Datos inválidos'], 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO cobros_overrides_servicio (id_periodo, id_unidad, id_persona, servicio, monto, observacion)
            VALUES (:p, :u, :per, :s, :m, :obs)
            ON DUPLICATE KEY UPDATE monto = :m2, observacion = :obs2, updated_at = NOW()
        ");
        $stmt->execute([
            'p' => $periodoId,
            'u' => $idUnidad,
            'per' => $idPersona,
            's' => $servicio,
            'm' => round($monto, 2),
            'obs' => $observacion,
            'm2' => round($monto, 2),
            'obs2' => $observacion,
        ]);

        jsonResponse(['ok' => true, 'message' => 'Override guardado']);
    }

    if ($method === 'DELETE') {
        assertPeriodoEditable($pdo, $periodoId);
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'Id requerido'], 422);
        }
        $pdo->prepare("DELETE FROM cobros_overrides_servicio WHERE id_override = :id AND id_periodo = :p")
            ->execute(['id' => $id, 'p' => $periodoId]);
        jsonResponse(['ok' => true, 'message' => 'Override eliminado']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
