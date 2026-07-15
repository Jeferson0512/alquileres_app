<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $stmt = $pdo->query("
            SELECT
                m.*,
                ut.codigo_unidad AS codigo_unidad_titular,
                ud.codigo_unidad AS codigo_unidad_dependiente
            FROM unidades_medidor_compartido m
            INNER JOIN unidades ut ON ut.id_unidad = m.id_unidad_titular
            INNER JOIN unidades ud ON ud.id_unidad = m.id_unidad_dependiente
            ORDER BY m.id_relacion DESC
        ");
        jsonResponse(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        $body = getJsonBody();
        $idTitular = (int) ($body['id_unidad_titular'] ?? 0);
        $idDependiente = (int) ($body['id_unidad_dependiente'] ?? 0);
        $porcentaje = (float) ($body['porcentaje_dependiente'] ?? 0);
        $activo = isset($body['activo']) ? (int) (bool) $body['activo'] : 1;
        $observacion = isset($body['observacion']) ? trim((string) $body['observacion']) : null;

        if ($idTitular <= 0 || $idDependiente <= 0 || $idTitular === $idDependiente) {
            jsonResponse(['ok' => false, 'message' => 'id_unidad_titular e id_unidad_dependiente son obligatorios y deben ser distintos'], 422);
        }

        if ($porcentaje < 0 || $porcentaje > 100) {
            jsonResponse(['ok' => false, 'message' => 'porcentaje_dependiente debe estar entre 0 y 100'], 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO unidades_medidor_compartido (id_unidad_titular, id_unidad_dependiente, porcentaje_dependiente, activo, observacion)
            VALUES (:titular, :dependiente, :pct, :activo, :obs)
            ON DUPLICATE KEY UPDATE
                id_unidad_titular = :titular2,
                porcentaje_dependiente = :pct2,
                activo = :activo2,
                observacion = :obs2,
                updated_at = NOW()
        ");
        $stmt->execute([
            'titular' => $idTitular,
            'dependiente' => $idDependiente,
            'pct' => round($porcentaje, 2),
            'activo' => $activo,
            'obs' => $observacion,
            'titular2' => $idTitular,
            'pct2' => round($porcentaje, 2),
            'activo2' => $activo,
            'obs2' => $observacion,
        ]);

        jsonResponse(['ok' => true, 'message' => 'Relación de medidor compartido guardada']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'Id requerido'], 422);
        }
        $pdo->prepare("DELETE FROM unidades_medidor_compartido WHERE id_relacion = :id")->execute(['id' => $id]);
        jsonResponse(['ok' => true, 'message' => 'Relación eliminada']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
