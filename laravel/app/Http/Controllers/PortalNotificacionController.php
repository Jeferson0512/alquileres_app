<?php

namespace App\Http\Controllers;

use App\Services\PortalNotificacionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalNotificacionController extends Controller
{
    public function index(Request $request, PortalNotificacionService $feed): Response
    {
        $page = (int) $request->query('page', 1);

        return Inertia::render('Portal/Notificaciones', [
            'notificaciones' => $feed->paginado($request->user()->id_persona, $page),
        ]);
    }

    public function marcarLeidas(Request $request, PortalNotificacionService $feed): RedirectResponse
    {
        $feed->marcarLeidas($request->user()->id_persona);

        return back();
    }
}
