<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Agrupa Tarifas, Config. cobranza y Usuarios bajo un nuevo modulo padre
 * "Configuracion" en el nav -- son los 3 modulos que ajustan como se
 * comporta la app (montos base, medios de pago, cuentas de acceso), a
 * diferencia de los modulos operativos del dia a dia (Periodos, Cobros,
 * Ocupaciones, etc). Los permisos NO cambian de nombre, solo se reordena
 * visualmente el sidebar.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::table('modules')->where('code', 'configuracion')->exists()) {
            return;
        }

        DB::table('modules')->insert([
            'code' => 'configuracion', 'name' => 'Configuración', 'parent_module_id' => null, 'sort_order' => 125,
        ]);

        $configuracionId = DB::table('modules')->where('code', 'configuracion')->value('id');

        DB::table('modules')
            ->whereIn('code', ['tarifas', 'config_cobranza', 'usuarios'])
            ->update(['parent_module_id' => $configuracionId]);
    }

    public function down(): void
    {
        DB::table('modules')
            ->whereIn('code', ['tarifas', 'config_cobranza', 'usuarios'])
            ->update(['parent_module_id' => null]);

        DB::table('modules')->where('code', 'configuracion')->delete();
    }
};
