<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'estado')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->enum('estado', ['ACTIVO', 'INACTIVO'])->default('ACTIVO')->after('email');
        });
    }

    public function down(): void
    {
        if (!Schema::hasColumn('users', 'estado')) {
            return;
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('estado');
        });
    }
};
