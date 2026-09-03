<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrasladoOcupacion extends Model
{
    protected $table = 'traslados_ocupacion';

    protected $fillable = [
        'id_ocupacion_origen', 'id_ocupacion_destino', 'fecha_traslado', 'observacion', 'creado_por',
    ];

    public function ocupacionOrigen(): BelongsTo
    {
        return $this->belongsTo(OcupacionUnidad::class, 'id_ocupacion_origen', 'id_ocupacion');
    }

    public function ocupacionDestino(): BelongsTo
    {
        return $this->belongsTo(OcupacionUnidad::class, 'id_ocupacion_destino', 'id_ocupacion');
    }
}
