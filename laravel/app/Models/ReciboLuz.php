<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReciboLuz extends Model
{
    protected $table = 'recibos_luz';
    protected $primaryKey = 'id_recibo_luz';
    public $timestamps = true;

    protected $fillable = [
        'id_inmueble', 'id_periodo', 'numero_recibo', 'numero_suministro',
        'fecha_emision', 'fecha_vencimiento',
        'lectura_anterior_general', 'lectura_actual_general', 'consumo_kwh_general',
        'precio_kwh', 'consumo_energia', 'cargo_fijo', 'mant_reposicion', 'alumbrado_publico',
        'subtotal', 'igv', 'electrificacion_rural',
        'ajuste_redondeo_anterior', 'ajuste_redondeo_actual', 'total_recibo',
        'observacion', 'estado',
    ];

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class, 'id_periodo', 'id_periodo');
    }
}
