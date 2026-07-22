<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TarifaServicio extends Model
{
    protected $table = 'tarifas_servicios';
    protected $primaryKey = 'id_tarifa';
    public $timestamps = true;

    protected $fillable = [
        'id_inmueble', 'servicio', 'descripcion', 'monto', 'por_unidad', 'activo',
    ];

    public function auditoria(): HasMany
    {
        return $this->hasMany(TarifaAuditoria::class, 'id_tarifa', 'id_tarifa');
    }
}
