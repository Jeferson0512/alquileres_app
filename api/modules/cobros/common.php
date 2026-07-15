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

    $stmtOverrides = $pdo->prepare("
        SELECT id_unidad, id_persona, servicio, monto
        FROM cobros_overrides_servicio
        WHERE id_periodo = :periodoId
    ");
    $stmtOverrides->execute(['periodoId' => $periodoId]);
    $overridesByKey = [];
    foreach ($stmtOverrides->fetchAll() as $override) {
        $key = buildCobroPeriodoKey((int) $override['id_unidad'], (int) $override['id_persona']) . ':' . $override['servicio'];
        $overridesByKey[$key] = (float) $override['monto'];
    }

    $stmtMedidor = $pdo->prepare("
        SELECT id_unidad_titular, id_unidad_dependiente, porcentaje_dependiente
        FROM unidades_medidor_compartido
        WHERE activo = 1
    ");
    $stmtMedidor->execute();
    $medidorPorTitular = [];
    foreach ($stmtMedidor->fetchAll() as $relacion) {
        $medidorPorTitular[(int) $relacion['id_unidad_titular']] = [
            'id_unidad_dependiente' => (int) $relacion['id_unidad_dependiente'],
            'porcentaje_dependiente' => (float) $relacion['porcentaje_dependiente'],
        ];
    }

    $armarFilaCobro = function (int $idUnidad, int $idPersona, float $montoAlquiler, float $montoLuz, float $ajusteMinimoLuz) use ($overridesByKey, $tarifaAgua, $tarifaGas, $tarifaMant, $fechaVencimiento): array {
        $montoAlquiler = round($montoAlquiler, 2);
        $montoLuz = round($montoLuz, 2);
        $ajusteMinimoLuz = round($ajusteMinimoLuz, 2);

        $keyBase = buildCobroPeriodoKey($idUnidad, $idPersona);
        $montoAgua = round($overridesByKey["{$keyBase}:AGUA"] ?? $tarifaAgua, 2);
        $montoGas = round($overridesByKey["{$keyBase}:GAS"] ?? $tarifaGas, 2);
        $montoOtros = round($overridesByKey["{$keyBase}:MANTENIMIENTO"] ?? $tarifaMant, 2);
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

        return [
            'key' => buildCobroPeriodoKey($idUnidad, $idPersona),
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
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
    };

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

    $stmtOcupacionDependiente = $pdo->prepare("
        SELECT id_persona, monto_alquiler
        FROM ocupacion_unidad
        WHERE id_unidad = :idUnidad AND estado = 'ACTIVO'
        LIMIT 1
    ");

    $rows = [];
    foreach ($stmt->fetchAll() as $row) {
        $idUnidad = (int) $row['id_unidad'];
        $idPersona = (int) $row['id_persona'];
        $montoLuzTotal = round((float) $row['total_pagar_luz'], 2);
        $montoAlquiler = round((float) $row['monto_alquiler'], 2);

        $montoLuzTitular = $montoLuzTotal;
        $filaDependiente = null;
        $relacion = $medidorPorTitular[$idUnidad] ?? null;

        if ($relacion !== null && $relacion['porcentaje_dependiente'] > 0) {
            $stmtOcupacionDependiente->execute(['idUnidad' => $relacion['id_unidad_dependiente']]);
            $ocupacionDependiente = $stmtOcupacionDependiente->fetch();

            if ($ocupacionDependiente) {
                $montoLuzDependiente = round($montoLuzTotal * $relacion['porcentaje_dependiente'] / 100, 2);
                $montoLuzTitular = round($montoLuzTotal - $montoLuzDependiente, 2);

                $filaDependiente = $armarFilaCobro(
                    $relacion['id_unidad_dependiente'],
                    (int) $ocupacionDependiente['id_persona'],
                    (float) $ocupacionDependiente['monto_alquiler'],
                    $montoLuzDependiente,
                    0.0
                );
            }
        }

        $ajusteMinimoLuzTitular = $montoMinimoLuz > 0 && $montoLuzTitular < $montoMinimoLuz
            ? round($montoMinimoLuz - $montoLuzTitular, 2)
            : 0;

        $rows[] = $armarFilaCobro($idUnidad, $idPersona, $montoAlquiler, $montoLuzTitular, $ajusteMinimoLuzTitular);

        if ($filaDependiente !== null) {
            $rows[] = $filaDependiente;
        }
    }

    return $rows;
}

function buildCobroPeriodoKey(int $idUnidad, int $idPersona): string
{
    return $idUnidad . ':' . $idPersona;
}

function carryForwardServiceOverride(PDO $pdo, int $periodoId, string $servicio = 'AGUA'): void
{
    $stmtPeriodoActual = $pdo->prepare("SELECT anio, mes FROM periodos WHERE id_periodo = :id LIMIT 1");
    $stmtPeriodoActual->execute(['id' => $periodoId]);
    $periodoActual = $stmtPeriodoActual->fetch();
    if (!$periodoActual) {
        return;
    }

    $stmtAnterior = $pdo->prepare("
        SELECT id_periodo
        FROM periodos
        WHERE (anio, mes) < (:anio, :mes)
        ORDER BY anio DESC, mes DESC
        LIMIT 1
    ");
    $stmtAnterior->execute(['anio' => $periodoActual['anio'], 'mes' => $periodoActual['mes']]);
    $periodoAnterior = $stmtAnterior->fetch();
    if (!$periodoAnterior) {
        return;
    }

    $stmtRecibo = $pdo->prepare("SELECT id_inmueble FROM recibos_luz WHERE id_periodo = :periodoId LIMIT 1");
    $stmtRecibo->execute(['periodoId' => $periodoId]);
    $idInmueble = (int) ($stmtRecibo->fetch()['id_inmueble'] ?? 1);

    $stmtTarifa = $pdo->prepare("SELECT monto FROM tarifas_servicios WHERE id_inmueble = :in AND servicio = :servicio AND activo = 1 LIMIT 1");
    $stmtTarifa->execute(['in' => $idInmueble, 'servicio' => $servicio]);
    $tarifaEstandar = (float) ($stmtTarifa->fetch()['monto'] ?? 0);

    $stmtOverridesAnteriores = $pdo->prepare("
        SELECT id_unidad, id_persona, monto
        FROM cobros_overrides_servicio
        WHERE id_periodo = :periodoAnterior AND servicio = :servicio
    ");
    $stmtOverridesAnteriores->execute([
        'periodoAnterior' => $periodoAnterior['id_periodo'],
        'servicio' => $servicio,
    ]);

    $stmtUpsert = $pdo->prepare("
        INSERT INTO cobros_overrides_servicio (id_periodo, id_unidad, id_persona, servicio, monto, observacion)
        VALUES (:periodo, :unidad, :persona, :servicio, :monto, :observacion)
        ON DUPLICATE KEY UPDATE monto = :monto2, observacion = :observacion2, updated_at = NOW()
    ");

    foreach ($stmtOverridesAnteriores->fetchAll() as $overrideAnterior) {
        $montoAnterior = (float) $overrideAnterior['monto'];
        if ($montoAnterior <= $tarifaEstandar) {
            continue;
        }

        $stmtUpsert->execute([
            'periodo' => $periodoId,
            'unidad' => $overrideAnterior['id_unidad'],
            'persona' => $overrideAnterior['id_persona'],
            'servicio' => $servicio,
            'monto' => $montoAnterior,
            'observacion' => 'Carry-over automático desde periodo anterior',
            'monto2' => $montoAnterior,
            'observacion2' => 'Carry-over automático desde periodo anterior',
        ]);
    }
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