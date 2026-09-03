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
        'motivo_fin', 'motivo_fin_detalle', 'renovada_de_id',
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
     * Si esta ocupacion nacio de renovar un contrato anterior (ver
     * OcupacionController::destroy), apunta a esa fila previa.
     */
    public function renovadaDe(): BelongsTo
    {
        return $this->belongsTo(self::class, 'renovada_de_id', 'id_ocupacion');
    }

    /**
     * Vinculo directo desde Fase 2 (docs/implementacion-ocupaciones-parciales.md)
     * -- cobros_mensuales.id_ocupacion cierra el gap que este mismo
     * docblock denunciaba antes: el vinculo indirecto por (id_unidad,
     * id_persona) fue lo que causo el bug de monto_alquiler
     * desincronizado que origino esta migracion.
     */
    public function cobros(): HasMany
    {
        return $this->hasMany(CobroMensual::class, 'id_ocupacion', 'id_ocupacion');
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
