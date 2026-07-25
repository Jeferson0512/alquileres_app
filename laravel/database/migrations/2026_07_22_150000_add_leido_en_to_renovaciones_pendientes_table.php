<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('renovaciones_pendientes', 'leido_en')) {
            return;
        }

        Schema::table('renovaciones_pendientes', function (Blueprint $table) {
            $table->timestamp('leido_en')->nullable()->after('estado');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('renovaciones_pendientes', 'leido_en')) {
            return;
        }

        Schema::table('renovaciones_pendientes', function (Blueprint $table) {
            $table->dropColumn('leido_en');
        });
    }
};
