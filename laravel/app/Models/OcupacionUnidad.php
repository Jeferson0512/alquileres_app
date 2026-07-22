<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OcupacionUnidad extends Model
{
    protected $table = 'ocupacion_unidad';
    protected $primaryKey = 'id_ocupacion';
    public $timestamps = true;

    protected $fillable = [
        'id_unidad', 'id_persona', 'fecha_inicio', 'fecha_fin',
        'monto_alquiler', 'garantia', 'estado', 'observacion',
    ];

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'id_unidad', 'id_unidad');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'id_persona', 'id_persona');
    }

    /**
     * cobros_mensuales NO tiene columna id_ocupacion — el vinculo es
     * indirecto por (id_unidad, id_persona). Es exactamente la ausencia de
     * esta relacion explicita la que causo el bug de monto_alquiler
     * desincronizado que origino esta migracion.
     */
    public function cobros(): HasMany
    {
        return $this->hasMany(CobroMensual::class, 'id_unidad', 'id_unidad')
            ->where('cobros_mensuales.id_persona', $this->id_persona);
    }

    /**
     * El precio de alquiler VIGENTE de este contrato ahora mismo — distinto
     * de cualquier monto_alquiler ya congelado como snapshot en un cobro
     * generado. Ver docs/requerimientos-proyecto.md y el bug corregido en
     * la sesion que origino esta migracion (Fase 1).
     */
    public function montoAlquilerVigente(): float
    {
        return (float) $this->monto_alquiler;
    }
}
