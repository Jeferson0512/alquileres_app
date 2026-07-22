<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfigCobranza extends Model
{
    protected $table = 'config_cobranza';
    protected $primaryKey = 'id_config';
    public $timestamps = true;

    protected $fillable = [
        'id_inmueble', 'monto_minimo_luz', 'minimo_kwh_aviso',
        'yape_titular', 'yape_numero', 'yape_qr',
        'banco_nombre', 'banco_titular', 'banco_cuenta', 'banco_cci', 'mensaje_base',
    ];
}
