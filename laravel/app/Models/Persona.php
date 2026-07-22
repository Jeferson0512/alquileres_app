<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Persona extends Model
{
    protected $table = 'personas';
    protected $primaryKey = 'id_persona';
    public $timestamps = true;

    protected $fillable = [
        'tipo_persona', 'nombres', 'apellidos', 'tipo_documento', 'numero_documento',
        'celular', 'email', 'direccion', 'observacion', 'estado',
    ];

    public function scopeInquilinos(Builder $query): Builder
    {
        return $query->where('tipo_persona', 'INQUILINO');
    }

    /**
     * Cuenta de acceso al portal, si el Admin ya se la creó (ver User::persona()).
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id_persona', 'id_persona');
    }
}
