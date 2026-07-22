<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inmueble extends Model
{
    protected $table = 'inmuebles';
    protected $primaryKey = 'id_inmueble';
    public $timestamps = true;

    protected $fillable = [
        'codigo_inmueble', 'nombre', 'direccion', 'descripcion', 'cantidad_pisos', 'estado',
    ];

    /**
     * El inmueble activo actual — hoy solo existe uno. Reemplaza el patron
     * "?? 1" hardcodeado del legacy (ver Fase 1, recibo/index.php) con una
     * consulta real a la tabla `inmuebles`.
     */
    public static function activoActual(): self
    {
        return static::where('estado', 'ACTIVO')->orderBy('id_inmueble')->firstOrFail();
    }
}
