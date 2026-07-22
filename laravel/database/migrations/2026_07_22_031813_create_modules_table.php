<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('modules')) {
            return;
        }

        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('code', 60)->unique('uq_module_code');
            $table->string('name', 100);
            $table->foreignId('parent_module_id')->nullable()->constrained('modules')->nullOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        $modules = [
            ['code' => 'dashboard', 'name' => 'Dashboard', 'sort_order' => 10],
            ['code' => 'periodos', 'name' => 'Periodos', 'sort_order' => 20],
            ['code' => 'inquilinos', 'name' => 'Inquilinos', 'sort_order' => 30],
            ['code' => 'unidades', 'name' => 'Unidades', 'sort_order' => 40],
            ['code' => 'ocupaciones', 'name' => 'Ocupaciones', 'sort_order' => 50],
            ['code' => 'recibo', 'name' => 'Recibo de luz', 'sort_order' => 60],
            ['code' => 'lecturas', 'name' => 'Lecturas', 'sort_order' => 70],
            ['code' => 'liquidacion', 'name' => 'Liquidación', 'sort_order' => 80],
            ['code' => 'cobros', 'name' => 'Cobros', 'sort_order' => 90],
            ['code' => 'avisos', 'name' => 'Avisos', 'sort_order' => 110],
            ['code' => 'tarifas', 'name' => 'Tarifas', 'sort_order' => 120],
            ['code' => 'config_cobranza', 'name' => 'Config. cobranza', 'sort_order' => 130],
            ['code' => 'usuarios', 'name' => 'Usuarios', 'sort_order' => 140],
        ];

        foreach ($modules as $module) {
            DB::table('modules')->insert(array_merge($module, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $cobrosId = DB::table('modules')->where('code', 'cobros')->value('id');
        DB::table('modules')->insert([
            'code' => 'cobros.pagos',
            'name' => 'Pagos',
            'parent_module_id' => $cobrosId,
            'sort_order' => 100,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
