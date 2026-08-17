<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Recibe errores capturados en el navegador (JS no controlado, promesas
 * rechazadas, o errores puntuales que el propio código decide reportar) y
 * los deja en storage/logs/frontend.log -- mismo formato que un log de
 * backend, para poder correlacionar "qué vio el usuario" con lo que pasó
 * en el servidor durante esa misma request.
 */
class ClientLogController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'stack' => ['nullable', 'string', 'max:4000'],
            'url' => ['nullable', 'string', 'max:2000'],
            'context' => ['nullable', 'array'],
        ]);

        Log::channel('frontend')->error($data['message'], [
            'url' => $data['url'] ?? null,
            'stack' => $data['stack'] ?? null,
            'context' => $data['context'] ?? null,
            'user_id' => $request->user()?->id,
            'user_agent' => $request->userAgent(),
        ]);

        return response()->noContent();
    }
}
