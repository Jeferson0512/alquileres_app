<?php

require 'api/config/Database.php';

$pdo = Database::getConnection();

try {
    $pdo->beginTransaction();

    // 1. CREAR PERÍODO ENERO 2026
    echo "Creando período enero...\n";
    $sqlPeriodo = "INSERT INTO periodos (anio, mes, fecha_inicio, fecha_fin, estado, observacion)
                   VALUES (2026, 1, '2026-01-01', '2026-01-31', 'CERRADO', 'Periodo facturacion enero 2026')";
    $pdo->exec($sqlPeriodo);

    // Obtener el id del período recién creado
    $stmt = $pdo->query("SELECT id_periodo FROM periodos WHERE anio = 2026 AND mes = 1 LIMIT 1");
    $periodoRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $idPeriodoEnero = $periodoRow['id_periodo'];
    echo "ID Período Enero: $idPeriodoEnero\n\n";

    // 2. INSERTAR RECIBO LUZ ENERO
    echo "Creando recibo de luz enero...\n";

    // Generar número de recibo como lo hace el sistema
    $meses = [1 => 'ENE', 2 => 'FEB', 3 => 'MAR'];
    $mes = 1;
    $anio = 2026;
    $sufijo = str_pad((string)$idPeriodoEnero, 3, '0', STR_PAD_LEFT);
    $numeroRecibo = sprintf('REC-%s-%d-%s', $meses[$mes], $anio, $sufijo);

    $sqlRecibo = "INSERT INTO recibos_luz (
        id_inmueble, id_periodo, numero_recibo, 
        lectura_anterior_general, lectura_actual_general, consumo_kwh_general,
        estado
    ) VALUES (
        1, :idPeriodo, :numeroRecibo,
        :lecturaAnterior, :lecturaActual, :consumo,
        'ACTIVO'
    )";

    $consumo = 16207.2 - 16089.9; // 117.3
    $stmt = $pdo->prepare($sqlRecibo);
    $stmt->execute([
        ':idPeriodo' => $idPeriodoEnero,
        ':numeroRecibo' => $numeroRecibo,
        ':lecturaAnterior' => 16089.9,
        ':lecturaActual' => 16207.2,
        ':consumo' => $consumo
    ]);

    $idReciboEnero = $pdo->lastInsertId();
    echo "ID Recibo Luz: $idReciboEnero - Número: $numeroRecibo\n\n";

    // 3. INSERTAR LECTURAS POR UNIDAD ENERO
    echo "Creando lecturas por unidad...\n";

    $lecturas = [
        ['id_unidad' => 1, 'anterior' => 16089.9, 'actual' => 16207.2, 'id_ocupacion' => 1],        // Primer Piso - Jeferson
        ['id_unidad' => 2, 'anterior' => 588.3, 'actual' => 610.6, 'id_ocupacion' => 2],            // 1A MILENA
        ['id_unidad' => 3, 'anterior' => 480.3, 'actual' => 534.4, 'id_ocupacion' => 3],            // 2A Julio
        ['id_unidad' => 4, 'anterior' => 803.5, 'actual' => 810.2, 'id_ocupacion' => 4],            // 3A Adrian
        ['id_unidad' => 5, 'anterior' => 1681.4, 'actual' => 1759.9, 'id_ocupacion' => 5],          // 4A Luis Quispe
        ['id_unidad' => 6, 'anterior' => 46.4, 'actual' => 46.4, 'id_ocupacion' => null],           // 5A Vacío
        ['id_unidad' => 7, 'anterior' => 52.1, 'actual' => 52.1, 'id_ocupacion' => null],           // 1B Depósito
        ['id_unidad' => 8, 'anterior' => 451.9, 'actual' => 451.9, 'id_ocupacion' => null],         // 2B COCINA
        ['id_unidad' => 9, 'anterior' => 332.4, 'actual' => 335.2, 'id_ocupacion' => null],         // 3B JOSE LUIS
        ['id_unidad' => 10, 'anterior' => 237.5, 'actual' => 250.1, 'id_ocupacion' => null],        // 4B Richard Uribe
        ['id_unidad' => 11, 'anterior' => 6.7, 'actual' => 6.7, 'id_ocupacion' => null],            // Tercer Piso 1A
        ['id_unidad' => 12, 'anterior' => 111.3, 'actual' => 135.2, 'id_ocupacion' => null],        // 1B Jim
        ['id_unidad' => 13, 'anterior' => 52.6, 'actual' => 58.9, 'id_ocupacion' => null],          // Cuarto Piso 1A MIGUEL
        ['id_unidad' => 14, 'anterior' => 0, 'actual' => 0, 'id_ocupacion' => null],                // 2B (vacío)
    ];

    $sqlLectura = "INSERT INTO lecturas_unidad (id_unidad, id_periodo, lectura_anterior, lectura_actual, id_ocupacion, estado, fecha_lectura)
                   VALUES (:id_unidad, :id_periodo, :lectura_anterior, :lectura_actual, :id_ocupacion, 'REGISTRADO', '2026-01-31')";

    $stmtLectura = $pdo->prepare($sqlLectura);
    $countLecturas = 0;

    foreach ($lecturas as $lectura) {
        $stmtLectura->execute([
            ':id_unidad' => $lectura['id_unidad'],
            ':id_periodo' => $idPeriodoEnero,
            ':lectura_anterior' => $lectura['anterior'],
            ':lectura_actual' => $lectura['actual'],
            ':id_ocupacion' => $lectura['id_ocupacion']
        ]);
        $countLecturas++;
    }

    echo "Lecturas insertadas: $countLecturas\n\n";

    $pdo->commit();

    echo "✅ DATOS DE ENERO INSERTADOS CORRECTAMENTE\n";
    echo "   Período ID: $idPeriodoEnero\n";
    echo "   Recibo ID: $idReciboEnero\n";
    echo "   Lecturas: $countLecturas\n";

} catch (Exception $e) {
    $pdo->rollBack();
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
}
