<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('payment_gateway_transactions')) {
            return;
        }

        Schema::create('payment_gateway_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('id_pago');
            $table->string('provider', 40);
            $table->string('external_transaction_id', 120)->nullable();
            $table->enum('status', ['PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED'])->default('PENDING');
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->index('id_pago', 'idx_gateway_tx_pago');
            $table->index('status', 'idx_gateway_tx_status');
            $table->foreign('id_pago', 'fk_gateway_tx_pago')->references('id_pago')->on('pagos');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_transactions');
    }
};
