<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('lecturas_corte')) {
            return;
        }

        Schema::create('lecturas_corte', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_periodo');
            $table->unsignedInteger('id_unidad');
            $table->date('fecha_corte');
            $table->unsignedInteger('id_ocupacion_sale')->nullable();
            $table->unsignedInteger('id_ocupacion_entra')->nullable();
            $table->decimal('lectura_corte', 12, 2)->nullable();
            $table->enum('origen', ['AUTO', 'MANUAL'])->default('AUTO');
            $table->string('observacion', 255)->nullable();
            $table->string('registrado_por', 191)->nullable();
            $table->timestamps();

            $table->unique(['id_periodo', 'id_unidad', 'fecha_corte'], 'uq_corte_periodo_unidad_fecha');
            $table->foreign('id_periodo', 'fk_corte_periodo')->references('id_periodo')->on('periodos');
            $table->foreign('id_unidad', 'fk_corte_unidad')->references('id_unidad')->on('unidades');
            $table->foreign('id_ocupacion_sale', 'fk_corte_ocupacion_sale')->references('id_ocupacion')->on('ocupacion_unidad');
            $table->foreign('id_ocupacion_entra', 'fk_corte_ocupacion_entra')->references('id_ocupacion')->on('ocupacion_unidad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecturas_corte');
    }
};
