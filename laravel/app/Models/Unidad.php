<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Unidad extends Model
{
    protected $table = 'unidades';
    protected $primaryKey = 'id_unidad';
    public $timestamps = true;

    protected $fillable = [
        'id_inmueble', 'codigo_unidad', 'nombre_unidad', 'piso', 'tipo_unidad',
        'tiene_medidor', 'medidor_codigo', 'tarifa_alquiler_base', 'observacion', 'estado',
    ];

    public const TIPOS = ['CUARTO', 'MINI_DPTO', 'DEPARTAMENTO', 'LOCAL', 'DEPOSITO', 'AREA_COMUN', 'MEDIDOR_GENERAL', 'OTRO'];

    public function ocupaciones(): HasMany
    {
        return $this->hasMany(OcupacionUnidad::class, 'id_unidad', 'id_unidad');
    }

    /**
     * La ocupación ACTIVO más reciente de esta unidad -- espejo de
     * Persona::ocupacionActiva(), usado por el mapa visual de Ocupaciones.
     */
    public function ocupacionActiva(): HasOne
    {
        return $this->hasOne(OcupacionUnidad::class, 'id_unidad', 'id_unidad')
            ->where('estado', 'ACTIVO')
            ->latest('fecha_inicio');
    }
}
