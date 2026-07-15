<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method !== 'GET') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $stmt = $pdo->query("
        SELECT
            o.id_ocupacion,
            o.id_unidad,
            o.id_persona,
            o.fecha_inicio,
            u.codigo_unidad,
            u.nombre_unidad,
            CONCAT(p.nombres, ' ', p.apellidos) AS inquilino,
            DATE_ADD(o.fecha_inicio, INTERVAL 6 MONTH) AS fecha_vencimiento_contrato
        FROM ocupacion_unidad o
        INNER JOIN unidades u ON u.id_unidad = o.id_unidad
        INNER JOIN personas p ON p.id_persona = o.id_persona
        WHERE o.estado = 'ACTIVO'
    ");

    $avisos = [];
    $hoy = new DateTime(date('Y-m-d'));

    foreach ($stmt->fetchAll() as $row) {
        $venc = new DateTime($row['fecha_vencimiento_contrato']);
        $diasRestantes = (int) $hoy->diff($venc)->format('%r%a');

        if ($diasRestantes <= 30 && $diasRestantes >= 0) {
            $nivel = $diasRestantes <= 7 ? 'URGENTE' : 'PROXIMO';
            $avisos[] = [
                'tipo' => 'VENCIMIENTO_CONTRATO',
                'id_referencia' => (int) $row['id_ocupacion'],
                'id_persona' => (int) $row['id_persona'],
                'id_unidad' => (int) $row['id_unidad'],
                'codigo_unidad' => $row['codigo_unidad'],
                'nombre_unidad' => $row['nombre_unidad'],
                'inquilino' => $row['inquilino'],
                'fecha_vencimiento' => $row['fecha_vencimiento_contrato'],
                'dias_restantes' => $diasRestantes,
                'nivel' => $nivel,
                'mensaje' => "Contrato de {$row['inquilino']} ({$row['codigo_unidad']}) vence en {$diasRestantes} dia(s)",
            ];
        }
    }

    usort($avisos, fn($a, $b) => $a['dias_restantes'] <=> $b['dias_restantes']);

    jsonResponse(['ok' => true, 'data' => $avisos]);
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
