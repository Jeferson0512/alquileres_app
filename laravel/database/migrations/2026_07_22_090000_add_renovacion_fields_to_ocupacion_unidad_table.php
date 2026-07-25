<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('ocupacion_unidad', 'motivo_fin')) {
            return;
        }

        Schema::table('ocupacion_unidad', function (Blueprint $table) {
            $table->enum('motivo_fin', ['RENOVACION', 'MUDANZA', 'OTRO'])->nullable()->after('estado');
            $table->unsignedInteger('renovada_de_id')->nullable()->after('motivo_fin');

            $table->foreign('renovada_de_id', 'fk_ocupacion_renovada_de')->references('id_ocupacion')->on('ocupacion_unidad');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('ocupacion_unidad', 'motivo_fin')) {
            return;
        }

        Schema::table('ocupacion_unidad', function (Blueprint $table) {
            $table->dropForeign('fk_ocupacion_renovada_de');
            $table->dropColumn(['motivo_fin', 'renovada_de_id']);
        });
    }
};
