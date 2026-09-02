<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('liquidacion_luz_tramo')) {
            return;
        }

        Schema::create('liquidacion_luz_tramo', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_liquidacion_detalle');
            $table->unsignedInteger('id_periodo');
            $table->unsignedInteger('id_unidad');
            $table->unsignedInteger('id_ocupacion')->nullable();
            $table->unsignedInteger('id_persona')->nullable();
            $table->date('fecha_desde');
            $table->date('fecha_hasta');
            $table->unsignedSmallInteger('dias');
            $table->decimal('lectura_desde', 12, 2);
            $table->decimal('lectura_hasta', 12, 2);
            $table->decimal('consumo_kwh', 12, 2)->default(0);
            $table->decimal('porcentaje_tramo', 10, 6)->default(0);
            $table->decimal('total_pagar_luz', 10, 2)->default(0);
            $table->timestamp('fecha_calculo')->useCurrent();

            $table->unique(['id_periodo', 'id_unidad', 'fecha_desde'], 'uq_tramo_periodo_unidad_desde');
            $table->index('id_ocupacion', 'idx_tramo_ocupacion');
            $table->foreign('id_liquidacion_detalle', 'fk_tramo_liquidacion_detalle')->references('id_liquidacion_detalle')->on('liquidacion_luz_detalle');
            $table->foreign('id_periodo', 'fk_tramo_periodo')->references('id_periodo')->on('periodos');
            $table->foreign('id_unidad', 'fk_tramo_unidad')->references('id_unidad')->on('unidades');
            $table->foreign('id_ocupacion', 'fk_tramo_ocupacion')->references('id_ocupacion')->on('ocupacion_unidad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidacion_luz_tramo');
    }
};
