<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('comprobantes_pago', 'leido_en_inquilino')) {
            return;
        }

        // Separado de `leido_en` a proposito: esa columna registra si el STAFF
        // ya reviso el comprobante en la cola de revision, no si el inquilino
        // vio que ya se resolvio -- son dos audiencias distintas leyendo el
        // mismo registro en momentos distintos.
        Schema::table('comprobantes_pago', function (Blueprint $table) {
            $table->timestamp('leido_en_inquilino')->nullable()->after('leido_en');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('comprobantes_pago', 'leido_en_inquilino')) {
            return;
        }

        Schema::table('comprobantes_pago', function (Blueprint $table) {
            $table->dropColumn('leido_en_inquilino');
        });
    }
};
