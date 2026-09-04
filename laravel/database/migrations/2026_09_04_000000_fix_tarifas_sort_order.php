<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * 2026_07_22_120000_add_configuracion_module_and_reparent re-padreo Tarifas
 * bajo "Configuracion" (sort_order 125) pero nunca le subio su propio
 * sort_order -- seguia en 120, heredado de create_modules_table. Con eso,
 * Tarifas quedaba ordenada ANTES que su padre nuevo; RolePermissionController
 * (matriz de Roles y permisos) solo indenta segun es_submodulo sin agrupar
 * por parent real, asi que Tarifas aparecia visualmente pegada a "Avisos"
 * (el ultimo modulo raiz antes de ella) en vez de "Configuracion".
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('modules')->where('code', 'tarifas')->update(['sort_order' => 126]);
    }

    public function down(): void
    {
        DB::table('modules')->where('code', 'tarifas')->update(['sort_order' => 120]);
    }
};
