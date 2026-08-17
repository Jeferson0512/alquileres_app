<?php

namespace App\Services;

use App\Models\ComprobantePago;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Feed de notificaciones del inquilino -- solo lo que le pertenece a el
 * (via id_persona), nunca cruza datos de otros inquilinos. Hoy la unica
 * fuente es la resolucion de sus propios comprobantes de pago (aprobado/
 * rechazado); se disenio separado para que crecer a mas fuentes (ej. cobro
 * nuevo generado) no obligue a tocar el feed de staff (NotificacionFeedService)
 * ni corra el riesgo de mezclar las dos audiencias.
 */
class PortalNotificacionService
{
    public function paraCampana(int $idPersona, int $limite = 8): array
    {
        return $this->comprobantesResueltos($idPersona)->take($limite)->values()->toArray();
    }

    public function paginado(int $idPersona, int $page, int $porPagina = 20): LengthAwarePaginator
    {
        $items = $this->comprobantesResueltos($idPersona);

        return new LengthAwarePaginator(
            $items->slice(($page - 1) * $porPagina, $porPagina)->values(),
            $items->count(),
            $porPagina,
            $page,
            ['path' => request()->url(), 'query' => request()->query()],
        );
    }

    public function marcarLeidas(int $idPersona): void
    {
        ComprobantePago::where('id_persona', $idPersona)
            ->whereNull('leido_en_inquilino')
            ->update(['leido_en_inquilino' => now()]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function comprobantesResueltos(int $idPersona): Collection
    {
        return ComprobantePago::where('id_persona', $idPersona)
            ->whereIn('estado', ['APROBADO', 'RECHAZADO'])
            ->with(['cobro.periodo:id_periodo,anio,mes', 'cobro.unidad:id_unidad,codigo_unidad'])
            ->orderByDesc('fecha_revision')
            ->limit(100)
            ->get()
            ->map(function (ComprobantePago $c) {
                $unidad = $c->cobro?->unidad?->codigo_unidad;
                $periodo = $c->cobro?->periodo;
                $periodoTexto = $periodo ? sprintf('%02d/%d', $periodo->mes, $periodo->anio) : '';
                $monto = number_format((float) $c->monto_declarado, 2);

                return [
                    'id' => $c->id,
                    'estado' => $c->estado,
                    'titulo' => $c->estado === 'APROBADO'
                        ? "Tu comprobante fue aprobado — Unidad {$unidad}"
                        : "Tu comprobante fue rechazado — Unidad {$unidad}",
                    'detalle' => $c->estado === 'APROBADO'
                        ? "S/ {$monto} · periodo {$periodoTexto}"
                        : "S/ {$monto} · periodo {$periodoTexto} · {$c->motivo_rechazo}",
                    'fecha' => $c->fecha_revision ?? $c->created_at,
                    'leido' => $c->leido_en_inquilino !== null,
                    'url' => '/portal',
                ];
            });
    }
}
