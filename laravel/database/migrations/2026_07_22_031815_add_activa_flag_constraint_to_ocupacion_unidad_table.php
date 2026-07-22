<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('ocupacion_unidad', 'activa_flag')) {
            return;
        }

        DB::statement("
            ALTER TABLE ocupacion_unidad
            ADD COLUMN activa_flag TINYINT GENERATED ALWAYS AS (IF(estado = 'ACTIVO', id_unidad, NULL)) STORED
        ");
        DB::statement('CREATE UNIQUE INDEX uq_ocupacion_unidad_activa ON ocupacion_unidad (id_unidad, activa_flag)');
    }

    public function down(): void
    {
        if (!Schema::hasColumn('ocupacion_unidad', 'activa_flag')) {
            return;
        }

        DB::statement('DROP INDEX uq_ocupacion_unidad_activa ON ocupacion_unidad');
        DB::statement('ALTER TABLE ocupacion_unidad DROP COLUMN activa_flag');
    }
};
