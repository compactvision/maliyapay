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
        Schema::table('budgets', function (Blueprint $table) {
            // Optimize queries for user's budgets by category
            // Note: We already have budgets_user_category_currency_unique
            // This is just for documentation - the unique constraint already serves as an index
            // $table->index(['user_id', 'category_id'], 'idx_user_category');
            
            // No additional indexes needed - the unique constraint already provides indexing
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            // Nothing to drop
        });
    }
};
