<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('traslados_ocupacion')) {
            return;
        }

        Schema::create('traslados_ocupacion', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_ocupacion_origen');
            $table->unsignedInteger('id_ocupacion_destino');
            $table->date('fecha_traslado');
            $table->string('observacion', 255)->nullable();
            $table->string('creado_por', 191)->nullable();
            $table->timestamps();

            $table->unique('id_ocupacion_origen', 'uq_traslado_origen');
            $table->unique('id_ocupacion_destino', 'uq_traslado_destino');
            $table->index('fecha_traslado', 'idx_traslado_fecha');
            $table->foreign('id_ocupacion_origen', 'fk_traslado_origen')->references('id_ocupacion')->on('ocupacion_unidad');
            $table->foreign('id_ocupacion_destino', 'fk_traslado_destino')->references('id_ocupacion')->on('ocupacion_unidad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('traslados_ocupacion');
    }
};
