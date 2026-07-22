<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pago extends Model
{
    protected $table = 'pagos';
    protected $primaryKey = 'id_pago';
    public $timestamps = true;

    protected $fillable = [
        'id_cobro', 'fecha_pago', 'monto_pagado', 'metodo_pago', 'numero_operacion',
        'observacion', 'estado', 'origen_registro', 'registrado_por',
        'reversado_por', 'fecha_reversa', 'motivo_reversa',
    ];

    public function cobro(): BelongsTo
    {
        return $this->belongsTo(CobroMensual::class, 'id_cobro', 'id_cobro');
    }

    public function detalle(): HasMany
    {
        return $this->hasMany(PagoDetalle::class, 'id_pago', 'id_pago');
    }

    public function auditoria(): HasMany
    {
        return $this->hasMany(PagoAuditoria::class, 'id_pago', 'id_pago');
    }
}
