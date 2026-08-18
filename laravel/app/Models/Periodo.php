<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class Periodo extends Model
{
    protected $table = 'periodos';
    protected $primaryKey = 'id_periodo';
    public $timestamps = true;

    protected $fillable = [
        'anio', 'mes', 'fecha_inicio', 'fecha_fin', 'estado', 'observacion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    /**
     * Replica getPeriodoId() de api/config/helpers.php: si se pasa un id
     * explicito lo usa (y valida que exista). Si no, cae al ultimo periodo
     * elegido en la sesion (ver RememberPeriodoActual) -- sin esto, cambiar
     * de periodo en una vista y navegar a otra por el sidebar perdia la
     * seleccion porque esa navegacion nueva llega sin ?periodo_id= en la
     * URL. Recien si tampoco hay nada en sesion, usa el mas reciente.
     */
    public static function actual(?int $periodoId = null): self
    {
        if ($periodoId) {
            return static::findOrFail($periodoId);
        }

        $idSesion = session('periodo_id');
        if ($idSesion) {
            $periodo = static::find($idSesion);
            if ($periodo) {
                return $periodo;
            }
        }

        return static::orderByDesc('anio')->orderByDesc('mes')->firstOrFail();
    }

    /**
     * Replica assertPeriodoEditable(): solo se puede registrar/sincronizar
     * lecturas o guardar el recibo mientras el periodo siga ABIERTO.
     */
    public function assertEditable(): void
    {
        if ($this->estado !== 'ABIERTO') {
            throw ValidationException::withMessages([
                'periodo' => 'El periodo seleccionado está cerrado y no permite edición',
            ]);
        }
    }

    /**
     * El periodo inmediatamente anterior a este, por fecha — usado por
     * "Copiar desde mes anterior" en Recibo.
     */
    public function anterior(): ?self
    {
        return static::where('fecha_fin', '<', $this->fecha_inicio)
            ->orderByDesc('fecha_fin')
            ->first();
    }
}
