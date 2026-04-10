<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../pagos/common.php';

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
    if ($marker === '' || strpos($marker, 'E2E_') !== 0) {
        jsonResponse(['ok' => false, 'message' => 'marker invalido para seed E2E'], 422);
    }

    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);

    $stmtPeriodo = $pdo->prepare('SELECT anio, mes, fecha_inicio, fecha_fin FROM periodos WHERE id_periodo = :id LIMIT 1');
    $stmtPeriodo->execute(['id' => $periodoId]);
    $periodo = $stmtPeriodo->fetch();
    if (!$periodo) {
        throw new RuntimeException('Periodo activo no encontrado para seed E2E');
    }

    $stmtRecibo = $pdo->prepare('SELECT fecha_vencimiento FROM recibos_luz WHERE id_periodo = :id LIMIT 1');
    $stmtRecibo->execute(['id' => $periodoId]);
    $recibo = $stmtRecibo->fetch();

    $fechaInicio = $periodo['fecha_inicio'] ?: date('Y-m-01');
    $fechaVencimiento = $recibo['fecha_vencimiento'] ?? $periodo['fecha_fin'] ?? date('Y-m-t');

    $montoAlquiler = 350.00;
    $montoLuz = 50.00;
    $montoAgua = 15.00;
    $montoGas = 0.00;
    $montoOtros = 0.00;
    $ajusteMinimoLuz = 0.00;
    $totalCobrar = round($montoAlquiler + $montoLuz + $montoAgua + $montoGas + $montoOtros + $ajusteMinimoLuz, 2);

    $doc = str_pad((string) random_int(10000000, 99999999), 8, '0', STR_PAD_LEFT);
    $codigoUnidad = 'E2' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));

    $pdo->beginTransaction();

    $stmt = $pdo->prepare(" 
        INSERT INTO personas (
            tipo_persona,
            nombres,
            apellidos,
            tipo_documento,
            numero_documento,
            celular,
            email,
            direccion,
            observacion,
            estado
        ) VALUES (
            'INQUILINO',
            :nombres,
            :apellidos,
            'DNI',
            :numero_documento,
            '999000111',
            NULL,
            NULL,
            :observacion,
            'ACTIVO'
        )
    ");
    $stmt->execute([
        'nombres' => 'E2E ' . $marker,
        'apellidos' => 'TEST',
        'numero_documento' => $doc,
        'observacion' => $marker,
    ]);
    $idPersona = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare(" 
        INSERT INTO unidades (
            id_inmueble,
            codigo_unidad,
            nombre_unidad,
            piso,
            tipo_unidad,
            tiene_medidor,
            medidor_codigo,
            tarifa_alquiler_base,
            observacion,
            estado
        ) VALUES (
            1,
            :codigo_unidad,
            :nombre_unidad,
            9,
            'CUARTO',
            'SI',
            :medidor_codigo,
            :tarifa_alquiler,
            :observacion,
            'ACTIVO'
        )
    ");
    $stmt->execute([
        'codigo_unidad' => $codigoUnidad,
        'nombre_unidad' => 'Unidad ' . $marker,
        'medidor_codigo' => $marker,
        'tarifa_alquiler' => $montoAlquiler,
        'observacion' => $marker,
    ]);
    $idUnidad = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare(" 
        INSERT INTO ocupacion_unidad (
            id_unidad,
            id_persona,
            fecha_inicio,
            fecha_fin,
            monto_alquiler,
            garantia,
            estado,
            observacion
        ) VALUES (
            :id_unidad,
            :id_persona,
            :fecha_inicio,
            NULL,
            :monto_alquiler,
            :garantia,
            'ACTIVO',
            :observacion
        )
    ");
    $stmt->execute([
        'id_unidad' => $idUnidad,
        'id_persona' => $idPersona,
        'fecha_inicio' => $fechaInicio,
        'monto_alquiler' => $montoAlquiler,
        'garantia' => $montoAlquiler,
        'observacion' => $marker,
    ]);
    $idOcupacion = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare(" 
        INSERT INTO cobros_mensuales (
            id_periodo,
            id_persona,
            id_unidad,
            monto_alquiler,
            monto_luz,
            ajuste_minimo_luz,
            monto_agua,
            monto_gas,
            otros_conceptos,
            descuento,
            mora,
            total_cobrar,
            fecha_vencimiento,
            estado_pago,
            observacion
        ) VALUES (
            :id_periodo,
            :id_persona,
            :id_unidad,
            :monto_alquiler,
            :monto_luz,
            :ajuste_minimo_luz,
            :monto_agua,
            :monto_gas,
            :otros_conceptos,
            0,
            0,
            :total_cobrar,
            :fecha_vencimiento,
            'PENDIENTE',
            :observacion
        )
    ");
    $stmt->execute([
        'id_periodo' => $periodoId,
        'id_persona' => $idPersona,
        'id_unidad' => $idUnidad,
        'monto_alquiler' => $montoAlquiler,
        'monto_luz' => $montoLuz,
        'ajuste_minimo_luz' => $ajusteMinimoLuz,
        'monto_agua' => $montoAgua,
        'monto_gas' => $montoGas,
        'otros_conceptos' => $montoOtros,
        'total_cobrar' => $totalCobrar,
        'fecha_vencimiento' => $fechaVencimiento,
        'observacion' => 'Seed E2E ' . $marker,
    ]);
    $idCobro = (int) $pdo->lastInsertId();

    if (pagosDetalleSchemaDisponible($pdo)) {
        $stmtConceptos = $pdo->query("SELECT id_concepto, codigo FROM conceptos_cobro WHERE codigo IN ('ALQUILER','LUZ','AGUA')");
        $conceptos = [];
        foreach ($stmtConceptos->fetchAll() as $row) {
            $conceptos[$row['codigo']] = (int) $row['id_concepto'];
        }

        $stmtDetalle = $pdo->prepare(" 
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

        if (isset($conceptos['ALQUILER'])) {
            $stmtDetalle->execute([
                'id_cobro' => $idCobro,
                'id_concepto' => $conceptos['ALQUILER'],
                'monto_programado' => $montoAlquiler,
                'descripcion' => 'Alquiler',
                'orden_visual' => 10,
            ]);
        }

        if (isset($conceptos['LUZ'])) {
            $stmtDetalle->execute([
                'id_cobro' => $idCobro,
                'id_concepto' => $conceptos['LUZ'],
                'monto_programado' => $montoLuz,
                'descripcion' => 'Luz',
                'orden_visual' => 20,
            ]);
        }

        if (isset($conceptos['AGUA'])) {
            $stmtDetalle->execute([
                'id_cobro' => $idCobro,
                'id_concepto' => $conceptos['AGUA'],
                'monto_programado' => $montoAgua,
                'descripcion' => 'Agua',
                'orden_visual' => 30,
            ]);
        }
    }

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'data' => [
            'marker' => $marker,
            'periodo_id' => $periodoId,
            'id_persona' => $idPersona,
            'id_unidad' => $idUnidad,
            'id_ocupacion' => $idOcupacion,
            'id_cobro' => $idCobro,
            'codigo_unidad' => $codigoUnidad,
            'total_cobrar' => $totalCobrar,
            'fecha_vencimiento' => $fechaVencimiento,
        ],
    ], 201);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
