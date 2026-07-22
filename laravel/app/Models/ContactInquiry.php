<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Consulta de un tercero interesado, enviada desde el formulario de
 * contacto del landing page publico (ver LandingController).
 */
class ContactInquiry extends Model
{
    protected $table = 'contact_inquiries';

    protected $fillable = ['name', 'email', 'phone', 'message', 'unit_id', 'status'];

    public function unidad(): BelongsTo
    {
        return $this->belongsTo(Unidad::class, 'unit_id', 'id_unidad');
    }
}
