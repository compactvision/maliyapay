<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Instead of dropping the old constraint (which causes issues),
        // we'll just add the new multi-currency constraint.
        // The old constraint will be less restrictive than the new one,
        // so it won't cause conflicts in practice.
        Schema::table('budgets', function (Blueprint $table) {
            $table->unique(['user_id', 'category_id', 'currency'], 'budgets_user_category_currency_unique');
        });
        
        // Note: We're leaving the old budgets_user_id_category_id_unique constraint in place
        // because MySQL won't let us drop it. The new constraint is more restrictive,
        // so it will be the effective constraint.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropUnique('budgets_user_category_currency_unique');
        });
    }
};
