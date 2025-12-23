<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_forecasts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('generated_at');
            $table->decimal('current_balance', 15, 2);
            $table->decimal('avg_daily_spending', 15, 2);
            $table->decimal('projected_end_balance', 15, 2);
            $table->timestamp('zero_balance_date')->nullable();
            $table->string('status'); // positive, neutral, warning, critical
            $table->json('recommendations');
            $table->timestamps();
            
            // Index for querying latest forecast per user
            $table->index(['user_id', 'generated_at']);
            
            // Index for finding critical forecasts
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_forecasts');
    }
};
