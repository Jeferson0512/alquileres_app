<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LiquidacionLuzDetalle extends Model
{
    protected $table = 'liquidacion_luz_detalle';
    protected $primaryKey = 'id_liquidacion_detalle';
    public $timestamps = false;

    protected $fillable = [
        'id_periodo', 'id_inmueble', 'id_unidad', 'id_persona', 'id_lectura', 'id_recibo_luz',
        'consumo_kwh', 'porcentaje_participacion', 'monto_consumo', 'gasto_comun', 'ajuste',
        'total_pagar_luz', 'estado', 'observacion', 'fecha_calculo',
    ];
}
