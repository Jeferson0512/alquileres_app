<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Rastro server-side de "se finalizo un contrato como renovacion pero
 * todavia no se creo la nueva ocupacion" -- el pre-llenado automatico del
 * formulario es solo una comodidad del cliente; esta tabla es la fuente
 * de verdad que sobrevive si el admin cierra la pestaña antes de guardar.
 */
class RenovacionPendiente extends Model
{
    protected $table = 'renovaciones_pendientes';

    protected $fillable = [
        'id_ocupacion_anterior', 'id_ocupacion_nueva', 'estado',
        'creado_por', 'resuelto_por', 'resuelto_en', 'leido_en',
    ];

    protected function casts(): array
    {
        return [
            'resuelto_en' => 'datetime',
            'leido_en' => 'datetime',
        ];
    }

    public function ocupacionAnterior(): BelongsTo
    {
        return $this->belongsTo(OcupacionUnidad::class, 'id_ocupacion_anterior', 'id_ocupacion');
    }

    public function ocupacionNueva(): BelongsTo
    {
        return $this->belongsTo(OcupacionUnidad::class, 'id_ocupacion_nueva', 'id_ocupacion');
    }
}
