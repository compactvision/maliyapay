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
        Schema::table('transactions', function (Blueprint $table) {
            // Optimize queries filtering by user and date
            $table->index(['user_id', 'date'], 'idx_user_date');
            
            // Optimize budget tracking queries
            $table->index(['user_id', 'category_id', 'currency'], 'idx_user_category_currency');
            
            // Optimize account-related queries
            $table->index(['user_id', 'account_id'], 'idx_user_account');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('idx_user_date');
            $table->dropIndex('idx_user_category_currency');
            $table->dropIndex('idx_user_account');
        });
    }
};
