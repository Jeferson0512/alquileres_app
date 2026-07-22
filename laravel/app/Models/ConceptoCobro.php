<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConceptoCobro extends Model
{
    protected $table = 'conceptos_cobro';
    protected $primaryKey = 'id_concepto';
    public $timestamps = true;

    protected $fillable = ['codigo', 'nombre', 'prioridad_aplicacion', 'permite_pago_directo', 'activo'];

    public static function mapaActivos(): array
    {
        return static::where('activo', 1)->pluck('id_concepto', 'codigo')->all();
    }
}
