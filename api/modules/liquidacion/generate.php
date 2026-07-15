<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

function roundUpToTenth(float $value): float
{
    if ($value <= 0) {
        return 0.0;
    }
    return ceil(($value - 0.0000001) * 10) / 10;
}

function parseAjustesByUnidad(array $body): array
{
    $ajustes = $body['ajustes'] ?? [];
    $result = [];

    if (!is_array($ajustes)) {
        return $result;
    }

    foreach ($ajustes as $item) {
        if (!is_array($item)) {
            continue;
        }

        $idUnidad = (int) ($item['id_unidad'] ?? 0);
        if ($idUnidad <= 0) {
            continue;
        }

        $result[$idUnidad] = round((float) ($item['ajuste'] ?? 0), 2);
    }

    return $result;
}

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);
    $body = getJsonBody();

    // Los ajustes no enviados explicitamente en el body conservan su valor previo,
    // para que regenerar la liquidacion (p.ej. tras actualizar una lectura) no borre
    // ajustes manuales que el frontend no reenvio.
    $stmtPrevios = $pdo->prepare("SELECT id_unidad, ajuste, consumo_kwh, porcentaje_participacion FROM liquidacion_luz_detalle WHERE id_periodo = :periodoId");
    $stmtPrevios->execute(['periodoId' => $periodoId]);
    $ajustesByUnidad = [];
    $previoByUnidad = [];
    foreach ($stmtPrevios->fetchAll() as $rowPrevio) {
        $idUnidadPrevio = (int) $rowPrevio['id_unidad'];
        $ajustesByUnidad[$idUnidadPrevio] = (float) $rowPrevio['ajuste'];
        $previoByUnidad[$idUnidadPrevio] = [
            'consumo_kwh' => (float) $rowPrevio['consumo_kwh'],
            'porcentaje_participacion' => (float) $rowPrevio['porcentaje_participacion'],
        ];
    }
    foreach (parseAjustesByUnidad($body) as $idUnidad => $ajusteEnviado) {
        $ajustesByUnidad[$idUnidad] = $ajusteEnviado;
    }

    $stmtRecibo = $pdo->prepare("SELECT id_recibo_luz, id_inmueble, precio_kwh, total_recibo FROM recibos_luz WHERE id_periodo = :id LIMIT 1");
    $stmtRecibo->execute(['id' => $periodoId]);
    $recibo = $stmtRecibo->fetch();

    if (!$recibo) {
        throw new RuntimeException('No existe recibo para el periodo');
    }

    $stmt = $pdo->prepare(" 
        SELECT
            l.id_lectura,
            l.id_unidad,
            u.codigo_unidad,
            p.id_persona,
            ROUND(GREATEST(l.lectura_actual - l.lectura_anterior, 0), 2) AS consumo_kwh
        FROM lecturas_unidad l
        INNER JOIN unidades u ON u.id_unidad = l.id_unidad
        INNER JOIN ocupacion_unidad o ON o.id_ocupacion = l.id_ocupacion
        INNER JOIN personas p ON p.id_persona = o.id_persona
        WHERE l.id_periodo = :periodoId
          AND l.id_ocupacion IS NOT NULL
        ORDER BY u.codigo_unidad
    ");
    $stmt->execute(['periodoId' => $periodoId]);
    $rows = $stmt->fetchAll();

    $precioKwh = (float) ($recibo['precio_kwh'] ?? 0);
    $igvRate = 0.18;

    $montoConsumoTotalRedondeado = 0.0;
    foreach ($rows as $liquidado) {
        $consumo = (float) ($liquidado['consumo_kwh'] ?? 0);
        $subtotalConsumo = $consumo * $precioKwh;
        $igvConsumo = $subtotalConsumo * $igvRate;
        $montoConsumoRedondeado = roundUpToTenth($subtotalConsumo + $igvConsumo);
        $montoConsumoTotalRedondeado += $montoConsumoRedondeado;
    }

    $diferenciaComun = round((float) $recibo['total_recibo'] - $montoConsumoTotalRedondeado, 2);

    // Unidades cuyo consumo no cambio desde la ultima generacion mantienen su
    // porcentaje de participacion congelado, para que actualizar la lectura de
    // UNA unidad (retiro a mitad de periodo, cambio de cuarto, correccion) no
    // le mueva el monto a las demas. El % que queda libre (100% menos lo
    // congelado) se reparte entre las unidades que si cambiaron, en proporcion
    // a su propio consumo actual.
    $sumaPorcentajeCongelado = 0.0;
    $sumaConsumoCambiadas = 0.0;
    $esCongelada = [];

    foreach ($rows as $row) {
        $idUnidad = (int) $row['id_unidad'];
        $consumo = (float) $row['consumo_kwh'];
        if ($consumo <= 0) {
            continue;
        }

        $previo = $previoByUnidad[$idUnidad] ?? null;
        $sinCambios = $previo !== null && round($previo['consumo_kwh'], 2) === round($consumo, 2);
        $esCongelada[$idUnidad] = $sinCambios;

        if ($sinCambios) {
            $sumaPorcentajeCongelado += $previo['porcentaje_participacion'];
        } else {
            $sumaConsumoCambiadas += $consumo;
        }
    }

    $porcentajeDisponible = max(1 - $sumaPorcentajeCongelado, 0);

    $pdo->beginTransaction();

    $pdo->prepare("DELETE FROM liquidacion_luz_detalle WHERE id_periodo = :periodoId")
        ->execute(['periodoId' => $periodoId]);

    $insert = $pdo->prepare(" 
        INSERT INTO liquidacion_luz_detalle (
            id_periodo, id_inmueble, id_unidad, id_persona, id_lectura, id_recibo_luz,
            consumo_kwh, porcentaje_participacion, monto_consumo, gasto_comun, ajuste,
            total_pagar_luz, estado, observacion
        ) VALUES (
            :id_periodo, :id_inmueble, :id_unidad, :id_persona, :id_lectura, :id_recibo_luz,
            :consumo_kwh, :porcentaje_participacion, :monto_consumo, :gasto_comun, :ajuste,
            :total_pagar_luz, :estado, :observacion
        )
    ");

    foreach ($rows as $row) {
        $idUnidad = (int) $row['id_unidad'];
        $consumo = (float) $row['consumo_kwh'];
        if ($consumo <= 0) {
            continue; // Unidades sin consumo no participan en la facturación
        }

        if ($esCongelada[$idUnidad] ?? false) {
            $porcentaje = $previoByUnidad[$idUnidad]['porcentaje_participacion'];
        } else {
            $porcentaje = $sumaConsumoCambiadas > 0 ? $porcentajeDisponible * ($consumo / $sumaConsumoCambiadas) : 0;
        }

        $subtotalConsumo = $consumo * $precioKwh;
        $igvConsumo = $subtotalConsumo * $igvRate;
        $montoConsumo = roundUpToTenth($subtotalConsumo + $igvConsumo);
        $gastoComun = $diferenciaComun * $porcentaje;
        $ajuste = (float) ($ajustesByUnidad[(int) $row['id_unidad']] ?? 0);
        $totalLuzCrudo = $montoConsumo + $gastoComun + $ajuste;
        $totalLuz = $totalLuzCrudo > 0 ? roundUpToTenth($totalLuzCrudo) : round($totalLuzCrudo, 2);

        $insert->execute([
            'id_periodo' => $periodoId,
            'id_inmueble' => (int) $recibo['id_inmueble'],
            'id_unidad' => (int) $row['id_unidad'],
            'id_persona' => (int) $row['id_persona'],
            'id_lectura' => (int) $row['id_lectura'],
            'id_recibo_luz' => (int) $recibo['id_recibo_luz'],
            'consumo_kwh' => round($consumo, 2),
            'porcentaje_participacion' => round($porcentaje, 6),
            'monto_consumo' => round($montoConsumo, 2),
            'gasto_comun' => round($gastoComun, 2),
            'ajuste' => round($ajuste, 2),
            'total_pagar_luz' => round($totalLuz, 2),
            'estado' => 'GENERADO',
            'observacion' => 'Generado desde API PHP (formula Excel v2)'
        ]);
    }

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'message' => 'Liquidación generada correctamente'
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
