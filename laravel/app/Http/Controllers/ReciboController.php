<?php

namespace App\Http\Controllers;

use App\Models\Inmueble;
use App\Models\Periodo;
use App\Models\ReciboLuz;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class ReciboController extends Controller
{
    public function index(Request $request): Response
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $recibo = ReciboLuz::where('id_periodo', $periodo->id_periodo)->first();

        if (!$recibo) {
            $anterior = $periodo->anterior();
            $reciboPrev = $anterior ? ReciboLuz::where('id_periodo', $anterior->id_periodo)->first() : null;

            $recibo = [
                'id_recibo_luz' => null,
                'id_inmueble' => Inmueble::activoActual()->id_inmueble,
                'id_periodo' => $periodo->id_periodo,
                'numero_recibo' => $this->autoNumeroRecibo($periodo),
                'numero_suministro' => null,
                'fecha_emision' => null,
                'fecha_vencimiento' => null,
                'lectura_anterior_general' => $reciboPrev?->lectura_actual_general ?? 0,
                'lectura_actual_general' => 0,
                'consumo_kwh_general' => 0,
                'precio_kwh' => 0,
                'consumo_energia' => 0,
                'cargo_fijo' => 0,
                'mant_reposicion' => 0,
                'alumbrado_publico' => 0,
                'subtotal' => 0,
                'igv' => 0,
                'electrificacion_rural' => 0,
                'ajuste_redondeo_anterior' => 0,
                'ajuste_redondeo_actual' => 0,
                'total_recibo' => 0,
                'observacion' => null,
                'estado' => 'ACTIVO',
            ];
        }

        return Inertia::render('Recibo/Index', [
            'periodo' => $periodo,
            'periodos' => Periodo::orderByDesc('anio')->orderByDesc('mes')->get(['id_periodo', 'anio', 'mes', 'estado']),
            'recibo' => $recibo,
            'tieneAnterior' => $periodo->anterior() !== null,
        ]);
    }

    private function autoNumeroRecibo(Periodo $periodo): string
    {
        $meses = [1 => 'ENE', 2 => 'FEB', 3 => 'MAR', 4 => 'ABR', 5 => 'MAY', 6 => 'JUN', 7 => 'JUL', 8 => 'AGO', 9 => 'SEP', 10 => 'OCT', 11 => 'NOV', 12 => 'DIC'];
        $sufijo = str_pad((string) $periodo->id_periodo, 3, '0', STR_PAD_LEFT);

        return sprintf('REC-%s-%d-%s', $meses[$periodo->mes] ?? 'MES', $periodo->anio, $sufijo);
    }

    private function rules(): array
    {
        return [
            'numero_suministro' => ['nullable', 'string', 'max:30'],
            'fecha_emision' => ['nullable', 'date'],
            'fecha_vencimiento' => ['nullable', 'date'],
            'lectura_anterior_general' => ['nullable', 'numeric'],
            'lectura_actual_general' => ['nullable', 'numeric'],
            'precio_kwh' => ['nullable', 'numeric', 'min:0'],
            'consumo_energia' => ['nullable', 'numeric'],
            'cargo_fijo' => ['nullable', 'numeric'],
            'mant_reposicion' => ['nullable', 'numeric'],
            'alumbrado_publico' => ['nullable', 'numeric'],
            'subtotal' => ['nullable', 'numeric'],
            'igv' => ['nullable', 'numeric'],
            'electrificacion_rural' => ['nullable', 'numeric'],
            'ajuste_redondeo_anterior' => ['nullable', 'numeric'],
            'ajuste_redondeo_actual' => ['nullable', 'numeric'],
            'total_recibo' => ['nullable', 'numeric'],
            'observacion' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function store(Request $request): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $data = $request->validate($this->rules());
        $data['id_inmueble'] = Inmueble::activoActual()->id_inmueble;
        $data['id_periodo'] = $periodo->id_periodo;
        $data['numero_recibo'] = $this->autoNumeroRecibo($periodo);
        $data['consumo_kwh_general'] = max(($data['lectura_actual_general'] ?? 0) - ($data['lectura_anterior_general'] ?? 0), 0);
        $data['estado'] = 'ACTIVO';

        ReciboLuz::updateOrCreate(['id_periodo' => $periodo->id_periodo], $data);

        return back()->with('success', 'Recibo guardado correctamente');
    }

    public function copyFromPrevious(Request $request): RedirectResponse
    {
        $periodo = Periodo::actual($request->integer('periodo_id') ?: null);
        $periodo->assertEditable();

        $anterior = $periodo->anterior();
        if (!$anterior) {
            return back()->withErrors(['general' => 'No existe un periodo anterior para copiar']);
        }

        $reciboPrev = ReciboLuz::where('id_periodo', $anterior->id_periodo)->first();
        if (!$reciboPrev) {
            return back()->withErrors(['general' => 'El periodo anterior no tiene recibo registrado']);
        }

        $data = Arr::only($reciboPrev->toArray(), array_keys($this->rules()));
        $data['id_inmueble'] = $reciboPrev->id_inmueble;
        $data['id_periodo'] = $periodo->id_periodo;
        $data['numero_recibo'] = $this->autoNumeroRecibo($periodo);
        $data['estado'] = 'ACTIVO';

        ReciboLuz::updateOrCreate(['id_periodo' => $periodo->id_periodo], $data);

        return back()->with('success', 'Recibo copiado desde el periodo anterior');
    }
}
