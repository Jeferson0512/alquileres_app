<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Un pago en efectivo entregado en mano no siempre tiene una foto que lo
 * respalde (a diferencia de una captura de Yape/Plin/transferencia) -- se
 * pide, pero ya no es obligatoria solo para ese metodo.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE comprobantes_pago MODIFY imagen_path VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE comprobantes_pago MODIFY imagen_path VARCHAR(255) NOT NULL');
    }
};
