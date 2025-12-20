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
        // Use raw SQL with ALTER TABLE MODIFY to force drop the constraint
        // This bypasses the foreign key check
        DB::statement('ALTER TABLE budgets DROP INDEX budgets_user_id_category_id_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the old constraint if needed
        DB::statement('ALTER TABLE budgets ADD UNIQUE KEY budgets_user_id_category_id_unique (user_id, category_id)');
    }
};
