<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoAuditoria extends Model
{
    protected $table = 'pagos_auditoria';
    protected $primaryKey = 'id_pago_auditoria';
    public $timestamps = false;

    protected $fillable = ['id_pago', 'accion', 'actor', 'payload_before', 'payload_after', 'created_at'];

    protected function casts(): array
    {
        return [
            'payload_before' => 'array',
            'payload_after' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
