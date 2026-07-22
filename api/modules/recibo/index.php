<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

function autoNumeroRecibo(PDO $pdo, int $periodoId): string
{
    $stmt = $pdo->prepare("SELECT anio, mes FROM periodos WHERE id_periodo = :id LIMIT 1");
    $stmt->execute(['id' => $periodoId]);
    $periodo = $stmt->fetch();

    if (!$periodo) {
        throw new RuntimeException('Periodo no encontrado para generar numero de recibo');
    }

    $meses = [
        1 => 'ENE', 2 => 'FEB', 3 => 'MAR', 4 => 'ABR', 5 => 'MAY', 6 => 'JUN',
        7 => 'JUL', 8 => 'AGO', 9 => 'SEP', 10 => 'OCT', 11 => 'NOV', 12 => 'DIC'
    ];

    $mes = (int) $periodo['mes'];
    $anio = (int) $periodo['anio'];
    $sufijo = str_pad((string) $periodoId, 3, '0', STR_PAD_LEFT);

    return sprintf('REC-%s-%d-%s', $meses[$mes] ?? 'MES', $anio, $sufijo);
}

function bodyFloat(array $body, string $key, float $default = 0.0): float
{
    return isset($body[$key]) ? (float) $body[$key] : $default;
}

function bodyText(array $body, string $key): ?string
{
    if (!array_key_exists($key, $body)) {
        return null;
    }
    $value = trim((string) $body[$key]);
    return $value === '' ? null : $value;
}

