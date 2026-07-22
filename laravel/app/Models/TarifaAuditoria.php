<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TarifaAuditoria extends Model
{
    protected $table = 'tarifas_auditoria';
    protected $primaryKey = 'id_tarifa_auditoria';
    public $timestamps = false;

    protected $fillable = [
        'id_tarifa', 'accion', 'actor', 'payload_before', 'payload_after', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload_before' => 'array',
            'payload_after' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
