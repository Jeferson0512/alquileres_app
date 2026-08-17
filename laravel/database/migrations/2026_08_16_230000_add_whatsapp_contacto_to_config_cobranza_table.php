<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('config_cobranza', 'whatsapp_contacto')) {
            return;
        }

        Schema::table('config_cobranza', function (Blueprint $table) {
            $table->string('whatsapp_contacto', 20)->nullable()->after('yape_qr');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('config_cobranza', 'whatsapp_contacto')) {
            return;
        }

        Schema::table('config_cobranza', function (Blueprint $table) {
            $table->dropColumn('whatsapp_contacto');
        });
    }
};
