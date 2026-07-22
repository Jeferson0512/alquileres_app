<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PagoDetalle extends Model
{
    protected $table = 'pagos_detalle';
    protected $primaryKey = 'id_pago_detalle';
    public $timestamps = true;

    protected $fillable = ['id_pago', 'id_cobro_detalle', 'monto_aplicado', 'origen_aplicacion', 'observacion'];

    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class, 'id_pago', 'id_pago');
    }

    public function cobroDetalle(): BelongsTo
    {
        return $this->belongsTo(CobroMensualDetalle::class, 'id_cobro_detalle', 'id_cobro_detalle');
    }
}
