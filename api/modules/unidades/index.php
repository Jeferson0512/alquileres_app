<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

function strOrNull(array $data, string $key): ?string
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
            $stmt = $pdo->prepare('SELECT * FROM unidades WHERE id_unidad = :id LIMIT 1');
            $stmt->execute(['id' => $id]);
            $row = $stmt->fetch();

            if (!$row) {
                jsonResponse(['ok' => false, 'message' => 'Unidad no encontrada'], 404);
            }

            jsonResponse(['ok' => true, 'data' => $row]);
        }

        $stmt = $pdo->query(" 
            SELECT
                id_unidad,
                id_inmueble,
                codigo_unidad,
                nombre_unidad,
                piso,
                tipo_unidad,
                tiene_medidor,
                medidor_codigo,
                tarifa_alquiler_base,
                observacion,
                estado,
                created_at,
                updated_at
            FROM unidades
            ORDER BY piso ASC, codigo_unidad ASC
        ");

        jsonResponse(['ok' => true, 'data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();

        $idInmueble = (int) ($body['id_inmueble'] ?? 0);
        $codigoUnidad = trim((string) ($body['codigo_unidad'] ?? ''));
        $nombreUnidad = trim((string) ($body['nombre_unidad'] ?? ''));
        $piso = (int) ($body['piso'] ?? 0);

        if ($idInmueble <= 0 || $codigoUnidad === '' || $nombreUnidad === '') {
            jsonResponse(['ok' => false, 'message' => 'id_inmueble, codigo_unidad y nombre_unidad son obligatorios'], 422);
        }

        $stmt = $pdo->prepare(" 
            INSERT INTO unidades (
                id_inmueble,
                codigo_unidad,
                nombre_unidad,
                piso,
                tipo_unidad,
                tiene_medidor,
                medidor_codigo,
                tarifa_alquiler_base,
                observacion,
                estado
            ) VALUES (
                :id_inmueble,
                :codigo_unidad,
                :nombre_unidad,
                :piso,
                :tipo_unidad,
                :tiene_medidor,
                :medidor_codigo,
                :tarifa_alquiler_base,
                :observacion,
                :estado
            )
        ");

        $stmt->execute([
            'id_inmueble' => $idInmueble,
            'codigo_unidad' => $codigoUnidad,
            'nombre_unidad' => $nombreUnidad,
            'piso' => $piso,
            'tipo_unidad' => in_array(($body['tipo_unidad'] ?? 'CUARTO'), ['CUARTO', 'MINI_DPTO', 'DEPARTAMENTO', 'LOCAL', 'DEPOSITO', 'AREA_COMUN', 'MEDIDOR_GENERAL', 'OTRO'], true) ? $body['tipo_unidad'] : 'CUARTO',
            'tiene_medidor' => in_array(($body['tiene_medidor'] ?? 'SI'), ['SI', 'NO'], true) ? $body['tiene_medidor'] : 'SI',
            'medidor_codigo' => strOrNull($body, 'medidor_codigo'),
            'tarifa_alquiler_base' => (float) ($body['tarifa_alquiler_base'] ?? 0),
            'observacion' => strOrNull($body, 'observacion'),
            'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'INACTIVO'], true) ? $body['estado'] : 'ACTIVO',
        ]);

        jsonResponse([
            'ok' => true,
            'message' => 'Unidad creada correctamente',
            'data' => ['id_unidad' => (int) $pdo->lastInsertId()],
        ], 201);
    }

    if ($method === 'PUT' || $method === 'PATCH') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $body = getJsonBody();

        $idInmueble = (int) ($body['id_inmueble'] ?? 0);
        $codigoUnidad = trim((string) ($body['codigo_unidad'] ?? ''));
        $nombreUnidad = trim((string) ($body['nombre_unidad'] ?? ''));
        $piso = (int) ($body['piso'] ?? 0);

        if ($idInmueble <= 0 || $codigoUnidad === '' || $nombreUnidad === '') {
            jsonResponse(['ok' => false, 'message' => 'id_inmueble, codigo_unidad y nombre_unidad son obligatorios'], 422);
        }

        $stmt = $pdo->prepare(" 
            UPDATE unidades
            SET
                id_inmueble = :id_inmueble,
                codigo_unidad = :codigo_unidad,
                nombre_unidad = :nombre_unidad,
                piso = :piso,
                tipo_unidad = :tipo_unidad,
                tiene_medidor = :tiene_medidor,
                medidor_codigo = :medidor_codigo,
                tarifa_alquiler_base = :tarifa_alquiler_base,
                observacion = :observacion,
                estado = :estado,
                updated_at = NOW()
            WHERE id_unidad = :id
        ");

        $stmt->execute([
            'id' => $id,
            'id_inmueble' => $idInmueble,
            'codigo_unidad' => $codigoUnidad,
            'nombre_unidad' => $nombreUnidad,
            'piso' => $piso,
            'tipo_unidad' => in_array(($body['tipo_unidad'] ?? 'CUARTO'), ['CUARTO', 'MINI_DPTO', 'DEPARTAMENTO', 'LOCAL', 'DEPOSITO', 'AREA_COMUN', 'MEDIDOR_GENERAL', 'OTRO'], true) ? $body['tipo_unidad'] : 'CUARTO',
            'tiene_medidor' => in_array(($body['tiene_medidor'] ?? 'SI'), ['SI', 'NO'], true) ? $body['tiene_medidor'] : 'SI',
            'medidor_codigo' => strOrNull($body, 'medidor_codigo'),
            'tarifa_alquiler_base' => (float) ($body['tarifa_alquiler_base'] ?? 0),
            'observacion' => strOrNull($body, 'observacion'),
            'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'INACTIVO'], true) ? $body['estado'] : 'ACTIVO',
        ]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'message' => 'Unidad no encontrada o sin cambios'], 404);
        }

        jsonResponse(['ok' => true, 'message' => 'Unidad actualizada correctamente']);
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        if ($id <= 0) {
            jsonResponse(['ok' => false, 'message' => 'id es obligatorio'], 422);
        }

        $stmt = $pdo->prepare(" 
            UPDATE unidades
            SET estado = 'INACTIVO', updated_at = NOW()
            WHERE id_unidad = :id
        ");
        $stmt->execute(['id' => $id]);

        if ($stmt->rowCount() === 0) {
            jsonResponse(['ok' => false, 'message' => 'Unidad no encontrada'], 404);
        }

        jsonResponse(['ok' => true, 'message' => 'Unidad desactivada correctamente']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
