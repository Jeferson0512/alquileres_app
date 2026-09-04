<?php

namespace App\Http\Controllers;

use App\Models\Periodo;
use App\Services\ReporteConsumoService;
use App\Services\ReporteFinancieroService;
use App\Services\ReporteOcupacionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReporteController extends Controller
{
    public function index(
        Request $request,
        ReporteFinancieroService $financiero,
        ReporteOcupacionService $ocupacion,
        ReporteConsumoService $consumo,
    ): Response {
        $todos = Periodo::orderBy('anio')->orderBy('mes')->get();

        [$idDesde, $idHasta] = $this->resolverRango($request, $todos);
        $indiceDesde = $todos->search(fn ($p) => $p->id_periodo === $idDesde);
        $indiceHasta = $todos->search(fn ($p) => $p->id_periodo === $idHasta);
        $rango = $todos->slice(min($indiceDesde, $indiceHasta), abs($indiceHasta - $indiceDesde) + 1)->values();

        return Inertia::render('Reportes/Index', [
            'periodos' => $todos->map(fn ($p) => ['id_periodo' => $p->id_periodo, 'mes' => $p->mes, 'anio' => $p->anio, 'estado' => $p->estado])->values(),
            'rango' => ['desde' => $rango->first()->id_periodo, 'hasta' => $rango->last()->id_periodo],
            'financiero' => $financiero->build($rango),
            'ocupacion' => $ocupacion->build($rango),
            'consumo' => $consumo->build($rango),
        ]);
    }

    /**
     * Por defecto, los ultimos 3 periodos (o todos, si hay menos de 3) --
     * mismo criterio "reciente primero" que el resto del panel.
     */
    private function resolverRango(Request $request, $todos): array
    {
        $idHasta = $request->integer('hasta') ?: $todos->last()->id_periodo;
        $defaultDesdeIndex = max(0, $todos->count() - 3);
        $idDesde = $request->integer('desde') ?: $todos->get($defaultDesdeIndex)->id_periodo;

        return [$idDesde, $idHasta];
    }
}
