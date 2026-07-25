<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('contact_inquiries', 'leido_en')) {
            return;
        }

        Schema::table('contact_inquiries', function (Blueprint $table) {
            $table->timestamp('leido_en')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('contact_inquiries', 'leido_en')) {
            return;
        }

        Schema::table('contact_inquiries', function (Blueprint $table) {
            $table->dropColumn('leido_en');
        });
    }
};
