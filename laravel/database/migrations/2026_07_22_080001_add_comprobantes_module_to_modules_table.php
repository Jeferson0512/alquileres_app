<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $cobrosId = DB::table('modules')->where('code', 'cobros')->value('id');

        DB::table('modules')->insert([
            'code' => 'cobros.comprobantes', 'name' => 'Comprobantes', 'parent_module_id' => $cobrosId, 'sort_order' => 105,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('modules')->where('code', 'cobros.comprobantes')->delete();
    }
};
