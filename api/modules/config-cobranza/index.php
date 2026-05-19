<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $idInmueble = isset($_GET['id_inmueble']) ? (int) $_GET['id_inmueble'] : 1;

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM config_cobranza WHERE id_inmueble = :id LIMIT 1");
        $stmt->execute(['id' => $idInmueble]);
        $row = $stmt->fetch();

        if (!$row) {
            $row = [
                'id_inmueble' => $idInmueble,
                'monto_minimo_luz' => 0,
                'minimo_kwh_aviso' => 13.5,
                'yape_titular' => '',
                'yape_numero' => '',
                'yape_qr' => '',
                'banco_nombre' => '',
                'banco_titular' => '',
                'banco_cuenta' => '',
                'banco_cci' => '',
                'mensaje_base' => '',
            ];
        }

        jsonResponse(['ok' => true, 'data' => $row]);
    }

    if ($method === 'PUT' || $method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $payload = [
            'id_inmueble' => $idInmueble,
            'monto_minimo_luz' => round(max((float) ($body['monto_minimo_luz'] ?? 0), 0), 2),
            'minimo_kwh_aviso' => round(max((float) ($body['minimo_kwh_aviso'] ?? 13.5), 0), 2),
            'yape_titular' => trim((string) ($body['yape_titular'] ?? '')),
            'yape_numero' => trim((string) ($body['yape_numero'] ?? '')),
            'yape_qr' => trim((string) ($body['yape_qr'] ?? '')),
            'banco_nombre' => trim((string) ($body['banco_nombre'] ?? '')),
            'banco_titular' => trim((string) ($body['banco_titular'] ?? '')),
            'banco_cuenta' => trim((string) ($body['banco_cuenta'] ?? '')),
            'banco_cci' => trim((string) ($body['banco_cci'] ?? '')),
            'mensaje_base' => trim((string) ($body['mensaje_base'] ?? '')),
        ];

        $sql = "
            INSERT INTO config_cobranza (
                id_inmueble, monto_minimo_luz, minimo_kwh_aviso, yape_titular, yape_numero, yape_qr,
                banco_nombre, banco_titular, banco_cuenta, banco_cci, mensaje_base
            ) VALUES (
                :id_inmueble, :monto_minimo_luz, :minimo_kwh_aviso, :yape_titular, :yape_numero, :yape_qr,
                :banco_nombre, :banco_titular, :banco_cuenta, :banco_cci, :mensaje_base
            )
            ON DUPLICATE KEY UPDATE
                monto_minimo_luz = VALUES(monto_minimo_luz),
                minimo_kwh_aviso = VALUES(minimo_kwh_aviso),
                yape_titular = VALUES(yape_titular),
                yape_numero = VALUES(yape_numero),
                yape_qr = VALUES(yape_qr),
                banco_nombre = VALUES(banco_nombre),
                banco_titular = VALUES(banco_titular),
                banco_cuenta = VALUES(banco_cuenta),
                banco_cci = VALUES(banco_cci),
                mensaje_base = VALUES(mensaje_base),
                updated_at = NOW()
        ";

        $pdo->prepare($sql)->execute($payload);
        jsonResponse(['ok' => true, 'message' => 'Configuracion de cobranza actualizada correctamente']);
    }

    jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
