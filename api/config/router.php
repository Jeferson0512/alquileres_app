<?php

$path = $_GET['path'] ?? '';
$path = trim($path, '/');

$modulesBase = dirname(__DIR__) . '/modules';

$routes = [
    'dashboard' => $modulesBase . '/dashboard/index.php',
    'recibo' => $modulesBase . '/recibo/index.php',
    'lecturas' => $modulesBase . '/lecturas/index.php',
    'lecturas/save' => $modulesBase . '/lecturas/save.php',
    'lecturas/sync' => $modulesBase . '/lecturas/sync.php',
    'liquidacion/preview' => $modulesBase . '/liquidacion/preview.php',
    'liquidacion/generate' => $modulesBase . '/liquidacion/generate.php',
    'cobros' => $modulesBase . '/cobros/index.php',
    'cobros/detalle' => $modulesBase . '/cobros/detail.php',
    'cobros/deuda-anterior' => $modulesBase . '/cobros/deuda-anterior.php',
    'cobros/generate' => $modulesBase . '/cobros/generate.php',
    'cobros/force-refresh' => $modulesBase . '/cobros/force-refresh.php',
    'cobros/overrides' => $modulesBase . '/cobros/overrides.php',
    'inquilinos' => $modulesBase . '/inquilinos/index.php',
    'unidades' => $modulesBase . '/unidades/index.php',
    'ocupaciones' => $modulesBase . '/ocupaciones/index.php',
    'unidades/medidor-compartido' => $modulesBase . '/unidades/medidor-compartido.php',
    'pagos' => $modulesBase . '/pagos/index.php',
    'pagos/reversa' => $modulesBase . '/pagos/reversa.php',
    'pagos/auditoria' => $modulesBase . '/pagos/auditoria.php',
    'periodos' => $modulesBase . '/periodos/index.php',
    'tarifas' => $modulesBase . '/tarifas/index.php',
    'avisos/vencimientos' => $modulesBase . '/avisos/index.php',
    'config-cobranza' => $modulesBase . '/config-cobranza/index.php',
    'config-cobranza/upload-qr' => $modulesBase . '/config-cobranza/upload-qr.php',
    'testing/e2e-seed' => $modulesBase . '/testing/e2e-seed.php',
    'testing/e2e-cleanup' => $modulesBase . '/testing/e2e-cleanup.php',
];

if (!isset($routes[$path])) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => 'Ruta API no encontrada'
    ]);
    exit;
}

$target = $routes[$path];
if (!is_file($target)) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'ok' => false,
        'message' => 'Archivo del modulo no encontrado: ' . basename($target)
    ]);
    exit;
}

require $target;
