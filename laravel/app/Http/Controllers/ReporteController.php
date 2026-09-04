<?php

namespace App\Http\Controllers;

use App\Models\Inmueble;
use App\Models\Periodo;
use App\Services\ReporteConsumoService;
use App\Services\ReporteFinancieroService;
use App\Services\ReporteOcupacionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        ['todos' => $todos, 'rango' => $rango] = $this->rangoDePeriodos($request);

        return Inertia::render('Reportes/Index', [
            'periodos' => $todos->map(fn ($p) => ['id_periodo' => $p->id_periodo, 'mes' => $p->mes, 'anio' => $p->anio, 'estado' => $p->estado])->values(),
            'rango' => ['desde' => $rango->first()->id_periodo, 'hasta' => $rango->last()->id_periodo],
            'financiero' => $financiero->build($rango),
            'ocupacion' => $ocupacion->build($rango),
            'consumo' => $consumo->build($rango),
        ]);
    }

    public function exportarFinancieroPdf(Request $request, ReporteFinancieroService $financiero)
    {
        ['rango' => $rango] = $this->rangoDePeriodos($request);

        $pdf = Pdf::loadView('reportes.financiero-pdf', [
            'inmueble' => Inmueble::activoActual(),
            'rangoLabel' => $this->rangoLabel($rango),
            'generadoEl' => now()->format('d/m/Y H:i'),
            'financiero' => $financiero->build($rango),
        ])->setPaper('letter');

        return $pdf->stream('reporte-financiero-'.now()->format('Ymd-His').'.pdf');
    }

    public function exportarOcupacionPdf(Request $request, ReporteOcupacionService $ocupacion)
    {
        ['rango' => $rango] = $this->rangoDePeriodos($request);

        $pdf = Pdf::loadView('reportes.ocupacion-pdf', [
            'inmueble' => Inmueble::activoActual(),
            'rangoLabel' => $this->rangoLabel($rango),
            'generadoEl' => now()->format('d/m/Y H:i'),
            'ocupacion' => $ocupacion->build($rango),
        ])->setPaper('letter');

        return $pdf->stream('reporte-ocupacion-'.now()->format('Ymd-His').'.pdf');
    }

    public function exportarConsumoPdf(Request $request, ReporteConsumoService $consumo)
    {
        ['rango' => $rango] = $this->rangoDePeriodos($request);

        $pdf = Pdf::loadView('reportes.consumo-pdf', [
            'inmueble' => Inmueble::activoActual(),
            'rangoLabel' => $this->rangoLabel($rango),
            'generadoEl' => now()->format('d/m/Y H:i'),
            'consumo' => $consumo->build($rango),
        ])->setPaper('letter');

        return $pdf->stream('reporte-consumo-'.now()->format('Ymd-His').'.pdf');
    }

    /**
     * Por defecto, los ultimos 3 periodos (o todos, si hay menos de 3) --
     * mismo criterio "reciente primero" que el resto del panel.
     */
    private function rangoDePeriodos(Request $request): array
    {
        $todos = Periodo::orderBy('anio')->orderBy('mes')->get();

        $idHasta = $request->integer('hasta') ?: $todos->last()->id_periodo;
        $defaultDesdeIndex = max(0, $todos->count() - 3);
        $idDesde = $request->integer('desde') ?: $todos->get($defaultDesdeIndex)->id_periodo;

        $indiceDesde = $todos->search(fn ($p) => $p->id_periodo === $idDesde);
        $indiceHasta = $todos->search(fn ($p) => $p->id_periodo === $idHasta);
        $rango = $todos->slice(min($indiceDesde, $indiceHasta), abs($indiceHasta - $indiceDesde) + 1)->values();

        return ['todos' => $todos, 'rango' => $rango];
    }

    private function rangoLabel(Collection $rango): string
    {
        $meses = [1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic'];
        $primero = $rango->first();
        $ultimo = $rango->last();
        if ($primero->id_periodo === $ultimo->id_periodo) {
            return $meses[$primero->mes].' '.$primero->anio;
        }

        return $meses[$primero->mes].' '.$primero->anio.' – '.$meses[$ultimo->mes].' '.$ultimo->anio;
    }
}
