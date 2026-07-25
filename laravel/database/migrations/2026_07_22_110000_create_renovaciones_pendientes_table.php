<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('renovaciones_pendientes')) {
            return;
        }

        Schema::create('renovaciones_pendientes', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_ocupacion_anterior');
            $table->unsignedInteger('id_ocupacion_nueva')->nullable();
            $table->enum('estado', ['PENDIENTE', 'RESUELTA'])->default('PENDIENTE');
            $table->string('creado_por', 191)->nullable();
            $table->string('resuelto_por', 191)->nullable();
            $table->timestamp('resuelto_en')->nullable();
            $table->timestamps();

            $table->index('estado', 'idx_renovaciones_estado');
            $table->foreign('id_ocupacion_anterior', 'fk_renovacion_ocupacion_anterior')->references('id_ocupacion')->on('ocupacion_unidad');
            $table->foreign('id_ocupacion_nueva', 'fk_renovacion_ocupacion_nueva')->references('id_ocupacion')->on('ocupacion_unidad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('renovaciones_pendientes');
    }
};
