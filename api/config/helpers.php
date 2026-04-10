
<?php

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function getPeriodoId(PDO $pdo): int
{
    // Si se pasa periodo_id por GET, validar y usar ese
    if (!empty($_GET['periodo_id'])) {
        $id = (int) $_GET['periodo_id'];
        $stmt = $pdo->prepare("SELECT id_periodo FROM periodos WHERE id_periodo = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            throw new RuntimeException("Periodo #{$id} no encontrado");
        }
        return $id;
    }

    // Por defecto: el periodo más reciente registrado
    $stmt = $pdo->query("SELECT id_periodo FROM periodos ORDER BY anio DESC, mes DESC LIMIT 1");
    $row = $stmt->fetch();

    if (!$row) {
        throw new RuntimeException('No hay periodos registrados en la base de datos');
    }

    return (int) $row['id_periodo'];
}

function getPeriodoRow(PDO $pdo, int $periodoId): array
{
    $stmt = $pdo->prepare("SELECT * FROM periodos WHERE id_periodo = :id LIMIT 1");
    $stmt->execute(['id' => $periodoId]);
    $row = $stmt->fetch();

    if (!$row) {
        throw new RuntimeException("Periodo #{$periodoId} no encontrado");
    }

    return $row;
}

function assertPeriodoEditable(PDO $pdo, int $periodoId): void
{
    $periodo = getPeriodoRow($pdo, $periodoId);
    if (($periodo['estado'] ?? '') !== 'ABIERTO') {
        throw new RuntimeException('El periodo seleccionado esta cerrado y no permite edicion');
    }
}
