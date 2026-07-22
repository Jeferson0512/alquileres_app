<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Catalogo configurable de que campos de `personas` son obligatorios para
 * que un Inquilino pueda usar el portal (ver EnsurePerfilCompleto). El
 * Admin decide obligatorio/opcional desde Usuarios > Campos del perfil.
 */
class ProfileField extends Model
{
    protected $table = 'profile_fields';

    protected $fillable = ['code', 'label', 'required'];

    protected function casts(): array
    {
        return ['required' => 'boolean'];
    }
}
