<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CobroMensual extends Model
{
    protected $table = 'cobros_mensuales';
    protected $primaryKey = 'id_cobro';
    public $timestamps = true;

    protected $fillable = [
        'id_periodo', 'id_persona', 'id_unidad',
        'monto_alquiler', 'monto_luz', 'ajuste_minimo_luz', 'monto_agua', 'monto_gas',
        'otros_conceptos', 'descuento', 'mora', 'total_cobrar',
        'fecha_vencimiento', 'estado_pago', 'observacion',
    ];

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class, 'id_periodo', 'id_periodo');
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'id_unidad', 'id_unidad');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'id_persona', 'id_persona');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(CobroMensualDetalle::class, 'id_cobro', 'id_cobro');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'id_cobro', 'id_cobro');
    }

    /**
     * Snapshot vs valor vigente — la relacion que resuelve estructuralmente
     * el bug de esta sesion (Fase 0/1 de docs/requerimientos-proyecto.md).
     * `monto_alquiler` en este registro queda congelado al momento de
     * generar el cobro; esto compara contra el valor VIGENTE del contrato.
     */
    public function ocupacion(): ?OcupacionUnidad
    {
        return OcupacionUnidad::where('id_unidad', $this->id_unidad)
            ->where('id_persona', $this->id_persona)
            ->where('estado', 'ACTIVO')
            ->first();
    }

    public function montoAlquilerDesactualizado(): bool
    {
        $ocupacion = $this->ocupacion();
        if (!$ocupacion) {
            return false;
        }

        return round((float) $ocupacion->monto_alquiler, 2) !== round((float) $this->monto_alquiler, 2);
    }
}
