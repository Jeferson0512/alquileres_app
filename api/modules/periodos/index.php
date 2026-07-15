<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

function bodyText(array $body, string $key): ?string
{
    if (!array_key_exists($key, $body)) {
        return null;
    }
    $value = trim((string) $body[$key]);
    return $value === '' ? null : $value;
}

function bodyInt(array $body, string $key, int $default = 0): int
{
    return isset($body[$key]) ? (int) $body[$key] : $default;
}

function isValidDate(string $value): bool
{
    $date = DateTime::createFromFormat('Y-m-d', $value);
    return $date && $date->format('Y-m-d') === $value;
}

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id_periodo, anio, mes, fecha_inicio, fecha_fin, estado, observacion FROM periodos ORDER BY anio DESC, mes DESC");
        jsonResponse([
            'ok' => true,
            'data' => $stmt->fetchAll(),
        ]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $anio = bodyInt($body, 'anio');
        $mes = bodyInt($body, 'mes');
        $fechaInicio = bodyText($body, 'fecha_inicio');
        $fechaFin = bodyText($body, 'fecha_fin');
        $observacion = bodyText($body, 'observacion');
        $estado = bodyText($body, 'estado') ?: 'ABIERTO';

        if ($anio < 2000 || $mes < 1 || $mes > 12) {
            jsonResponse(['ok' => false, 'message' => 'Año y mes inválidos'], 422);
        }

        if (!$fechaInicio) {
            $fechaInicio = sprintf('%04d-%02d-01', $anio, $mes);
        }

        if (!$fechaFin) {
            $fechaFin = (new DateTime($fechaInicio))->modify('last day of this month')->format('Y-m-d');
        }

        if (!isValidDate($fechaInicio) || !isValidDate($fechaFin)) {
            jsonResponse(['ok' => false, 'message' => 'Fechas inválidas'], 422);
        }

        if ($fechaInicio > $fechaFin) {
            jsonResponse(['ok' => false, 'message' => 'La fecha de inicio debe ser anterior o igual a la fecha de fin'], 422);
        }

        if (!in_array($estado, ['ABIERTO', 'CERRADO', 'ANULADO'], true)) {
            $estado = 'ABIERTO';
        }

        $stmt = $pdo->prepare('SELECT id_periodo FROM periodos WHERE anio = :anio AND mes = :mes LIMIT 1');
        $stmt->execute([':anio' => $anio, ':mes' => $mes]);
        if ($stmt->fetch()) {
            jsonResponse(['ok' => false, 'message' => 'Ya existe un periodo para ese año y mes'], 409);
        }

        $stmt = $pdo->prepare('SELECT id_periodo FROM periodos WHERE NOT (fecha_fin < :fecha_inicio OR fecha_inicio > :fecha_fin) LIMIT 1');
        $stmt->execute([':fecha_inicio' => $fechaInicio, ':fecha_fin' => $fechaFin]);
        if ($stmt->fetch()) {
            jsonResponse(['ok' => false, 'message' => 'El periodo se superpone con otro periodo existente'], 409);
        }

        $stmtUltimo = $pdo->prepare(
            "SELECT id_periodo, fecha_fin FROM periodos WHERE estado IN ('ABIERTO', 'CERRADO') ORDER BY fecha_fin DESC LIMIT 1"
        );
        $stmtUltimo->execute();
        $ultimoPeriodo = $stmtUltimo->fetch();

        if ($ultimoPeriodo) {
            $fechaEsperada = (new DateTime($ultimoPeriodo['fecha_fin']))->modify('+1 day')->format('Y-m-d');
            if ($fechaInicio !== $fechaEsperada) {
                jsonResponse([
                    'ok' => false,
                    'message' => "La fecha de inicio debe ser {$fechaEsperada} (día siguiente al cierre del último periodo registrado)",
                    'data' => ['fecha_inicio_sugerida' => $fechaEsperada],
                ], 409);
            }
        }

        $pdo->beginTransaction();

        $stmt = $pdo->prepare('INSERT INTO periodos (anio, mes, fecha_inicio, fecha_fin, estado, observacion, created_at) VALUES (:anio, :mes, :fecha_inicio, :fecha_fin, :estado, :observacion, NOW())');
        $stmt->execute([
            ':anio' => $anio,
            ':mes' => $mes,
            ':fecha_inicio' => $fechaInicio,
            ':fecha_fin' => $fechaFin,
            ':estado' => $estado,
            ':observacion' => $observacion,
        ]);

        $nuevoId = (int) $pdo->lastInsertId();

        if ($ultimoPeriodo) {
            $pdo->prepare("UPDATE periodos SET estado = 'CERRADO' WHERE id_periodo = :id AND estado = 'ABIERTO'")
                ->execute(['id' => $ultimoPeriodo['id_periodo']]);
        }

        $pdo->commit();

        jsonResponse([
            'ok' => true,
            'message' => 'Periodo creado correctamente',
            'data' => ['id_periodo' => $nuevoId],
        ], 201);
    }

    if ($method === 'PATCH') {
        $idPeriodo = isset($_GET['id_periodo']) ? (int) $_GET['id_periodo'] : 0;
        if ($idPeriodo <= 0) {
            jsonResponse(['ok' => false, 'message' => 'Id de periodo requerido'], 422);
        }

        $stmt = $pdo->prepare('SELECT id_periodo FROM periodos WHERE id_periodo = :id_periodo LIMIT 1');
        $stmt->execute([':id_periodo' => $idPeriodo]);
        if (!$stmt->fetch()) {
            jsonResponse(['ok' => false, 'message' => 'Periodo no encontrado'], 404);
        }

        $body = getJsonBody();
        $observacion = bodyText($body, 'observacion');
        $estado = bodyText($body, 'estado');
        $fechaInicio = bodyText($body, 'fecha_inicio');
        $fechaFin = bodyText($body, 'fecha_fin');

        $fields = [];
        $params = [':id_periodo' => $idPeriodo];

        if ($observacion !== null) {
            $fields[] = 'observacion = :observacion';
            $params[':observacion'] = $observacion;
        }
        if ($estado !== null && in_array($estado, ['ABIERTO', 'CERRADO', 'ANULADO'], true)) {
            $fields[] = 'estado = :estado';
            $params[':estado'] = $estado;
        }
        if ($fechaInicio !== null) {
            if (!isValidDate($fechaInicio)) {
                jsonResponse(['ok' => false, 'message' => 'Fecha de inicio inválida'], 422);
            }
            $fields[] = 'fecha_inicio = :fecha_inicio';
            $params[':fecha_inicio'] = $fechaInicio;
        }
        if ($fechaFin !== null) {
            if (!isValidDate($fechaFin)) {
                jsonResponse(['ok' => false, 'message' => 'Fecha de fin inválida'], 422);
            }
            $fields[] = 'fecha_fin = :fecha_fin';
            $params[':fecha_fin'] = $fechaFin;
        }

        if (empty($fields)) {
            jsonResponse(['ok' => false, 'message' => 'No se recibieron campos para actualizar'], 422);
        }

        $sql = 'UPDATE periodos SET ' . implode(', ', $fields) . ' WHERE id_periodo = :id_periodo';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        jsonResponse([
            'ok' => true,
            'message' => 'Periodo actualizado correctamente',
        ]);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
