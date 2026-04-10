<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

function valueOrNull(array $data, string $key): ?string
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
            $stmt = $pdo->prepare("SELECT * FROM personas WHERE id_persona = :id AND tipo_persona = 'INQUILINO' LIMIT 1");
            $stmt->execute(['id' => $id]);
            $row = $stmt->fetch();

            if (!$row) {
                jsonResponse(['ok' => false, 'message' => 'Inquilino no encontrado'], 404);
            }

            jsonResponse(['ok' => true, 'data' => $row]);
        }

        $q = trim((string) ($_GET['q'] ?? ''));

        $sql = "
            SELECT
                id_persona,
                nombres,
                apellidos,
                tipo_documento,
                numero_documento,
                celular,
                email,
                direccion,
                observacion,
                estado,
                created_at,
                updated_at
            FROM personas
            WHERE tipo_persona = 'INQUILINO'
        ";

        $params = [];
        if ($q !== '') {
            $sql .= " AND (nombres LIKE :q OR apellidos LIKE :q OR numero_documento LIKE :q)";
            $params['q'] = "%{$q}%";
        }

        $sql .= ' ORDER BY apellidos, nombres';

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        jsonResponse(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();

        $nombres = trim((string) ($body['nombres'] ?? ''));
        $apellidos = trim((string) ($body['apellidos'] ?? ''));

        if ($nombres === '' || $apellidos === '') {
            jsonResponse(['ok' => false, 'message' => 'nombres y apellidos son obligatorios'], 422);
        }

        $stmt = $pdo->prepare(" 
            INSERT INTO personas (
                tipo_persona,
                nombres,
                apellidos,
                tipo_documento,
                numero_documento,
                celular,
                email,
                direccion,
                observacion,
                estado
            ) VALUES (
                'INQUILINO',
                :nombres,
                :apellidos,
                :tipo_documento,
                :numero_documento,
                :celular,
                :email,
                :direccion,
                :observacion,
                :estado
            )
        ");

        $stmt->execute([
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'tipo_documento' => valueOrNull($body, 'tipo_documento'),
            'numero_documento' => valueOrNull($body, 'numero_documento'),
            'celular' => valueOrNull($body, 'celular'),
            'email' => valueOrNull($body, 'email'),
            'direccion' => valueOrNull($body, 'direccion'),
            'observacion' => valueOrNull($body, 'observacion'),
            'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'INACTIVO'], true) ? $body['estado'] : 'ACTIVO',
        ]);

        jsonResponse([
            'ok' => true,
            'message' => 'Inquilino creado correctamente',
            'data' => ['id_persona' => (int) $pdo->lastInsertId()]
        ], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $body = getJsonBody();

        $nombres = trim((string) ($body['nombres'] ?? ''));
        $apellidos = trim((string) ($body['apellidos'] ?? ''));
        if ($nombres === '' || $apellidos === '') {
            jsonResponse(['ok' => false, 'message' => 'nombres y apellidos son obligatorios'], 422);
        }

        $stmt = $pdo->prepare(" 
            UPDATE personas
            SET
                nombres = :nombres,
                apellidos = :apellidos,
                tipo_documento = :tipo_documento,
                numero_documento = :numero_documento,
                celular = :celular,
                email = :email,
                direccion = :direccion,
                observacion = :observacion,
                estado = :estado,
                updated_at = NOW()
            WHERE id_persona = :id
              AND tipo_persona = 'INQUILINO'
        ");

        $stmt->execute([
            'id' => $id,
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'tipo_documento' => valueOrNull($body, 'tipo_documento'),
            'numero_documento' => valueOrNull($body, 'numero_documento'),
            'celular' => valueOrNull($body, 'celular'),
            'email' => valueOrNull($body, 'email'),
            'direccion' => valueOrNull($body, 'direccion'),
            'observacion' => valueOrNull($body, 'observacion'),
            'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'INACTIVO'], true) ? $body['estado'] : 'ACTIVO',
        ]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'message' => 'Inquilino no encontrado o sin cambios'], 404);
        }

        jsonResponse(['ok' => true, 'message' => 'Inquilino actualizado correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $stmt = $pdo->prepare(" 
            UPDATE personas
            SET estado = 'INACTIVO', updated_at = NOW()
            WHERE id_persona = :id
              AND tipo_persona = 'INQUILINO'
        ");
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'message' => 'Inquilino no encontrado'], 404);
        }

        jsonResponse(['ok' => true, 'message' => 'Inquilino desactivado correctamente']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
