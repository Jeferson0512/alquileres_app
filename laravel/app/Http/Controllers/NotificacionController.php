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
        $estado = $request->query('estado', 'TODAS');
        $page = (int) $request->query('page', 1);

        return Inertia::render('Notificaciones/Index', [
            // OJO: no llamar esta prop "notificaciones" -- ese nombre ya lo
            // comparte globalmente HandleInertiaRequests (array plano para
            // la campanita) y un prop de página con el mismo nombre lo pisa,
            // rompiendo la campanita en esta misma pantalla (paginador
            // {data,links,...} en vez de array -- items.filter explota).
            'feed' => $feed->paginado($estado, $page),
            'estadoFiltro' => $estado,
            // Total real sin leer (todas las páginas/filtros) -- si se
            // calculara solo con lo que trae la página actual, el botón
            // "marcar todas leídas" podría quedar mal habilitado/deshabilitado.
            'totalSinLeer' => $feed->totalSinLeer(),
        ]);
    }

    public function marcarLeidas(NotificacionFeedService $feed): RedirectResponse
    {
        $feed->marcarTodasLeidas();

        return back();
    }
}
