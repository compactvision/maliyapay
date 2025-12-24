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
        Schema::table('growth_routine_kits', function (Blueprint $table) {
            $table->boolean('is_paid')->default(false);
            $table->decimal('price_amount', 15, 2)->nullable();
            $table->string('price_currency')->nullable()->default('MONEY'); // 'MONEY' or 'XP'
        });

        Schema::table('growth_business_models', function (Blueprint $table) {
            $table->string('sector')->default('Général');
        });

        Schema::table('growth_business_steps', function (Blueprint $table) {
            $table->boolean('is_paid')->default(false);
            $table->decimal('price_amount', 15, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('growth_business_steps', function (Blueprint $table) {
            $table->dropColumn(['is_paid', 'price_amount']);
        });

        Schema::table('growth_business_models', function (Blueprint $table) {
            $table->dropColumn(['sector']);
        });

        Schema::table('growth_routine_kits', function (Blueprint $table) {
            $table->dropColumn(['is_paid', 'price_amount', 'price_currency']);
        });
    }
};
