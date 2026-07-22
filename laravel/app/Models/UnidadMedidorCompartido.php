<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UnidadMedidorCompartido extends Model
{
    protected $table = 'unidades_medidor_compartido';
    protected $primaryKey = 'id_relacion';
    public $timestamps = true;

    protected $fillable = [
        'id_unidad_titular', 'id_unidad_dependiente', 'porcentaje_dependiente', 'activo', 'observacion',
    ];

    public function titular(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'id_unidad_titular', 'id_unidad');
    }

    public function dependiente(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'id_unidad_dependiente', 'id_unidad');
    }
}
