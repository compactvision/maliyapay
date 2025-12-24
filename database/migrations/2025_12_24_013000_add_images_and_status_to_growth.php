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
        Schema::table('growth_advices', function (Blueprint $table) {
            $table->json('images')->nullable()->after('reading_time_minutes');
        });

        Schema::table('growth_routine_kits', function (Blueprint $table) {
            $table->string('status')->default('published')->after('color');
            $table->json('images')->nullable()->after('is_paid');
        });

        Schema::table('growth_business_models', function (Blueprint $table) {
            $table->string('image')->nullable()->after('icon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('growth_business_models', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        Schema::table('growth_routine_kits', function (Blueprint $table) {
            $table->dropColumn(['status', 'images']);
        });

        Schema::table('growth_advices', function (Blueprint $table) {
            $table->dropColumn('images');
        });
    }
};
