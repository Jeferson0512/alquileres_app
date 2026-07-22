<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * `activa_flag` (Fase 1, ocupacion_activa_constraint.sql) se creo como
 * TINYINT guardando directamente el id_unidad -- funciona mientras
 * id_unidad no pase de 127 (rango de un TINYINT con signo). Hoy el
 * id_unidad real mas alto es 14, asi que nunca fallo en produccion, pero
 * es una bomba de tiempo: el auto_increment de `unidades` sigue creciendo
 * cada vez que corre el seed E2E (aunque despues se limpie), y tarde o
 * temprano iba a superar 127 y romper silenciosamente cualquier alta de
 * ocupacion ACTIVA. Se ensancha a INT UNSIGNED, el mismo tipo real de
 * `unidades.id_unidad`.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE ocupacion_unidad DROP INDEX uq_ocupacion_unidad_activa');
        DB::statement("ALTER TABLE ocupacion_unidad MODIFY COLUMN activa_flag INT UNSIGNED GENERATED ALWAYS AS (IF(estado = 'ACTIVO', id_unidad, NULL)) STORED");
        DB::statement('CREATE UNIQUE INDEX uq_ocupacion_unidad_activa ON ocupacion_unidad (id_unidad, activa_flag)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE ocupacion_unidad DROP INDEX uq_ocupacion_unidad_activa');
        DB::statement("ALTER TABLE ocupacion_unidad MODIFY COLUMN activa_flag TINYINT GENERATED ALWAYS AS (IF(estado = 'ACTIVO', id_unidad, NULL)) STORED");
        DB::statement('CREATE UNIQUE INDEX uq_ocupacion_unidad_activa ON ocupacion_unidad (id_unidad, activa_flag)');
    }
};
