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
        Schema::table('performance_metrics', function (Blueprint $table) {
            $table->decimal('budget_adherence_score', 5, 2)->default(0)->after('metadata');
            $table->decimal('spending_vs_budget_ratio', 5, 2)->default(0)->after('budget_adherence_score');
            $table->json('categories_over_budget')->nullable()->after('spending_vs_budget_ratio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('performance_metrics', function (Blueprint $table) {
            $table->dropColumn(['budget_adherence_score', 'spending_vs_budget_ratio', 'categories_over_budget']);
        });
    }
};
