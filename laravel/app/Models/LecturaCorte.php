<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LecturaCorte extends Model
{
    protected $table = 'lecturas_corte';

    protected $fillable = [
        'id_periodo', 'id_unidad', 'fecha_corte',
        'id_ocupacion_sale', 'id_ocupacion_entra',
        'lectura_corte', 'origen', 'observacion', 'registrado_por',
    ];

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class, 'id_periodo', 'id_periodo');
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'id_unidad', 'id_unidad');
    }

    public function ocupacionSale(): BelongsTo
    {
        return $this->belongsTo(OcupacionUnidad::class, 'id_ocupacion_sale', 'id_ocupacion');
    }

    public function ocupacionEntra(): BelongsTo
    {
        return $this->belongsTo(OcupacionUnidad::class, 'id_ocupacion_entra', 'id_ocupacion');
    }
}
