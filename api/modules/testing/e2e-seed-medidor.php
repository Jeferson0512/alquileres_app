<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../cobros/common.php';

/**
 * Seed E2E aislado para probar el reparto de medidor compartido
 * (unidades_medidor_compartido) a traves de la MISMA funcion que usa
 * cobros/generate.php (buildCobrosProgramados) -- no duplica la logica de
 * reparto, solo arma datos minimos para ejercitarla.
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
    if ($marker === '' || strpos($marker, 'E2E_') !== 0) {
        jsonResponse(['ok' => false, 'message' => 'marker invalido para seed E2E'], 422);
    }

    $porcentajeDependiente = 25.0;
    $totalPagarLuzTitular = 200.00;

    $pdo = Database::getConnection();
    $periodoId = getPeriodoId($pdo);

    $pdo->beginTransaction();

    $crearPersona = function (string $sufijo) use ($pdo, $marker) {
        $doc = str_pad((string) random_int(10000000, 99999999), 8, '0', STR_PAD_LEFT);
        $stmt = $pdo->prepare("
            INSERT INTO personas (tipo_persona, nombres, apellidos, tipo_documento, numero_documento, observacion, estado)
            VALUES ('INQUILINO', :nombres, 'TEST', 'DNI', :numero_documento, :observacion, 'ACTIVO')
        ");
        $stmt->execute([
            'nombres' => 'E2E ' . $marker . ' ' . $sufijo,
            'numero_documento' => $doc,
            'observacion' => $marker,
        ]);
        return (int) $pdo->lastInsertId();
    };

    $crearUnidad = function (string $sufijo, float $tarifaAlquiler) use ($pdo, $marker) {
        $codigo = 'E2M' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 11)) . $sufijo;
        $stmt = $pdo->prepare("
            INSERT INTO unidades (id_inmueble, codigo_unidad, nombre_unidad, piso, tipo_unidad, tiene_medidor, medidor_codigo, tarifa_alquiler_base, observacion, estado)
            VALUES (1, :codigo_unidad, :nombre_unidad, 9, 'CUARTO', :tiene_medidor, :medidor_codigo, :tarifa_alquiler, :observacion, 'ACTIVO')
        ");
        $stmt->execute([
            'codigo_unidad' => $codigo,
            'nombre_unidad' => 'Unidad medidor ' . $marker . ' ' . $sufijo,
            'tiene_medidor' => $sufijo === 'DEP' ? 'NO' : 'SI',
            'medidor_codigo' => $sufijo === 'DEP' ? null : $marker,
            'tarifa_alquiler' => $tarifaAlquiler,
            'observacion' => $marker,
        ]);
        return ['id' => (int) $pdo->lastInsertId(), 'codigo' => $codigo];
    };

    $crearOcupacion = function (int $idUnidad, int $idPersona, float $montoAlquiler) use ($pdo, $marker) {
        $stmt = $pdo->prepare("
            INSERT INTO ocupacion_unidad (id_unidad, id_persona, fecha_inicio, monto_alquiler, garantia, estado, observacion)
            VALUES (:id_unidad, :id_persona, CURDATE(), :monto_alquiler, :garantia, 'ACTIVO', :observacion)
        ");
        $stmt->execute([
            'id_unidad' => $idUnidad,
            'id_persona' => $idPersona,
            'monto_alquiler' => $montoAlquiler,
            'garantia' => $montoAlquiler,
            'observacion' => $marker,
        ]);
        return (int) $pdo->lastInsertId();
    };

    $idPersonaTitular = $crearPersona('TITULAR');
    $idPersonaDependiente = $crearPersona('DEPENDIENTE');

    $unidadTitular = $crearUnidad('TIT', 350.00);
    $unidadDependiente = $crearUnidad('DEP', 250.00);

    $idOcupacionTitular = $crearOcupacion($unidadTitular['id'], $idPersonaTitular, 350.00);
    $idOcupacionDependiente = $crearOcupacion($unidadDependiente['id'], $idPersonaDependiente, 250.00);

    $stmt = $pdo->prepare("
        INSERT INTO lecturas_unidad (id_periodo, id_unidad, id_ocupacion, lectura_anterior, lectura_actual, estado, observacion)
        VALUES (:id_periodo, :id_unidad, :id_ocupacion, 0, 100, 'REGISTRADO', :observacion)
    ");
    $stmt->execute([
        'id_periodo' => $periodoId,
        'id_unidad' => $unidadTitular['id'],
        'id_ocupacion' => $idOcupacionTitular,
        'observacion' => $marker,
    ]);
    $idLectura = (int) $pdo->lastInsertId();

    $stmtRecibo = $pdo->prepare('SELECT id_recibo_luz, id_inmueble FROM recibos_luz WHERE id_periodo = :id_periodo LIMIT 1');
    $stmtRecibo->execute(['id_periodo' => $periodoId]);
    $recibo = $stmtRecibo->fetch();
    if (!$recibo) {
        throw new RuntimeException('No existe recibo de luz para el periodo activo; no se puede sembrar el escenario de medidor compartido.');
    }

    $stmt = $pdo->prepare("
        INSERT INTO liquidacion_luz_detalle (id_periodo, id_inmueble, id_unidad, id_persona, id_lectura, id_recibo_luz, consumo_kwh, porcentaje_participacion, monto_consumo, gasto_comun, ajuste, total_pagar_luz, estado, observacion)
        VALUES (:id_periodo, :id_inmueble, :id_unidad, :id_persona, :id_lectura, :id_recibo_luz, 100, 0, :monto_consumo, 0, 0, :total_pagar_luz, 'GENERADO', :observacion)
    ");
    $stmt->execute([
        'id_periodo' => $periodoId,
        'id_inmueble' => $recibo['id_inmueble'],
        'id_unidad' => $unidadTitular['id'],
        'id_persona' => $idPersonaTitular,
        'id_lectura' => $idLectura,
        'id_recibo_luz' => $recibo['id_recibo_luz'],
        'monto_consumo' => $totalPagarLuzTitular,
        'total_pagar_luz' => $totalPagarLuzTitular,
        'observacion' => $marker,
    ]);

    $stmt = $pdo->prepare("
        INSERT INTO unidades_medidor_compartido (id_unidad_titular, id_unidad_dependiente, porcentaje_dependiente, activo, observacion)
        VALUES (:id_titular, :id_dependiente, :porcentaje, 1, :observacion)
    ");
    $stmt->execute([
        'id_titular' => $unidadTitular['id'],
        'id_dependiente' => $unidadDependiente['id'],
        'porcentaje' => $porcentajeDependiente,
        'observacion' => $marker,
    ]);
    $idRelacion = (int) $pdo->lastInsertId();

    $pdo->commit();

    // Ejercita la MISMA funcion que usa cobros/generate.php -- no se
    // persiste ningun cobro todavia, solo se lee el reparto "programado".
    $programados = buildCobrosProgramados($pdo, $periodoId);
    $filaTitular = null;
    $filaDependiente = null;
    foreach ($programados as $fila) {
        if ($fila['id_unidad'] === $unidadTitular['id']) {
            $filaTitular = $fila;
        }
        if ($fila['id_unidad'] === $unidadDependiente['id']) {
            $filaDependiente = $fila;
        }
    }

    jsonResponse([
        'ok' => true,
        'data' => [
            'marker' => $marker,
            'periodo_id' => $periodoId,
            'porcentaje_dependiente' => $porcentajeDependiente,
            'total_pagar_luz_titular' => $totalPagarLuzTitular,
            'id_relacion' => $idRelacion,
            'titular' => [
                'id_persona' => $idPersonaTitular, 'id_unidad' => $unidadTitular['id'], 'id_ocupacion' => $idOcupacionTitular,
                'codigo_unidad' => $unidadTitular['codigo'], 'monto_luz_programado' => $filaTitular['monto_luz'] ?? null,
            ],
            'dependiente' => [
                'id_persona' => $idPersonaDependiente, 'id_unidad' => $unidadDependiente['id'], 'id_ocupacion' => $idOcupacionDependiente,
                'codigo_unidad' => $unidadDependiente['codigo'], 'monto_luz_programado' => $filaDependiente['monto_luz'] ?? null,
            ],
        ],
    ], 201);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
