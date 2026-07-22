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
        DB::table('modules')->insert([
            'code' => 'consultas', 'name' => 'Consultas', 'parent_module_id' => null, 'sort_order' => 150,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('modules')->where('code', 'consultas')->delete();
    }
};
