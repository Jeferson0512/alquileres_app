<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo    = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $id_inmueble = isset($_GET['id_inmueble']) ? (int) $_GET['id_inmueble'] : 1;

        $stmt = $pdo->prepare("
            SELECT id_tarifa, id_inmueble, servicio, descripcion,
                   monto, por_unidad, activo
            FROM tarifas_servicios
            WHERE id_inmueble = :id_inmueble
            ORDER BY id_tarifa
        ");
        $stmt->execute(['id_inmueble' => $id_inmueble]);

        jsonResponse(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if (!$id) jsonResponse(['ok' => false, 'message' => 'ID requerido'], 400);

        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $fields = [];
        $params = ['id' => $id];

        if (isset($body['descripcion'])) {
            $fields[] = 'descripcion = :descripcion';
            $params['descripcion'] = trim($body['descripcion']);
        }
        if (isset($body['monto'])) {
            $monto = (float) $body['monto'];
            if ($monto < 0) jsonResponse(['ok' => false, 'message' => 'El monto no puede ser negativo'], 422);
            $fields[] = 'monto = :monto';
            $params['monto'] = round($monto, 2);
        }
        if (isset($body['activo'])) {
            $fields[] = 'activo = :activo';
            $params['activo'] = (int)(bool) $body['activo'];
        }

        if (!$fields) jsonResponse(['ok' => false, 'message' => 'Sin campos a actualizar'], 400);

        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE tarifas_servicios SET ' . implode(', ', $fields) . ' WHERE id_tarifa = :id';
        $pdo->prepare($sql)->execute($params);

        jsonResponse(['ok' => true, 'message' => 'Tarifa actualizada correctamente']);
    }

    jsonResponse(['ok' => false, 'message' => 'Método no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
