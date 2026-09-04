<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('modules')->insert([
            'code' => 'reportes', 'name' => 'Reportes', 'parent_module_id' => null, 'sort_order' => 15,
        ]);
    }

    public function down(): void
    {
        DB::table('modules')->where('code', 'reportes')->delete();
    }
};
