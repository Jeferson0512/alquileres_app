<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

function nullableText(array $data, string $key): ?string
{
    if (!array_key_exists($key, $data)) {
        return null;
    }

    $value = trim((string) $data[$key]);
    return $value === '' ? null : $value;
}

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($id > 0) {
            $stmt = $pdo->prepare(" 
                SELECT
                    o.*,
                    u.codigo_unidad,
                    u.nombre_unidad,
                    CONCAT(p.nombres, ' ', p.apellidos) AS inquilino
                FROM ocupacion_unidad o
                INNER JOIN unidades u ON u.id_unidad = o.id_unidad
                INNER JOIN personas p ON p.id_persona = o.id_persona
                WHERE o.id_ocupacion = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $id]);
            $row = $stmt->fetch();

            if (!$row) {
                jsonResponse(['ok' => false, 'message' => 'Ocupacion no encontrada'], 404);
            }

            jsonResponse(['ok' => true, 'data' => $row]);
        }

        $estado = trim((string) ($_GET['estado'] ?? ''));

        $sql = "
            SELECT
                o.id_ocupacion,
                o.id_unidad,
                o.id_persona,
                o.fecha_inicio,
                o.fecha_fin,
                o.monto_alquiler,
                o.garantia,
                o.estado,
                o.observacion,
                u.codigo_unidad,
                u.nombre_unidad,
                CONCAT(p.nombres, ' ', p.apellidos) AS inquilino
            FROM ocupacion_unidad o
            INNER JOIN unidades u ON u.id_unidad = o.id_unidad
            INNER JOIN personas p ON p.id_persona = o.id_persona
            WHERE 1 = 1
        ";

        $params = [];
        if ($estado !== '' && in_array($estado, ['ACTIVO', 'FINALIZADO', 'ANULADO'], true)) {
            $sql .= ' AND o.estado = :estado';
            $params['estado'] = $estado;
        }

        $sql .= ' ORDER BY o.fecha_inicio DESC, o.id_ocupacion DESC';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        jsonResponse(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();

        $idUnidad = (int) ($body['id_unidad'] ?? 0);
        $idPersona = (int) ($body['id_persona'] ?? 0);
        $fechaInicio = trim((string) ($body['fecha_inicio'] ?? ''));

        if ($idUnidad <= 0 || $idPersona <= 0 || $fechaInicio === '') {
            jsonResponse(['ok' => false, 'message' => 'id_unidad, id_persona y fecha_inicio son obligatorios'], 422);
        }

        $stmtActivo = $pdo->prepare(" 
            SELECT id_ocupacion
            FROM ocupacion_unidad
            WHERE id_unidad = :id_unidad
              AND estado = 'ACTIVO'
            LIMIT 1
        ");
        $stmtActivo->execute(['id_unidad' => $idUnidad]);

        if ($stmtActivo->fetch()) {
            jsonResponse(['ok' => false, 'message' => 'La unidad ya tiene una ocupacion activa'], 409);
        }

        $stmt = $pdo->prepare(" 
            INSERT INTO ocupacion_unidad (
                id_unidad,
                id_persona,
                fecha_inicio,
                fecha_fin,
                monto_alquiler,
                garantia,
                estado,
                observacion
            ) VALUES (
                :id_unidad,
                :id_persona,
                :fecha_inicio,
                :fecha_fin,
                :monto_alquiler,
                :garantia,
                :estado,
                :observacion
            )
        ");

        $stmt->execute([
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => nullableText($body, 'fecha_fin'),
            'monto_alquiler' => (float) ($body['monto_alquiler'] ?? 0),
            'garantia' => (float) ($body['garantia'] ?? 0),
            'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'FINALIZADO', 'ANULADO'], true) ? $body['estado'] : 'ACTIVO',
            'observacion' => nullableText($body, 'observacion'),
        ]);

        jsonResponse([
            'ok' => true,
            'message' => 'Ocupacion creada correctamente',
            'data' => ['id_ocupacion' => (int) $pdo->lastInsertId()],
        ], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $body = getJsonBody();

        $idUnidad = (int) ($body['id_unidad'] ?? 0);
        $idPersona = (int) ($body['id_persona'] ?? 0);
        $fechaInicio = trim((string) ($body['fecha_inicio'] ?? ''));

        if ($idUnidad <= 0 || $idPersona <= 0 || $fechaInicio === '') {
            jsonResponse(['ok' => false, 'message' => 'id_unidad, id_persona y fecha_inicio son obligatorios'], 422);
        }

        $stmtActivo = $pdo->prepare(" 
            SELECT id_ocupacion
            FROM ocupacion_unidad
            WHERE id_unidad = :id_unidad
              AND estado = 'ACTIVO'
              AND id_ocupacion <> :id
            LIMIT 1
        ");
        $stmtActivo->execute([
            'id_unidad' => $idUnidad,
            'id' => $id,
        ]);

        if ($stmtActivo->fetch()) {
            jsonResponse(['ok' => false, 'message' => 'La unidad ya tiene otra ocupacion activa'], 409);
        }

        $stmt = $pdo->prepare(" 
            UPDATE ocupacion_unidad
            SET
                id_unidad = :id_unidad,
                id_persona = :id_persona,
                fecha_inicio = :fecha_inicio,
                fecha_fin = :fecha_fin,
                monto_alquiler = :monto_alquiler,
                garantia = :garantia,
                estado = :estado,
                observacion = :observacion,
                updated_at = NOW()
            WHERE id_ocupacion = :id
        ");

        $stmt->execute([
            'id' => $id,
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => nullableText($body, 'fecha_fin'),
            'monto_alquiler' => (float) ($body['monto_alquiler'] ?? 0),
            'garantia' => (float) ($body['garantia'] ?? 0),
            'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'FINALIZADO', 'ANULADO'], true) ? $body['estado'] : 'ACTIVO',
            'observacion' => nullableText($body, 'observacion'),
        ]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'message' => 'Ocupacion no encontrada o sin cambios'], 404);
        }

        jsonResponse(['ok' => true, 'message' => 'Ocupacion actualizada correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $stmt = $pdo->prepare(" 
            UPDATE ocupacion_unidad
            SET
                estado = 'FINALIZADO',
                fecha_fin = COALESCE(fecha_fin, CURDATE()),
                updated_at = NOW()
            WHERE id_ocupacion = :id
        ");
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'message' => 'Ocupacion no encontrada'], 404);
        }

        jsonResponse(['ok' => true, 'message' => 'Ocupacion finalizada correctamente']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
