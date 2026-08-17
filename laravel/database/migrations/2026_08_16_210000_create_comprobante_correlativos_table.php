<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('comprobante_correlativos')) {
            return;
        }

        Schema::create('comprobante_correlativos', function (Blueprint $table) {
            $table->id();
            $table->string('serie', 10)->unique();
            $table->unsignedInteger('ultimo_numero')->default(0);
            $table->timestamps();
        });

        DB::table('comprobante_correlativos')->insert([
            'serie' => 'B001',
            'ultimo_numero' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobante_correlativos');
    }
};
