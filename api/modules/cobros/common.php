<?php

require_once __DIR__ . '/../../config/helpers.php';

function buildCobrosProgramados(PDO $pdo, int $periodoId): array
{
    $stmtPeriodo = $pdo->prepare("SELECT fecha_fin FROM periodos WHERE id_periodo = :periodoId LIMIT 1");
    $stmtPeriodo->execute(['periodoId' => $periodoId]);
    $periodo = $stmtPeriodo->fetch();

    $stmtRecibo = $pdo->prepare("SELECT fecha_vencimiento, id_inmueble FROM recibos_luz WHERE id_periodo = :periodoId LIMIT 1");
    $stmtRecibo->execute(['periodoId' => $periodoId]);
    $recibo = $stmtRecibo->fetch();

    $fechaVencimiento = $recibo['fecha_vencimiento'] ?? $periodo['fecha_fin'] ?? null;
    $idInmueble = (int) ($recibo['id_inmueble'] ?? 1);

    $stmtTarifas = $pdo->prepare("SELECT servicio, monto FROM tarifas_servicios WHERE id_inmueble = :in AND activo = 1");
    $stmtTarifas->execute(['in' => $idInmueble]);
    $tarifas = [];
    foreach ($stmtTarifas->fetchAll() as $tarifa) {
        $tarifas[$tarifa['servicio']] = (float) $tarifa['monto'];
    }

    $stmtConfig = $pdo->prepare("SELECT monto_minimo_luz FROM config_cobranza WHERE id_inmueble = :in LIMIT 1");
    $stmtConfig->execute(['in' => $idInmueble]);
    $configCobranza = $stmtConfig->fetch();

    $tarifaAgua = $tarifas['AGUA'] ?? 15.0;
    $tarifaGas = $tarifas['GAS'] ?? 0.0;
    $tarifaMant = $tarifas['MANTENIMIENTO'] ?? 0.0;
    $montoMinimoLuz = isset($configCobranza['monto_minimo_luz']) ? (float) $configCobranza['monto_minimo_luz'] : 0.0;

    $stmt = $pdo->prepare(" 
        SELECT
            ll.id_unidad,
            ll.id_persona,
            ll.total_pagar_luz,
            o.monto_alquiler
        FROM liquidacion_luz_detalle ll
        INNER JOIN lecturas_unidad l ON l.id_lectura = ll.id_lectura
        INNER JOIN ocupacion_unidad o ON o.id_ocupacion = l.id_ocupacion
        WHERE ll.id_periodo = :periodoId
    ");
    $stmt->execute(['periodoId' => $periodoId]);

    $rows = [];
    foreach ($stmt->fetchAll() as $row) {
        $montoLuz = round((float) $row['total_pagar_luz'], 2);
        $ajusteMinimoLuz = $montoMinimoLuz > 0 && $montoLuz < $montoMinimoLuz
            ? round($montoMinimoLuz - $montoLuz, 2)
            : 0;

        $montoAlquiler = round((float) $row['monto_alquiler'], 2);
        $montoAgua = round($tarifaAgua, 2);
        $montoGas = round($tarifaGas, 2);
        $montoOtros = round($tarifaMant, 2);
        $totalCobrar = round($montoAlquiler + $montoLuz + $ajusteMinimoLuz + $montoAgua + $montoGas + $montoOtros, 2);

        $observacion = 'Cobro generado desde API PHP';
        if ($ajusteMinimoLuz > 0) {
            $observacion .= ' | Ajuste minimo luz: S/ ' . number_format($ajusteMinimoLuz, 2, '.', '');
        }

        $detalles = [
            ['codigo' => 'ALQUILER', 'monto' => $montoAlquiler, 'descripcion' => 'Alquiler', 'orden_visual' => 10],
            ['codigo' => 'LUZ', 'monto' => $montoLuz, 'descripcion' => 'Luz', 'orden_visual' => 20],
            ['codigo' => 'AJUSTE_MINIMO_LUZ', 'monto' => $ajusteMinimoLuz, 'descripcion' => 'Ajuste minimo luz', 'orden_visual' => 30],
            ['codigo' => 'AGUA', 'monto' => $montoAgua, 'descripcion' => 'Agua', 'orden_visual' => 40],
            ['codigo' => 'GAS', 'monto' => $montoGas, 'descripcion' => 'Gas', 'orden_visual' => 50],
            ['codigo' => 'OTROS', 'monto' => $montoOtros, 'descripcion' => 'Otros conceptos', 'orden_visual' => 60],
        ];

        $rows[] = [
            'key' => buildCobroPeriodoKey((int) $row['id_unidad'], (int) $row['id_persona']),
            'id_unidad' => (int) $row['id_unidad'],
            'id_persona' => (int) $row['id_persona'],
            'monto_alquiler' => $montoAlquiler,
            'monto_luz' => $montoLuz,
            'ajuste_minimo_luz' => $ajusteMinimoLuz,
            'monto_agua' => $montoAgua,
            'monto_gas' => $montoGas,
            'otros_conceptos' => $montoOtros,
            'total_cobrar' => $totalCobrar,
            'fecha_vencimiento' => $fechaVencimiento,
            'observacion' => $observacion,
            'detalles' => array_values(array_filter($detalles, static fn(array $detalle): bool => (float) $detalle['monto'] > 0)),
        ];
    }

    return $rows;
}

function buildCobroPeriodoKey(int $idUnidad, int $idPersona): string
{
    return $idUnidad . ':' . $idPersona;
}

function getConceptosActivosMap(PDO $pdo): array
{
    $stmtConceptos = $pdo->query("SELECT id_concepto, codigo FROM conceptos_cobro WHERE activo = 1");
    $map = [];
    foreach ($stmtConceptos->fetchAll() as $concepto) {
        $map[$concepto['codigo']] = (int) $concepto['id_concepto'];
    }

    return $map;
}

function createCobroDetalleLineas(PDO $pdo, int $idCobro, array $detalles, array $conceptosMap): void
{
    $stmt = $pdo->prepare(" 
        INSERT INTO cobros_mensuales_detalle (
            id_cobro,
            id_concepto,
            monto_programado,
            descripcion,
            orden_visual
        ) VALUES (
            :id_cobro,
            :id_concepto,
            :monto_programado,
            :descripcion,
            :orden_visual
        )
    ");

    foreach ($detalles as $detalle) {
        if (!isset($conceptosMap[$detalle['codigo']])) {
            continue;
        }

        $stmt->execute([
            'id_cobro' => $idCobro,
            'id_concepto' => $conceptosMap[$detalle['codigo']],
            'monto_programado' => $detalle['monto'],
            'descripcion' => $detalle['descripcion'],
            'orden_visual' => $detalle['orden_visual'],
        ]);
    }
}