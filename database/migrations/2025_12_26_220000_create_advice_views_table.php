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
        Schema::create('growth_advice_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('advice_id')->constrained('growth_advices')->onDelete('cascade');
            $table->timestamp('viewed_at')->useCurrent();
            $table->timestamps();

            // Ensure one view per user per advice
            $table->unique(['user_id', 'advice_id'], 'user_advice_view_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('growth_advice_views');
    }
};
