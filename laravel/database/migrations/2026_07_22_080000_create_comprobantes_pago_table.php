<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('comprobantes_pago')) {
            return;
        }

        Schema::create('comprobantes_pago', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_cobro');
            $table->unsignedInteger('id_persona');
            $table->decimal('monto_declarado', 10, 2);
            $table->date('fecha_pago_declarada');
            $table->enum('metodo_pago', ['EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'OTRO'])->default('YAPE');
            $table->string('numero_operacion', 60)->nullable();
            $table->string('imagen_path', 255);
            $table->enum('estado', ['PENDIENTE', 'APROBADO', 'RECHAZADO'])->default('PENDIENTE');
            $table->string('motivo_rechazo', 255)->nullable();
            $table->string('revisado_por', 191)->nullable();
            $table->timestamp('fecha_revision')->nullable();
            $table->unsignedInteger('id_pago')->nullable();
            $table->timestamps();

            $table->index('id_cobro', 'idx_comprobantes_cobro');
            $table->index('id_persona', 'idx_comprobantes_persona');
            $table->index('estado', 'idx_comprobantes_estado');
            $table->foreign('id_cobro', 'fk_comprobantes_cobro')->references('id_cobro')->on('cobros_mensuales');
            $table->foreign('id_persona', 'fk_comprobantes_persona')->references('id_persona')->on('personas');
            $table->foreign('id_pago', 'fk_comprobantes_pago')->references('id_pago')->on('pagos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comprobantes_pago');
    }
};
