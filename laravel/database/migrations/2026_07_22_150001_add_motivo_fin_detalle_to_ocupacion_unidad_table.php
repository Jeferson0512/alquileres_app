<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('ocupacion_unidad', 'motivo_fin_detalle')) {
            return;
        }

        Schema::table('ocupacion_unidad', function (Blueprint $table) {
            $table->string('motivo_fin_detalle', 255)->nullable()->after('motivo_fin');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('ocupacion_unidad', 'motivo_fin_detalle')) {
            return;
        }

        Schema::table('ocupacion_unidad', function (Blueprint $table) {
            $table->dropColumn('motivo_fin_detalle');
        });
    }
};
