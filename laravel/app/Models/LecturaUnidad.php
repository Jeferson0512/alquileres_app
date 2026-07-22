<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LecturaUnidad extends Model
{
    protected $table = 'lecturas_unidad';
    protected $primaryKey = 'id_lectura';
    public $timestamps = true;

    protected $fillable = [
        'id_periodo', 'id_unidad', 'id_ocupacion',
        'lectura_anterior', 'lectura_actual', 'fecha_lectura', 'observacion', 'estado',
    ];

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class, 'id_periodo', 'id_periodo');
    }

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'id_unidad', 'id_unidad');
    }
}
