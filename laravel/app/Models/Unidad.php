<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
