<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

/**
 * Limpieza del seed de e2e-seed-medidor.php. Recibe el payload {titular,
 * dependiente, id_relacion, marker} tal cual lo devuelve el seed y revierte
 * exactamente lo que ese endpoint creo.
 */
try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'POST') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '';
    $isLocal = in_array($remoteAddr, ['127.0.0.1', '::1', ''], true);
    if (!$isLocal) {
        jsonResponse(['ok' => false, 'message' => 'Solo disponible en localhost'], 403);
    }

    $body = getJsonBody();
    $marker = trim((string) ($body['marker'] ?? ''));
    $idRelacion = (int) ($body['id_relacion'] ?? 0);
    $titular = $body['titular'] ?? [];
    $dependiente = $body['dependiente'] ?? [];

    if ($marker === '' || strpos($marker, 'E2E_') !== 0 || $idRelacion <= 0) {
        jsonResponse(['ok' => false, 'message' => 'Payload E2E invalido'], 422);
    }

    $pdo = Database::getConnection();
    $pdo->beginTransaction();

    $pdo->prepare('DELETE FROM unidades_medidor_compartido WHERE id_relacion = :id')->execute(['id' => $idRelacion]);

    foreach ([$titular, $dependiente] as $entidad) {
        $idPersona = (int) ($entidad['id_persona'] ?? 0);
        $idUnidad = (int) ($entidad['id_unidad'] ?? 0);
        $idOcupacion = (int) ($entidad['id_ocupacion'] ?? 0);

        if ($idUnidad <= 0 || $idPersona <= 0) {
            continue;
        }

        $pdo->prepare('DELETE FROM liquidacion_luz_detalle WHERE id_persona = :id_persona OR id_unidad = :id_unidad')
            ->execute(['id_persona' => $idPersona, 'id_unidad' => $idUnidad]);

        if ($idOcupacion > 0) {
            $pdo->prepare('DELETE FROM lecturas_unidad WHERE id_ocupacion = :id_ocupacion')
                ->execute(['id_ocupacion' => $idOcupacion]);
        }

        $pdo->prepare('DELETE FROM ocupacion_unidad WHERE id_ocupacion = :id_ocupacion OR id_persona = :id_persona OR id_unidad = :id_unidad')
            ->execute(['id_ocupacion' => $idOcupacion, 'id_persona' => $idPersona, 'id_unidad' => $idUnidad]);

        $pdo->prepare('DELETE FROM unidades WHERE id_unidad = :id_unidad')->execute(['id_unidad' => $idUnidad]);

        $pdo->prepare("DELETE FROM personas WHERE id_persona = :id_persona AND tipo_persona = 'INQUILINO'")
            ->execute(['id_persona' => $idPersona]);
    }

    $pdo->commit();

    jsonResponse(['ok' => true, 'message' => 'Limpieza E2E medidor compartido completada']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
