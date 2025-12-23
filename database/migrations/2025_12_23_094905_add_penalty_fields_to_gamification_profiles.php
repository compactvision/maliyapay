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
            $table->integer('total_xp_earned')->default(0)->after('xp');
            $table->integer('total_xp_lost')->default(0)->after('total_xp_earned');
            $table->timestamp('last_penalty_at')->nullable()->after('total_xp_lost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gamification_profiles', function (Blueprint $table) {
            $table->dropColumn(['total_xp_earned', 'total_xp_lost', 'last_penalty_at']);
        });
    }
};
