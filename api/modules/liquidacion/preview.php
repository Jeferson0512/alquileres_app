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

try {
    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);

    $stmtRecibo = $pdo->prepare("SELECT * FROM recibos_luz WHERE id_periodo = :id LIMIT 1");
    $stmtRecibo->execute(['id' => $periodoId]);
    $recibo = $stmtRecibo->fetch();

    if (!$recibo) {
        throw new RuntimeException('No existe recibo para el periodo');
    }

    // Leer tarifas de servicios desde BD
    $idInmueble = (int) ($recibo['id_inmueble'] ?? 1);
    $stmtTar = $pdo->prepare("SELECT servicio, monto FROM tarifas_servicios WHERE id_inmueble = :in AND activo = 1");
    $stmtTar->execute(['in' => $idInmueble]);
    $tarifas = [];
    foreach ($stmtTar->fetchAll() as $t) {
        $tarifas[$t['servicio']] = (float) $t['monto'];
    }
    $tarifaAgua = $tarifas['AGUA']          ?? 15.0;
    $tarifaGas  = $tarifas['GAS']           ?? 0.0;
    $tarifaMant = $tarifas['MANTENIMIENTO'] ?? 0.0;

    $stmt = $pdo->prepare(" 
        SELECT
            l.id_lectura,
            l.id_unidad,
            l.id_ocupacion,
            u.codigo_unidad,
            u.nombre_unidad,
            CONCAT(COALESCE(p.nombres,''), ' ', COALESCE(p.apellidos,'')) AS inquilino,
            COALESCE(o.monto_alquiler, 0) AS monto_alquiler,
            ROUND(GREATEST(l.lectura_actual - l.lectura_anterior, 0), 2) AS consumo_kwh,
            p.id_persona
        FROM lecturas_unidad l
        INNER JOIN unidades u ON u.id_unidad = l.id_unidad
        LEFT JOIN ocupacion_unidad o ON o.id_ocupacion = l.id_ocupacion
        LEFT JOIN personas p ON p.id_persona = o.id_persona
        WHERE l.id_periodo = :periodoId
        ORDER BY u.codigo_unidad
    ");
    $stmt->execute(['periodoId' => $periodoId]);
    $rows = $stmt->fetchAll();

    $stmtAjustes = $pdo->prepare("
        SELECT id_unidad, ajuste, consumo_kwh, porcentaje_participacion
        FROM liquidacion_luz_detalle
        WHERE id_periodo = :periodoId
    ");
    $stmtAjustes->execute(['periodoId' => $periodoId]);
    $ajustesByUnidad = [];
    $previoByUnidad = [];
    foreach ($stmtAjustes->fetchAll() as $ajusteRow) {
        $idUnidadAjuste = (int) $ajusteRow['id_unidad'];
        $ajustesByUnidad[$idUnidadAjuste] = round((float) ($ajusteRow['ajuste'] ?? 0), 2);
        $previoByUnidad[$idUnidadAjuste] = [
            'consumo_kwh' => (float) $ajusteRow['consumo_kwh'],
            'porcentaje_participacion' => (float) $ajusteRow['porcentaje_participacion'],
        ];
    }

    $rowsLiquidados = array_values(array_filter($rows, fn ($r) => !empty($r['id_ocupacion']) && (float) $r['consumo_kwh'] > 0));

    $totalConsumo = array_sum(array_map(fn ($r) => (float) $r['consumo_kwh'], $rowsLiquidados));
    $precioKwh = (float) ($recibo['precio_kwh'] ?? 0);
    $igvRate = 0.18;

    $montoConsumoTotalRedondeado = 0.0;
    foreach ($rowsLiquidados as $liquidado) {
        $consumo = (float) ($liquidado['consumo_kwh'] ?? 0);
        $subtotalConsumo = $consumo * $precioKwh;
        $igvConsumo = $subtotalConsumo * $igvRate;
        $montoConsumoRedondeado = roundUpToTenth($subtotalConsumo + $igvConsumo);
        $montoConsumoTotalRedondeado += $montoConsumoRedondeado;
    }

    $diferenciaComun = round((float) $recibo['total_recibo'] - $montoConsumoTotalRedondeado, 2);

    // Replica la misma logica de "porcentaje congelado" que usa liquidacion/generate.php:
    // si el consumo de una unidad no cambio desde la ultima vez que se guardo la liquidacion,
    // su % de participacion se mantiene fijo, para que la previsualizacion coincida exactamente
    // con lo que se va a guardar al generar/forzar.
    $sumaPorcentajeCongelado = 0.0;
    $sumaConsumoCambiadas = 0.0;
    $esCongelada = [];

    foreach ($rowsLiquidados as $liquidado) {
        $idUnidadLiq = (int) $liquidado['id_unidad'];
        $consumoLiq = (float) $liquidado['consumo_kwh'];

        $previo = $previoByUnidad[$idUnidadLiq] ?? null;
        $sinCambios = $previo !== null && round($previo['consumo_kwh'], 2) === round($consumoLiq, 2);
        $esCongelada[$idUnidadLiq] = $sinCambios;

        if ($sinCambios) {
            $sumaPorcentajeCongelado += $previo['porcentaje_participacion'];
        } else {
            $sumaConsumoCambiadas += $consumoLiq;
        }
    }

    $porcentajeDisponible = max(1 - $sumaPorcentajeCongelado, 0);

    $porcentajesPorUnidad = [];
    foreach ($rowsLiquidados as $liquidado) {
        $idUnidadLiq = (int) $liquidado['id_unidad'];
        $consumoLiq = (float) $liquidado['consumo_kwh'];

        if ($esCongelada[$idUnidadLiq] ?? false) {
            $porcentajesPorUnidad[$idUnidadLiq] = $previoByUnidad[$idUnidadLiq]['porcentaje_participacion'];
        } else {
            $porcentajesPorUnidad[$idUnidadLiq] = $sumaConsumoCambiadas > 0
                ? $porcentajeDisponible * ($consumoLiq / $sumaConsumoCambiadas)
                : 0;
        }
    }

    $data = array_map(function ($row) use ($precioKwh, $igvRate, $diferenciaComun, $tarifaAgua, $tarifaGas, $tarifaMant, $ajustesByUnidad, $porcentajesPorUnidad) {
        $consumo = (float) $row['consumo_kwh'];
        $participa = !empty($row['id_ocupacion']) && $consumo > 0;
        $idUnidadRow = (int) $row['id_unidad'];
        $porcentaje = $participa ? ($porcentajesPorUnidad[$idUnidadRow] ?? 0) : 0;
        $subtotalConsumo = $participa ? $consumo * $precioKwh : 0;
        $igvConsumo = $participa ? $subtotalConsumo * $igvRate : 0;
        $montoConsumoRedondeado = $participa ? roundUpToTenth($subtotalConsumo + $igvConsumo) : 0;
        $gastoComun = $participa ? ($diferenciaComun * $porcentaje) : 0;
        $ajuste = $participa ? (float) ($ajustesByUnidad[(int) $row['id_unidad']] ?? 0) : 0;
        $totalLuzBase = $participa ? ($montoConsumoRedondeado + $gastoComun) : 0;
        $totalLuzCrudo = $participa ? ($totalLuzBase + $ajuste) : 0;
        $totalLuz = $totalLuzCrudo > 0 ? roundUpToTenth($totalLuzCrudo) : round($totalLuzCrudo, 2);
        $montoAlquiler = $participa ? (float) $row['monto_alquiler'] : 0;
        $servicios = $participa ? ($tarifaAgua + $tarifaGas + $tarifaMant) : 0;

        return [
            'id_lectura' => (int) $row['id_lectura'],
            'id_unidad' => (int) $row['id_unidad'],
            'id_persona' => (int) $row['id_persona'],
            'participa_liquidacion' => $participa,
            'estado_unidad' => $participa ? 'OCUPADA' : 'VACIA',
            'codigo_unidad' => $row['codigo_unidad'],
            'nombre_unidad' => $row['nombre_unidad'],
            'inquilino' => trim((string) $row['inquilino']) !== '' ? $row['inquilino'] : '-',
            'monto_alquiler' => $montoAlquiler,
            'consumo_kwh' => round($consumo, 2),
            'porcentaje_participacion' => round($porcentaje, 6),
            'subtotal_consumo' => round($subtotalConsumo, 2),
            'igv_consumo' => round($igvConsumo, 2),
            'monto_consumo' => round($montoConsumoRedondeado, 2),
            'gasto_comun' => round($gastoComun, 2),
            'ajuste' => round($ajuste, 2),
            'total_luz_base' => round($totalLuzBase, 2),
            'total_pagar_luz' => round($totalLuz, 2),
            'agua'          => $participa ? $tarifaAgua : 0,
            'gas'           => $participa ? $tarifaGas : 0,
            'mantenimiento' => $participa ? $tarifaMant : 0,
            'total_cobrar'  => round($montoAlquiler + $servicios + $totalLuz, 2),
        ];
    }, $rows);

    jsonResponse([
        'ok' => true,
        'meta' => [
            'total_consumo' => round($totalConsumo, 2),
            'precio_kwh' => round($precioKwh, 4),
            'igv_rate' => $igvRate,
            'monto_consumo_total' => round($montoConsumoTotalRedondeado, 2),
            'diferencia_comun' => round($diferenciaComun, 2),
            'criterio_gasto_comun' => 'PROPORCIONAL_PORCENTAJE',
            'total_unidades' => count($rows),
            'total_unidades_liquidadas' => count($rowsLiquidados)
        ],
        'data' => $data
    ]);
} catch (Throwable $e) {
    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage()
    ], 500);
}
