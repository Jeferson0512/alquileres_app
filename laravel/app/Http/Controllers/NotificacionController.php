<?php

namespace App\Http\Controllers;

use App\Services\NotificacionFeedService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Historial completo de avisos para el staff (renovaciones de contrato
 * pendientes, comprobantes de pago subidos por inquilinos) -- la campanita
 * del header solo muestra un resumen reciente, esta pagina es donde se
 * puede repasar todo con calma y filtrar por estado.
 */
class NotificacionController extends Controller
{
    public function index(Request $request, NotificacionFeedService $feed): Response
    {
        $estado = $request->query('estado', 'PENDIENTE');
        $page = (int) $request->query('page', 1);

        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => $feed->paginado($estado, $page),
            'estadoFiltro' => $estado,
        ]);
    }

    public function marcarLeidas(NotificacionFeedService $feed): RedirectResponse
    {
        $feed->marcarTodasLeidas();

        return back();
    }
}
