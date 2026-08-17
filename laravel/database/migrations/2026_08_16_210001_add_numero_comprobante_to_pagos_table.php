<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('pagos', 'numero_comprobante')) {
            return;
        }

        // Nullable a proposito: los pagos historicos (previos a esta migracion)
        // se quedan sin numero -- asignar uno retroactivo seria fabricar un
        // correlativo que nunca existio. Solo los pagos nuevos lo llevan.
        //
        // Sin UNIQUE: PagoService::reaplicarPago() reutiliza a proposito el
        // mismo numero del pago original reversado -- ambas filas representan
        // el mismo cobro real, no dos comprobantes distintos.
        Schema::table('pagos', function (Blueprint $table) {
            $table->string('numero_comprobante', 20)->nullable()->after('id_pago');
            $table->index('numero_comprobante');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('pagos', 'numero_comprobante')) {
            return;
        }

        Schema::table('pagos', function (Blueprint $table) {
            $table->dropIndex(['numero_comprobante']);
            $table->dropColumn('numero_comprobante');
        });
    }
};
