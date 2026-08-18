<?php

namespace App\Services;

use App\Models\ComprobantePago;
use App\Models\ContactInquiry;
use App\Models\RenovacionPendiente;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Combina las distintas fuentes de "avisos para el staff" (renovaciones de
 * contrato pendientes, comprobantes de pago subidos por inquilinos, consultas
 * del formulario de contacto del landing) en un solo feed con forma comun --
 * para que la campanita y la pagina de Notificaciones no dupliquen la
 * logica de merge/orden/paginado.
 */
class NotificacionFeedService
{
    private const VENTANA = 300;

    public function paraCampana(int $limite = 12): array
    {
        return $this->todas()->take($limite)->values()->toArray();
    }

    public function paginado(string $estadoFiltro, int $page, int $porPagina = 20): LengthAwarePaginator
    {
        $items = $this->todas()->filter(fn (array $item) => $estadoFiltro === 'TODAS' || $item['estado'] === $estadoFiltro)->values();

        if ($estadoFiltro === 'TODAS') {
            // Pendientes primero (todavia necesitan accion), resueltas despues.
            // sortBy es estable (PHP 8+), asi que dentro de cada grupo se
            // mantiene el orden cronologico descendente que ya trae todas().
            $items = $items->sortBy(fn (array $item) => $item['estado'] === 'PENDIENTE' ? 0 : 1)->values();
        }

        return new LengthAwarePaginator(
            $items->slice(($page - 1) * $porPagina, $porPagina)->values(),
            $items->count(),
            $porPagina,
            $page,
            ['path' => request()->url(), 'query' => request()->query()],
        );
    }

    /**
     * Conteo total sin leer, sin importar el filtro/pagina actual -- lo
     * necesita el resumen de la cabecera y el estado del boton "marcar
     * todas leidas" (que no puede depender solo de lo que se ve en la
     * pagina actual, o queda mal si hay no-leidas en otras paginas).
     */
    public function totalSinLeer(): int
    {
        return $this->todas()->where('leido', false)->count();
    }

    public function marcarTodasLeidas(): void
    {
        RenovacionPendiente::whereNull('leido_en')->update(['leido_en' => now()]);
        ComprobantePago::whereNull('leido_en')->update(['leido_en' => now()]);
        ContactInquiry::whereNull('leido_en')->update(['leido_en' => now()]);
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function todas(): Collection
    {
        return $this->renovaciones()->concat($this->comprobantes())->concat($this->consultas())
            ->sortByDesc('creado_en')
            ->values();
    }

    private function renovaciones(): Collection
    {
        return RenovacionPendiente::with([
            'ocupacionAnterior:id_ocupacion,id_unidad,id_persona,fecha_fin',
            'ocupacionAnterior.unidad:id_unidad,codigo_unidad',
            'ocupacionAnterior.persona:id_persona,nombres,apellidos',
        ])
            ->orderByDesc('created_at')
            ->limit(self::VENTANA)
            ->get()
            ->map(function (RenovacionPendiente $r) {
                $unidad = $r->ocupacionAnterior?->unidad?->codigo_unidad;
                $inquilino = trim(($r->ocupacionAnterior?->persona?->nombres ?? '').' '.($r->ocupacionAnterior?->persona?->apellidos ?? ''));
                $fechaFin = $r->ocupacionAnterior?->fecha_fin ? \Carbon\Carbon::parse($r->ocupacionAnterior->fecha_fin)->format('d/m/Y') : '—';

                return [
                    'id' => "renovacion:{$r->id}",
                    'tipo' => 'RENOVACION',
                    'estado' => $r->estado === 'PENDIENTE' ? 'PENDIENTE' : 'RESUELTA',
                    'titulo' => "Renovación pendiente — Unidad {$unidad}",
                    'detalle' => $r->estado === 'PENDIENTE'
                        ? "{$inquilino} — finalizado el {$fechaFin}, aún sin crear el nuevo contrato."
                        : "{$inquilino} — contrato renovado, completado por {$r->resuelto_por}.",
                    'fecha' => $r->created_at,
                    'leido' => $r->leido_en !== null,
                    'url' => "/ocupaciones?renovar_de={$r->id}",
                    'creado_en' => $r->created_at,
                ];
            });
    }

    private function comprobantes(): Collection
    {
        return ComprobantePago::with(['cobro.unidad:id_unidad,codigo_unidad', 'cobro.persona:id_persona,nombres,apellidos'])
            ->orderByDesc('created_at')
            ->limit(self::VENTANA)
            ->get()
            ->map(function (ComprobantePago $c) {
                $unidad = $c->cobro?->unidad?->codigo_unidad;
                $inquilino = trim(($c->cobro?->persona?->nombres ?? '').' '.($c->cobro?->persona?->apellidos ?? ''));
                $monto = number_format((float) $c->monto_declarado, 2);

                $titulo = match ($c->estado) {
                    'APROBADO' => "Comprobante aprobado — Unidad {$unidad}",
                    'RECHAZADO' => "Comprobante rechazado — Unidad {$unidad}",
                    default => "Comprobante por revisar — Unidad {$unidad}",
                };
                $detalle = match ($c->estado) {
                    'APROBADO' => "{$inquilino} — S/ {$monto}, aprobado por {$c->revisado_por}.",
                    'RECHAZADO' => "{$inquilino} — S/ {$monto}, rechazado: {$c->motivo_rechazo}",
                    default => "{$inquilino} — S/ {$monto}, esperando revisión.",
                };

                return [
                    'id' => "comprobante:{$c->id}",
                    'tipo' => 'COMPROBANTE',
                    'subestado' => $c->estado,
                    'estado' => $c->estado === 'PENDIENTE' ? 'PENDIENTE' : 'RESUELTA',
                    'titulo' => $titulo,
                    'detalle' => $detalle,
                    'fecha' => $c->created_at,
                    'leido' => $c->leido_en !== null,
                    'url' => '/cobros/comprobantes',
                    'creado_en' => $c->fecha_revision ?? $c->created_at,
                ];
            });
    }

    private function consultas(): Collection
    {
        return ContactInquiry::with('unidad:id_unidad,codigo_unidad')
            ->orderByDesc('created_at')
            ->limit(self::VENTANA)
            ->get()
            ->map(function (ContactInquiry $i) {
                $unidad = $i->unidad?->codigo_unidad;

                $titulo = match ($i->status) {
                    'CONTACTADO' => "Consulta contactada — {$i->name}",
                    'DESCARTADO' => "Consulta descartada — {$i->name}",
                    default => "Nueva consulta — {$i->name}",
                };
                $detalle = $unidad
                    ? "Unidad {$unidad} — {$i->email}"
                    : "Consulta general — {$i->email}";

                return [
                    'id' => "consulta:{$i->id}",
                    'tipo' => 'CONSULTA',
                    'subestado' => $i->status,
                    'estado' => $i->status === 'NUEVO' ? 'PENDIENTE' : 'RESUELTA',
                    'titulo' => $titulo,
                    'detalle' => $detalle,
                    'fecha' => $i->created_at,
                    'leido' => $i->leido_en !== null,
                    'url' => '/consultas',
                    'creado_en' => $i->created_at,
                ];
            });
    }
}
