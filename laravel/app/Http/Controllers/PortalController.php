<?php

namespace App\Http\Controllers;

use App\Models\ComprobantePago;
use App\Models\ConfigCobranza;
use App\Models\Inmueble;
use App\Models\OcupacionUnidad;
use App\Services\AvisoService;
use App\Services\CobroService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Portal para el rol Inquilino -- ver docs del plan "Portal de Inquilinos".
 * Todas las consultas filtran explicitamente por el id_persona del usuario
 * autenticado, nunca por un parametro de la URL. Este controller en si es
 * de solo lectura; la unica escritura del portal (subir un comprobante de
 * pago) vive en PortalComprobanteController y repite la misma regla.
 */
class PortalController extends Controller
{
    public function index(Request $request, CobroService $cobroService, AvisoService $avisoService): Response
    {
        $user = $request->user();
        abort_unless($user->id_persona, 403, 'Tu cuenta no está vinculada a ningún inquilino.');

        $ocupacion = OcupacionUnidad::where('id_persona', $user->id_persona)
            ->where('estado', 'ACTIVO')
            ->with('unidad')
            ->first();

        $vencimiento = collect($avisoService->vencimientosContrato())
            ->firstWhere('id_persona', $user->id_persona);

        $config = ConfigCobranza::where('id_inmueble', Inmueble::activoActual()->id_inmueble)->first();
        $cobros = $cobroService->listarParaPersona($user->id_persona);

        return Inertia::render('Portal/Index', [
            'persona' => $user->persona->only(['nombres', 'apellidos']),
            'ocupacion' => $ocupacion,
            'cobros' => $cobros,
            'racha' => $this->racha($cobros),
            'vencimiento' => $vencimiento,
            'configCobranza' => [
                'yape_titular' => $config->yape_titular ?? null,
                'yape_numero' => $config->yape_numero ?? null,
                'yape_qr' => $config?->yape_qr ? Storage::url($config->yape_qr) : null,
                'whatsapp_contacto' => $config->whatsapp_contacto ?? null,
            ],
            'misComprobantes' => ComprobantePago::where('id_persona', $user->id_persona)
                ->orderByDesc('created_at')
                ->get(['id', 'id_cobro', 'estado', 'monto_declarado', 'motivo_rechazo', 'created_at']),
            'consumoHistorico' => $ocupacion ? $this->consumoHistorico($ocupacion->id_unidad, (float) ($config->minimo_kwh_aviso ?? 13.5)) : [],
        ]);
    }

    /**
     * "Racha" de puntualidad -- cuantos periodos SEGUIDOS (contando desde el
     * mas reciente hacia atras) estan PAGADO sin cortes, cuantos pagos hizo
     * en el anio en curso, y una serie corta para el sparkline. $cobros ya
     * viene ordenado mas reciente primero (ver CobroService::listarParaPersona).
     */
    private function racha(array $cobros): array
    {
        $mesesAlDia = 0;
        foreach ($cobros as $c) {
            if ($c['estado_pago'] !== 'PAGADO') {
                break;
            }
            $mesesAlDia++;
        }

        $anioActual = now()->year;
        $pagosEsteAnio = collect($cobros)->filter(fn ($c) => $c['estado_pago'] === 'PAGADO' && (int) $c['anio'] === $anioActual)->count();

        $sparkline = collect($cobros)->take(6)->reverse()->values()
            ->map(fn ($c) => (float) $c['pagado_total'])->all();

        return [
            'meses_al_dia' => $mesesAlDia,
            'pagos_este_anio' => $pagosEsteAnio,
            'sparkline' => $sparkline,
        ];
    }

    /**
     * Ultimos 6 periodos con lectura registrada para la unidad del inquilino
     * -- mismo calculo de consumo (lectura_actual - lectura_anterior) que ya
     * usa Avisos/Index.jsx, en orden cronologico para graficar. Aplica la
     * misma regla de minimo_kwh_aviso que el recibo (ver skill
     * reglas-negocio-facturacion): un consumo real por debajo del umbral se
     * muestra como 0, no se expone el numero real.
     */
    private function consumoHistorico(int $idUnidad, float $minimoKwhAviso): array
    {
        return DB::table('lecturas_unidad as l')
            ->join('periodos as p', 'p.id_periodo', '=', 'l.id_periodo')
            ->where('l.id_unidad', $idUnidad)
            ->where('l.estado', '!=', 'ANULADO')
            ->orderByDesc('p.anio')->orderByDesc('p.mes')
            ->limit(6)
            ->get(['p.anio', 'p.mes', 'l.lectura_anterior', 'l.lectura_actual'])
            ->map(function ($row) use ($minimoKwhAviso) {
                $consumo = max((float) $row->lectura_actual - (float) $row->lectura_anterior, 0);

                return [
                    'anio' => $row->anio,
                    'mes' => $row->mes,
                    'consumo_kwh' => round($consumo < $minimoKwhAviso ? 0 : $consumo, 2),
                ];
            })
            ->reverse()
            ->values()
            ->all();
    }
}
