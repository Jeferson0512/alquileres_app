<?php

namespace App\Services;

use App\Models\CobroMensual;
use App\Models\LecturaCorte;
use App\Models\LecturaUnidad;
use App\Models\OcupacionUnidad;
use App\Models\Pago;
use App\Models\Periodo;
use App\Models\Unidad;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LecturaService
{
    /**
     * Replica lecturas/sync.php: para cada unidad ACTIVA, busca las
     * ocupaciones vigentes en el rango de fechas del periodo, toma la
     * ultima lectura_actual registrada en un periodo anterior como
     * lectura_anterior, y crea o actualiza la fila de lecturas_unidad de
     * este periodo. Ademas detecta las fronteras entre ocupaciones dentro
     * del periodo (ver TramoResolver) y crea los placeholders de
     * lecturas_corte pendientes de cargar.
     */
    public function sincronizar(Periodo $periodo): array
    {
        $periodo->assertEditable();

        $insertados = 0;
        $actualizados = 0;
        $resolver = new TramoResolver();

        // Un periodo con pagos ya registrados no gana cortes nuevos --
        // Fase 1 no cobra nada por ellos todavia, pero introducir una
        // frontera pendiente de cargar en un periodo que el dinero ya dio
        // por cerrado es la clase de sorpresa que hay que evitar antes de
        // que Fase 2 empiece a leerlos para facturar. sincronizar() sigue
        // refrescando lectura_anterior/id_ocupacion igual que hoy -- eso
        // no cambia con este guard.
        $tienePagos = Pago::whereIn('id_cobro', CobroMensual::where('id_periodo', $periodo->id_periodo)->pluck('id_cobro'))->exists();

        DB::transaction(function () use ($periodo, &$insertados, &$actualizados, $resolver, $tienePagos) {
            $unidades = Unidad::where('estado', 'ACTIVO')->orderBy('id_unidad')->get(['id_unidad']);

            foreach ($unidades as $unidad) {
                $idUnidad = $unidad->id_unidad;

                $ocupaciones = OcupacionUnidad::where('id_unidad', $idUnidad)
                    ->where('estado', '!=', 'ANULADO')
                    ->where('fecha_inicio', '<=', $periodo->fecha_fin)
                    ->where(function ($q) use ($periodo) {
                        $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $periodo->fecha_inicio);
                    })
                    ->orderBy('fecha_inicio')->orderBy('id_ocupacion')
                    ->get();

                // La ocupacion "de cierre" (la vigente al final del
                // periodo, o la ultima que se solapa si ninguna llega
                // hasta el cierre) queda vinculada en lecturas_unidad --
                // ya no es la fuente de verdad del dinero cuando hay mas
                // de una ocupacion (eso lo resuelve TramoResolver sobre
                // lecturas_corte), solo una referencia rapida para
                // pantallas que todavia no saben de tramos.
                $ocupacionCierre = $ocupaciones->last();

                $anterior = LecturaUnidad::where('id_unidad', $idUnidad)
                    ->whereHas('periodo', fn ($q) => $q->where('fecha_fin', '<=', $periodo->fecha_inicio)->where('id_periodo', '!=', $periodo->id_periodo))
                    ->join('periodos as p_prev', 'p_prev.id_periodo', '=', 'lecturas_unidad.id_periodo')
                    ->orderByDesc('p_prev.fecha_fin')->orderByDesc('lecturas_unidad.id_lectura')
                    ->value('lecturas_unidad.lectura_actual');

                $lecturaAnterior = $anterior !== null ? (float) $anterior : 0.0;

                $lectura = LecturaUnidad::where('id_periodo', $periodo->id_periodo)
                    ->where('id_unidad', $idUnidad)
                    ->first();

                if ($lectura) {
                    $lectura->update([
                        'id_ocupacion' => $ocupacionCierre?->id_ocupacion,
                        'lectura_anterior' => $lecturaAnterior,
                        'lectura_actual' => max($lectura->lectura_actual, $lecturaAnterior),
                    ]);
                    $actualizados++;
                } else {
                    LecturaUnidad::create([
                        'id_periodo' => $periodo->id_periodo,
                        'id_unidad' => $idUnidad,
                        'id_ocupacion' => $ocupacionCierre?->id_ocupacion,
                        'lectura_anterior' => $lecturaAnterior,
                        'lectura_actual' => $lecturaAnterior,
                        'fecha_lectura' => $periodo->fecha_fin,
                        'estado' => 'REGISTRADO',
                    ]);
                    $insertados++;
                }

                if (!$tienePagos) {
                    $this->sincronizarCortes($periodo, $idUnidad, $ocupaciones, $resolver);
                }
            }
        });

        return ['insertados' => $insertados, 'actualizados' => $actualizados];
    }

    /**
     * Crea el placeholder de lecturas_corte (AUTO, sin lectura_corte
     * todavia) en cada frontera interna entre ocupaciones dentro del
     * periodo. Nunca pisa un corte que ya existe -- tenga o no valor
     * cargado, sea AUTO o MANUAL -- para no perder una lectura que un
     * admin ya tomo, o "resucitar" pendiente algo que ya se resolvio.
     */
    private function sincronizarCortes(Periodo $periodo, int $idUnidad, Collection $ocupaciones, TramoResolver $resolver): void
    {
        $segmentos = $resolver->segmentar($periodo, $ocupaciones);
        $ultimoIndice = count($segmentos) - 1;

        for ($i = 0; $i < $ultimoIndice; $i++) {
            $fechaCorte = $segmentos[$i]['hasta']->toDateString();

            $yaExiste = LecturaCorte::where('id_periodo', $periodo->id_periodo)
                ->where('id_unidad', $idUnidad)
                ->where('fecha_corte', $fechaCorte)
                ->exists();

            if ($yaExiste) {
                continue;
            }

            LecturaCorte::create([
                'id_periodo' => $periodo->id_periodo,
                'id_unidad' => $idUnidad,
                'fecha_corte' => $fechaCorte,
                'id_ocupacion_sale' => $segmentos[$i]['id_ocupacion'],
                'id_ocupacion_entra' => $segmentos[$i + 1]['id_ocupacion'],
                'origen' => 'AUTO',
            ]);
        }
    }

    /**
     * Filas para la pantalla de Lecturas: consumo calculado + el estado de
     * auditoria (compara lectura_anterior contra la ultima lectura_actual
     * real del periodo previo, igual que lecturas/index.php) + los tramos
     * de ocupacion del periodo (TramoResolver) para las unidades que
     * tienen mas de una ocupacion involucrada.
     */
    public function filasParaPeriodo(Periodo $periodo): array
    {
        $rows = LecturaUnidad::query()
            ->select([
                'lecturas_unidad.id_lectura', 'unidades.id_unidad', 'unidades.codigo_unidad',
                'unidades.nombre_unidad', 'unidades.piso',
                'lecturas_unidad.lectura_anterior', 'lecturas_unidad.lectura_actual',
                'ocupacion_unidad.monto_alquiler',
                DB::raw("CONCAT(COALESCE(personas.nombres,''), ' ', COALESCE(personas.apellidos,'')) as inquilino"),
            ])
            ->join('unidades', 'unidades.id_unidad', '=', 'lecturas_unidad.id_unidad')
            ->leftJoin('ocupacion_unidad', 'ocupacion_unidad.id_ocupacion', '=', 'lecturas_unidad.id_ocupacion')
            ->leftJoin('personas', 'personas.id_persona', '=', 'ocupacion_unidad.id_persona')
            ->where('lecturas_unidad.id_periodo', $periodo->id_periodo)
            ->orderBy('unidades.codigo_unidad')
            ->get();

        $tramos = (new TramoResolver())->tramosParaPeriodo($periodo);

        // Los tramos solo traen id_persona (TramoResolver no sabe de
        // nombres) -- se resuelve aca en una sola consulta para no hacer
        // N+1 por tramo.
        $idsPersona = collect($tramos)->pluck('id_persona')->filter()->unique()->all();
        $nombresPorPersona = DB::table('personas')->whereIn('id_persona', $idsPersona)
            ->pluck(DB::raw("TRIM(CONCAT(nombres, ' ', apellidos))"), 'id_persona');

        $tramosPorUnidad = collect($tramos)->map(function ($t) use ($nombresPorPersona) {
            $t['inquilino'] = $t['id_persona'] ? ($nombresPorPersona[$t['id_persona']] ?? null) : null;

            return $t;
        })->groupBy('id_unidad');

        return $rows->map(function ($row) use ($periodo, $tramosPorUnidad) {
            $referencia = LecturaUnidad::join('periodos', 'periodos.id_periodo', '=', 'lecturas_unidad.id_periodo')
                ->where('lecturas_unidad.id_unidad', $row->id_unidad)
                ->where('periodos.fecha_fin', '<', $periodo->fecha_inicio)
                ->orderByDesc('periodos.fecha_fin')->orderByDesc('lecturas_unidad.id_lectura')
                ->value('lecturas_unidad.lectura_actual');

            $auditoria = 'SIN_HISTORICO';
            if ($referencia !== null) {
                $actual = round((float) $row->lectura_anterior, 2);
                $esperado = round((float) $referencia, 2);
                $auditoria = abs($actual - $esperado) < 0.01 ? 'OK' : 'REVISAR';
            }

            $tramos = $tramosPorUnidad->get($row->id_unidad, collect())->values()->all();

            return [
                'id_lectura' => $row->id_lectura,
                'id_unidad' => $row->id_unidad,
                'codigo_unidad' => $row->codigo_unidad,
                'nombre_unidad' => $row->nombre_unidad,
                'piso' => $row->piso,
                'lectura_anterior' => (float) $row->lectura_anterior,
                'lectura_actual' => (float) $row->lectura_actual,
                'consumo' => round(max($row->lectura_actual - $row->lectura_anterior, 0), 2),
                'lectura_referencia_anterior' => $referencia !== null ? round((float) $referencia, 2) : null,
                'auditoria_lectura_anterior' => $auditoria,
                'inquilino' => trim($row->inquilino),
                'monto_alquiler' => $row->monto_alquiler,
                // tramos.length > 1 -- unidad con mas de una ocupacion en
                // el periodo, necesita al menos una lectura de corte.
                'tramos' => $tramos,
                'tiene_corte_pendiente' => collect($tramos)->contains(fn ($t) => $t['estado'] === 'CORTE_PENDIENTE'),
            ];
        })->all();
    }

    /**
     * Registra una lectura de corte a mano, sin que haya cambio de
     * ocupacion -- ej. una lectura de control a mitad de contrato. A
     * diferencia de los cortes AUTO (que sincronizar() detecta en cada
     * cambio de inquilino), este es el unico punto de entrada donde un
     * admin decide partir un tramo por su cuenta.
     */
    public function registrarCorteManual(Periodo $periodo, int $idUnidad, string $fechaCorte, float $lecturaCorte, ?string $observacion, string $registradoPor): LecturaCorte
    {
        $periodo->assertEditable();

        // fecha_inicio/fecha_fin vienen casteadas a Carbon (Periodo::casts())
        // -- comparar un string PHP contra un objeto Carbon con < / >=
        // termina comparando su __toString() ("...00:00:00"), no la fecha
        // real. toDateString() lo deja en 'Y-m-d' para comparar como texto.
        $fechaInicioPeriodo = $periodo->fecha_inicio->toDateString();
        $fechaFinPeriodo = $periodo->fecha_fin->toDateString();

        if ($fechaCorte < $fechaInicioPeriodo || $fechaCorte >= $fechaFinPeriodo) {
            throw ValidationException::withMessages([
                'fecha_corte' => 'La fecha debe caer dentro del periodo, antes de su fecha de cierre (esa la cubre "Actual").',
            ]);
        }

        $tienePagos = Pago::whereIn('id_cobro', CobroMensual::where('id_periodo', $periodo->id_periodo)->pluck('id_cobro'))->exists();
        if ($tienePagos) {
            throw ValidationException::withMessages([
                'fecha_corte' => 'Este periodo ya tiene pagos registrados -- no se pueden agregar cortes nuevos.',
            ]);
        }

        $yaExiste = LecturaCorte::where('id_periodo', $periodo->id_periodo)
            ->where('id_unidad', $idUnidad)
            ->where('fecha_corte', $fechaCorte)
            ->exists();
        if ($yaExiste) {
            throw ValidationException::withMessages([
                'fecha_corte' => 'Ya existe un corte registrado en esa fecha para esta unidad.',
            ]);
        }

        // Un corte manual no cambia de ocupacion -- sale y entra son la
        // misma (la vigente en esa fecha), o ambas null si la unidad esta
        // vacante ese dia.
        $ocupacion = OcupacionUnidad::where('id_unidad', $idUnidad)
            ->where('estado', '!=', 'ANULADO')
            ->where('fecha_inicio', '<=', $fechaCorte)
            ->where(function ($q) use ($fechaCorte) {
                $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $fechaCorte);
            })
            ->orderByDesc('fecha_inicio')->orderByDesc('id_ocupacion')
            ->first();

        return LecturaCorte::create([
            'id_periodo' => $periodo->id_periodo,
            'id_unidad' => $idUnidad,
            'fecha_corte' => $fechaCorte,
            'id_ocupacion_sale' => $ocupacion?->id_ocupacion,
            'id_ocupacion_entra' => $ocupacion?->id_ocupacion,
            'lectura_corte' => $lecturaCorte,
            'origen' => 'MANUAL',
            'observacion' => $observacion,
            'registrado_por' => $registradoPor,
        ]);
    }
}