function currentInmuebleId(PDO $pdo): int
{
    $stmt = $pdo->query("SELECT id_inmueble FROM inmuebles WHERE estado = 'ACTIVO' ORDER BY id_inmueble LIMIT 1");
    $row = $stmt->fetch();

    if (!$row) {
        throw new RuntimeException('No hay ningun inmueble activo registrado');
    }

    return (int) $row['id_inmueble'];
}

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $periodoId = getPeriodoId($pdo);

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM recibos_luz WHERE id_periodo = :id LIMIT 1");
        $stmt->execute(['id' => $periodoId]);
        $recibo = $stmt->fetch();

        if (!$recibo) {
            $periodoActual = getPeriodoRow($pdo, $periodoId);

            $stmtReciboPrev = $pdo->prepare("
                SELECT r.lectura_actual_general
                FROM recibos_luz r
                INNER JOIN periodos p ON p.id_periodo = r.id_periodo
                WHERE p.fecha_fin <= :fecha_inicio_actual
                  AND r.id_periodo <> :periodo_actual
                ORDER BY p.fecha_fin DESC, r.id_recibo_luz DESC
                LIMIT 1
            ");
            $stmtReciboPrev->execute([
                'fecha_inicio_actual' => $periodoActual['fecha_inicio'],
                'periodo_actual' => $periodoId,
            ]);
            $reciboPrev = $stmtReciboPrev->fetch();
            $lecturaAnteriorPrellenada = $reciboPrev ? (float) $reciboPrev['lectura_actual_general'] : 0;

            $recibo = [
                'id_recibo_luz' => null,
                'id_inmueble' => currentInmuebleId($pdo),
                'id_periodo' => $periodoId,
                'numero_recibo' => autoNumeroRecibo($pdo, $periodoId),
                'numero_suministro' => null,
                'fecha_emision' => null,
                'fecha_vencimiento' => null,
                'lectura_anterior_general' => $lecturaAnteriorPrellenada,
                'lectura_actual_general' => 0,
                'consumo_kwh_general' => 0,
                'precio_kwh' => 0,
                'consumo_energia' => 0,
                'cargo_fijo' => 0,
                'mant_reposicion' => 0,
                'alumbrado_publico' => 0,
                'subtotal' => 0,
                'igv' => 0,
                'electrificacion_rural' => 0,
                'ajuste_redondeo_anterior' => 0,
                'ajuste_redondeo_actual' => 0,
                'total_recibo' => 0,
                'observacion' => null,
                'estado' => 'ACTIVO',
            ];
        }

        jsonResponse([
            'ok' => true,
            'data' => $recibo,
        ]);
    }

    if ($method !== 'POST' && $method !== 'PUT' && $method !== 'PATCH') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    assertPeriodoEditable($pdo, $periodoId);

    $body = getJsonBody();

    $lecturaAnterior = bodyFloat($body, 'lectura_anterior_general');
    $lecturaActual = bodyFloat($body, 'lectura_actual_general');
    $consumoGeneral = max($lecturaActual - $lecturaAnterior, 0);

    $payload = [
        'id_inmueble' => currentInmuebleId($pdo),
        'id_periodo' => $periodoId,
        'numero_recibo' => autoNumeroRecibo($pdo, $periodoId),
        'numero_suministro' => bodyText($body, 'numero_suministro'),
        'fecha_emision' => bodyText($body, 'fecha_emision'),
        'fecha_vencimiento' => bodyText($body, 'fecha_vencimiento'),
        'lectura_anterior_general' => $lecturaAnterior,
        'lectura_actual_general' => $lecturaActual,
        'consumo_kwh_general' => $consumoGeneral,
        'precio_kwh' => bodyFloat($body, 'precio_kwh'),
        'consumo_energia' => bodyFloat($body, 'consumo_energia'),
        'cargo_fijo' => bodyFloat($body, 'cargo_fijo'),
        'mant_reposicion' => bodyFloat($body, 'mant_reposicion'),
        'alumbrado_publico' => bodyFloat($body, 'alumbrado_publico'),
        'subtotal' => bodyFloat($body, 'subtotal'),
        'igv' => bodyFloat($body, 'igv'),
        'electrificacion_rural' => bodyFloat($body, 'electrificacion_rural'),
        'ajuste_redondeo_anterior' => bodyFloat($body, 'ajuste_redondeo_anterior'),
        'ajuste_redondeo_actual' => bodyFloat($body, 'ajuste_redondeo_actual'),
        'total_recibo' => bodyFloat($body, 'total_recibo'),
        'observacion' => bodyText($body, 'observacion'),
        'estado' => in_array(($body['estado'] ?? 'ACTIVO'), ['ACTIVO', 'INACTIVO'], true) ? ($body['estado'] ?? 'ACTIVO') : 'ACTIVO',
    ];

    $stmtFind = $pdo->prepare("SELECT id_recibo_luz FROM recibos_luz WHERE id_periodo = :id_periodo LIMIT 1");
    $stmtFind->execute(['id_periodo' => $periodoId]);
    $found = $stmtFind->fetch();

    if ($found) {
        $sql = "
            UPDATE recibos_luz
            SET
                id_inmueble = :id_inmueble,
                numero_recibo = :numero_recibo,
                numero_suministro = :numero_suministro,
                fecha_emision = :fecha_emision,
                fecha_vencimiento = :fecha_vencimiento,
                lectura_anterior_general = :lectura_anterior_general,
                lectura_actual_general = :lectura_actual_general,
                consumo_kwh_general = :consumo_kwh_general,
                precio_kwh = :precio_kwh,
                consumo_energia = :consumo_energia,
                cargo_fijo = :cargo_fijo,
                mant_reposicion = :mant_reposicion,
                alumbrado_publico = :alumbrado_publico,
                subtotal = :subtotal,
                igv = :igv,
                electrificacion_rural = :electrificacion_rural,
                ajuste_redondeo_anterior = :ajuste_redondeo_anterior,
                ajuste_redondeo_actual = :ajuste_redondeo_actual,
                total_recibo = :total_recibo,
                observacion = :observacion,
                estado = :estado,
                updated_at = NOW()
            WHERE id_recibo_luz = :id_recibo_luz
        ";
        $stmt = $pdo->prepare($sql);
        $payloadUpdate = $payload;
        unset($payloadUpdate['id_periodo']);
        $stmt->execute($payloadUpdate + ['id_recibo_luz' => (int) $found['id_recibo_luz']]);

        jsonResponse([
            'ok' => true,
            'message' => 'Recibo actualizado correctamente',
            'data' => ['id_recibo_luz' => (int) $found['id_recibo_luz']],
        ]);
    }

    $sql = "
        INSERT INTO recibos_luz (
            id_inmueble,
            id_periodo,
            numero_recibo,
            numero_suministro,
            fecha_emision,
            fecha_vencimiento,
            lectura_anterior_general,
            lectura_actual_general,
            consumo_kwh_general,
            precio_kwh,
            consumo_energia,
            cargo_fijo,
            mant_reposicion,
            alumbrado_publico,
            subtotal,
            igv,
            electrificacion_rural,
            ajuste_redondeo_anterior,
            ajuste_redondeo_actual,
            total_recibo,
            observacion,
            estado
        ) VALUES (
            :id_inmueble,
            :id_periodo,
            :numero_recibo,
            :numero_suministro,
            :fecha_emision,
            :fecha_vencimiento,
            :lectura_anterior_general,
            :lectura_actual_general,
            :consumo_kwh_general,
            :precio_kwh,
            :consumo_energia,
            :cargo_fijo,
            :mant_reposicion,
            :alumbrado_publico,
            :subtotal,
            :igv,
            :electrificacion_rural,
            :ajuste_redondeo_anterior,
            :ajuste_redondeo_actual,
            :total_recibo,
            :observacion,
            :estado
        )
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($payload);

    jsonResponse([
        'ok' => true,
        'message' => 'Recibo creado correctamente',
        'data' => ['id_recibo_luz' => (int) $pdo->lastInsertId()],
    ], 201);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
