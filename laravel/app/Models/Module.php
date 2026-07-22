<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = ['code', 'name', 'parent_module_id', 'sort_order'];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'parent_module_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Module::class, 'parent_module_id')->orderBy('sort_order');
    }

    /**
     * El código base del módulo padre, para chequear el permiso "{codigo}.ver".
     * Para "cobros.pagos" devuelve "cobros"; para "cobros" devuelve "cobros".
     */
    public function permissionPrefix(): string
    {
        return $this->code;
    }
}
