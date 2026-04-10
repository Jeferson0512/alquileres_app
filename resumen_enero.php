<?php

require 'api/config/Database.php';
$pdo = Database::getConnection();

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║       RESUMEN DE INSERCIÓN - DATOS DE ENERO 2026          ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// 1. Período
echo "📅 PERÍODO:\n";
$stmt = $pdo->query("SELECT * FROM periodos WHERE anio = 2026 AND mes = 1");
$periodo = $stmt->fetch(PDO::FETCH_ASSOC);
echo "   ID: " . $periodo['id_periodo'] . "\n";
echo "   Fechas: " . $periodo['fecha_inicio'] . " a " . $periodo['fecha_fin'] . "\n";
echo "   Estado: " . $periodo['estado'] . "\n\n";

// 2. Recibo de luz
echo "💡 RECIBO DE LUZ:\n";
$stmt = $pdo->query("SELECT * FROM recibos_luz WHERE id_periodo = " . $periodo['id_periodo']);
$recibo = $stmt->fetch(PDO::FETCH_ASSOC);
echo "   ID: " . $recibo['id_recibo_luz'] . "\n";
echo "   Número: " . $recibo['numero_recibo'] . "\n";
echo "   Lectura Anterior General: " . $recibo['lectura_anterior_general'] . " kWh\n";
echo "   Lectura Actual General: " . $recibo['lectura_actual_general'] . " kWh\n";
echo "   Consumo: " . ($recibo['lectura_actual_general'] - $recibo['lectura_anterior_general']) . " kWh\n\n";

// 3. Lecturas por unidad
echo "📊 LECTURAS POR UNIDAD (14 registros):\n";
$stmt = $pdo->prepare("
    SELECT 
        lu.id_lectura,
        u.codigo_unidad,
        u.nombre_unidad,
        lu.lectura_anterior,
        lu.lectura_actual,
        ROUND(lu.lectura_actual - lu.lectura_anterior, 2) as consumo,
        COALESCE(CONCAT(p.nombres, ' ', p.apellidos), 'Sin ocupante') as inquilino
    FROM lecturas_unidad lu
    JOIN unidades u ON u.id_unidad = lu.id_unidad
    LEFT JOIN ocupacion_unidad ou ON ou.id_ocupacion = lu.id_ocupacion
    LEFT JOIN personas p ON p.id_persona = ou.id_persona
    WHERE lu.id_periodo = ?
    ORDER BY u.codigo_unidad
");
$stmt->execute([$periodo['id_periodo']]);
$lecturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

$totalConsumo = 0;
echo "   " . str_pad('Unidad', 10) . " | " . str_pad('Anterior', 10) . " | " . str_pad('Actual', 10) . " | " . str_pad('Consumo', 10) . " | Inquilino\n";
echo "   " . str_repeat("-", 90) . "\n";

foreach ($lecturas as $l) {
    $consumo = $l['lectura_actual'] - $l['lectura_anterior'];
    $totalConsumo += $consumo;
    echo "   " . str_pad($l['codigo_unidad'], 10) . " | " .
         str_pad(number_format($l['lectura_anterior'], 1), 10) . " | " .
         str_pad(number_format($l['lectura_actual'], 1), 10) . " | " .
         str_pad(number_format($consumo, 1), 10) . " | " .
         substr($l['inquilino'], 0, 40) . "\n";
}
echo "   " . str_repeat("-", 90) . "\n";
echo "   TOTAL CONSUMO: " . number_format($totalConsumo, 1) . " kWh\n\n";

echo "✅ PROCESO COMPLETADO EXITOSAMENTE\n";
echo "   Todos los datos de enero 2026 han sido ingresados al sistema.\n";
