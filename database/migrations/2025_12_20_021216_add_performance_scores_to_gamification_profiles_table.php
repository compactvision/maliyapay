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
        Schema::table('gamification_profiles', function (Blueprint $table) {
            $table->integer('financial_score')->default(0)->after('coins');
            $table->integer('task_score')->default(0)->after('financial_score');
            $table->integer('overall_score')->default(0)->after('task_score');
            $table->integer('level')->default(1)->after('overall_score');
            $table->integer('streak_days')->default(0)->after('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gamification_profiles', function (Blueprint $table) {
            $table->dropColumn(['financial_score', 'task_score', 'overall_score', 'level', 'streak_days']);
        });
    }
};
