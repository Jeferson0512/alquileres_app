<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComprobantePago extends Model
{
    protected $table = 'comprobantes_pago';
    public $timestamps = true;

    protected $fillable = [
        'id_cobro', 'id_persona', 'monto_declarado', 'fecha_pago_declarada',
        'metodo_pago', 'numero_operacion', 'imagen_path', 'estado',
        'motivo_rechazo', 'revisado_por', 'fecha_revision', 'id_pago', 'leido_en',
    ];

    protected function casts(): array
    {
        return [
            'leido_en' => 'datetime',
            'fecha_revision' => 'datetime',
        ];
    }

    public function cobro(): BelongsTo
    {
        return $this->belongsTo(CobroMensual::class, 'id_cobro', 'id_cobro');
    }

    public function persona(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'id_persona', 'id_persona');
    }

    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class, 'id_pago', 'id_pago');
    }
}
