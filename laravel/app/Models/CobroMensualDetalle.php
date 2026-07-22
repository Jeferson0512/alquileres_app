<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CobroMensualDetalle extends Model
{
    protected $table = 'cobros_mensuales_detalle';
    protected $primaryKey = 'id_cobro_detalle';
    public $timestamps = true;

    protected $fillable = ['id_cobro', 'id_concepto', 'monto_programado', 'descripcion', 'orden_visual'];

    public function cobro(): BelongsTo
    {
        return $this->belongsTo(CobroMensual::class, 'id_cobro', 'id_cobro');
    }

    public function concepto(): BelongsTo
    {
        return $this->belongsTo(ConceptoCobro::class, 'id_concepto', 'id_concepto');
    }
}
