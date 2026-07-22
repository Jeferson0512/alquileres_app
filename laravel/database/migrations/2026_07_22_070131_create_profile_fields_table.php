<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profile_fields', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('label', 100);
            $table->boolean('required')->default(false);
            $table->timestamps();
        });

        DB::table('profile_fields')->insert([
            ['code' => 'celular', 'label' => 'Celular', 'required' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'direccion', 'label' => 'Dirección', 'required' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'email', 'label' => 'Email', 'required' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profile_fields');
    }
};
