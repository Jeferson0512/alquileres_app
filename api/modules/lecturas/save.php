<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);
    assertPeriodoEditable($pdo, $periodoId);
    $items = getJsonBody()['items'] ?? [];

    if (!is_array($items) || empty($items)) {
        jsonResponse(['ok' => false, 'message' => 'No se recibieron lecturas'], 422);
    }

    $sql = "UPDATE lecturas_unidad SET lectura_actual = :lectura_actual, updated_at = NOW() WHERE id_lectura = :id_lectura AND id_periodo = :id_periodo";
    $stmt = $pdo->prepare($sql);

    $pdo->beginTransaction();

    foreach ($items as $item) {
        $stmt->execute([
            'lectura_actual' => (float) ($item['lectura_actual'] ?? 0),
            'id_lectura' => (int) ($item['id_lectura'] ?? 0),
            'id_periodo' => $periodoId,
        ]);
    }

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'message' => 'Lecturas guardadas correctamente'
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
