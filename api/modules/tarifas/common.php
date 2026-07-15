<?php

function tarifasAuditoriaSchemaDisponible(PDO $pdo): bool
{
    static $disponible = null;

    if ($disponible === null) {
        $stmt = $pdo->query("SHOW TABLES LIKE 'tarifas_auditoria'");
        $disponible = (bool) $stmt->fetch();
    }

    return $disponible;
}

function createTarifaAudit(PDO $pdo, int $idTarifa, string $accion, ?string $actor, ?array $before, ?array $after): void
{
    if (!tarifasAuditoriaSchemaDisponible($pdo)) {
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO tarifas_auditoria (
            id_tarifa,
            accion,
            actor,
            payload_before,
            payload_after
        ) VALUES (
            :id_tarifa,
            :accion,
            :actor,
            :payload_before,
            :payload_after
        )
    ");

    $stmt->execute([
        'id_tarifa' => $idTarifa,
        'accion' => $accion,
        'actor' => $actor,
        'payload_before' => $before !== null ? json_encode($before, JSON_UNESCAPED_UNICODE) : null,
        'payload_after' => $after !== null ? json_encode($after, JSON_UNESCAPED_UNICODE) : null,
    ]);
}
