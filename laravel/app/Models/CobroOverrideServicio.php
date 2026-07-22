<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CobroOverrideServicio extends Model
{
    protected $table = 'cobros_overrides_servicio';
    protected $primaryKey = 'id_override';
    public $timestamps = true;

    protected $fillable = ['id_periodo', 'id_unidad', 'id_persona', 'servicio', 'monto', 'observacion'];
}
