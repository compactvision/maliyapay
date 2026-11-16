<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_idempotency_keys', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->char('key_hash', 64);
            $table->char('request_hash', 64);
            // Keep successful keys even if the original transaction is deleted.
            $table->uuid('transaction_id');
            $table->primary(['user_id', 'key_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_idempotency_keys');
    }
};
