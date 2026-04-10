<?php

require_once __DIR__ . '/../../config/helpers.php';

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method !== 'POST') {
        jsonResponse(['ok' => false, 'message' => 'Metodo no permitido'], 405);
    }

    if (empty($_FILES['qr']) || !is_uploaded_file($_FILES['qr']['tmp_name'])) {
        jsonResponse(['ok' => false, 'message' => 'No se recibio ningun archivo QR'], 422);
    }

    $file = $_FILES['qr'];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        jsonResponse(['ok' => false, 'message' => 'No se pudo procesar el archivo QR'], 422);
    }

    $maxBytes = 5 * 1024 * 1024;
    if (($file['size'] ?? 0) > $maxBytes) {
        jsonResponse(['ok' => false, 'message' => 'El archivo QR supera el limite permitido de 5 MB'], 422);
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($file['tmp_name']) ?: '';
    $allowed = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp',
    ];

    if (!isset($allowed[$mime])) {
        jsonResponse(['ok' => false, 'message' => 'El QR debe ser una imagen PNG, JPG o WEBP'], 422);
    }

    $projectRoot = dirname(__DIR__, 3);
    $targetDir = $projectRoot . '/public/uploads/qr';
    if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
        throw new RuntimeException('No se pudo crear la carpeta de uploads del QR');
    }

    $fileName = 'qr-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $allowed[$mime];
    $targetPath = $targetDir . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new RuntimeException('No se pudo guardar el archivo QR');
    }

    jsonResponse([
        'ok' => true,
        'message' => 'QR subido correctamente',
        'data' => [
            'path' => 'uploads/qr/' . $fileName,
            'mime' => $mime,
            'size' => (int) $file['size'],
        ],
    ]);
} catch (Throwable $e) {
    jsonResponse(['ok' => false, 'message' => $e->getMessage()], 500);
}
