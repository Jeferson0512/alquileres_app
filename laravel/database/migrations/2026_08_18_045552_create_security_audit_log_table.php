<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla nueva 100% Laravel-nativa (no toca ninguna de las 18 tablas
     * legacy) -- registra eventos de seguridad de cuentas: login exitoso/
     * fallido, cierre de sesion, reset de contraseña solicitado/completado,
     * y eliminacion de cuenta. No existia ningun registro de esto antes.
     */
    public function up(): void
    {
        Schema::create('security_audit_log', function (Blueprint $table) {
            $table->id();
            // Nullable: un intento fallido con un email que no existe no
            // tiene usuario real al que asociarse.
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('evento', 40);
            $table->string('ip', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->index(['evento', 'creado_en']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_audit_log');
    }
};
