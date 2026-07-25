<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * "Roles y permisos" y "Campos del perfil" pasan de ser enlaces sueltos
 * dentro de la pagina de Usuarios a submodulos reales del sidebar, como
 * hermanos de Usuarios bajo Configuracion (el nav solo soporta un nivel
 * de hijos, por eso no cuelgan de Usuarios directamente).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('modules')->where('code', 'usuarios.roles')->exists()) {
            return;
        }

        $configuracionId = DB::table('modules')->where('code', 'configuracion')->value('id');

        DB::table('modules')->insert([
            ['code' => 'usuarios.roles', 'name' => 'Roles y permisos', 'parent_module_id' => $configuracionId, 'sort_order' => 141],
            ['code' => 'usuarios.perfil_campos', 'name' => 'Campos del perfil', 'parent_module_id' => $configuracionId, 'sort_order' => 142],
        ]);
    }

    public function down(): void
    {
        DB::table('modules')->whereIn('code', ['usuarios.roles', 'usuarios.perfil_campos'])->delete();
    }
};
