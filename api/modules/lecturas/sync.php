<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/helpers.php';

try {
    $pdo = Database::getConnection();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method !== 'POST') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    $periodoId = getPeriodoId($pdo);
    assertPeriodoEditable($pdo, $periodoId);
    $periodo = getPeriodoRow($pdo, $periodoId);

    $fechaInicio = $periodo['fecha_inicio'];
    $fechaFin = $periodo['fecha_fin'];

    $selUnidades = $pdo->query("SELECT id_unidad FROM unidades WHERE estado = 'ACTIVO' ORDER BY id_unidad");
    $unidades = $selUnidades->fetchAll();

    $selLectura = $pdo->prepare("SELECT id_lectura, lectura_actual FROM lecturas_unidad WHERE id_periodo = :periodo AND id_unidad = :unidad LIMIT 1");
    $selPrev = $pdo->prepare("
                SELECT l.lectura_actual
                FROM lecturas_unidad l
                INNER JOIN periodos p ON p.id_periodo = l.id_periodo
                WHERE l.id_unidad = :unidad
                    AND p.fecha_fin <= :fecha_inicio_actual
                    AND p.id_periodo <> :periodo_actual
                ORDER BY p.fecha_fin DESC, l.id_lectura DESC
                LIMIT 1
        ");
    $selOcup = $pdo->prepare(" 
        SELECT id_ocupacion
        FROM ocupacion_unidad
        WHERE id_unidad = :unidad
          AND estado != 'ANULADO'
          AND fecha_inicio <= :fecha_fin
          AND (fecha_fin IS NULL OR fecha_fin >= :fecha_inicio)
        ORDER BY fecha_inicio DESC, id_ocupacion DESC
        LIMIT 1
    ");

    $upd = $pdo->prepare(" 
        UPDATE lecturas_unidad
        SET id_ocupacion = :ocupacion,
            lectura_anterior = :lectura_anterior,
            lectura_actual = GREATEST(lectura_actual, :lectura_actual_minima),
            updated_at = NOW()
        WHERE id_lectura = :id_lectura
    ");

    $ins = $pdo->prepare(" 
        INSERT INTO lecturas_unidad (
            id_periodo,
            id_unidad,
            id_ocupacion,
            lectura_anterior,
            lectura_actual,
            fecha_lectura,
            estado,
            created_at
        ) VALUES (
            :periodo,
            :unidad,
            :ocupacion,
            :lectura_anterior,
            :lectura_actual,
            :fecha_lectura,
            'REGISTRADO',
            NOW()
        )
    ");

    $pdo->beginTransaction();

    $insertados = 0;
    $actualizados = 0;

    foreach ($unidades as $u) {
        $idUnidad = (int) $u['id_unidad'];

        $selOcup->execute([
            'unidad' => $idUnidad,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
        ]);
        $oc = $selOcup->fetch();
        $idOcupacion = $oc ? (int) $oc['id_ocupacion'] : null;

        $selPrev->execute([
            'unidad' => $idUnidad,
            'fecha_inicio_actual' => $fechaInicio,
            'periodo_actual' => $periodoId,
        ]);
        $prev = $selPrev->fetch();
        $anterior = $prev ? (float) $prev['lectura_actual'] : 0;

        $selLectura->execute(['periodo' => $periodoId, 'unidad' => $idUnidad]);
        $lect = $selLectura->fetch();

        if ($lect) {
            $upd->execute([
                'ocupacion' => $idOcupacion,
                'lectura_anterior' => $anterior,
                'lectura_actual_minima' => $anterior,
                'id_lectura' => (int) $lect['id_lectura'],
            ]);
            $actualizados++;
            continue;
        }

        $ins->execute([
            'periodo' => $periodoId,
            'unidad' => $idUnidad,
            'ocupacion' => $idOcupacion,
            'lectura_anterior' => $anterior,
            'lectura_actual' => $anterior,
            'fecha_lectura' => $fechaFin,
        ]);
        $insertados++;
    }

    $pdo->commit();

    jsonResponse([
        'ok' => true,
        'message' => 'Lecturas sincronizadas correctamente',
        'data' => [
            'insertados' => $insertados,
            'actualizados' => $actualizados,
            'periodo_id' => $periodoId,
        ],
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    jsonResponse([
        'ok' => false,
        'message' => $e->getMessage(),
    ], 500);
}
