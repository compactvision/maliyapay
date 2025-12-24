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
            $table->string('status')->default('draft')->after('category');
            $table->boolean('featured')->default(false)->after('status');
            $table->string('video_url')->nullable()->after('featured');
            $table->string('author_name')->nullable()->after('video_url');
            $table->integer('reading_time_minutes')->default(5)->after('author_name');
        });

        Schema::table('growth_business_models', function (Blueprint $table) {
            $table->string('season')->nullable()->after('potential');
            $table->string('cycle_duration')->nullable()->after('season');
            $table->json('soil_types')->nullable()->after('cycle_duration');
            $table->string('yield_potential')->nullable()->after('soil_types');
            $table->json('main_risks')->nullable()->after('yield_potential');
            $table->json('business_plan')->nullable()->after('main_risks');
        });

        Schema::table('growth_business_steps', function (Blueprint $table) {
            $table->integer('level')->default(1)->after('order_index');
            $table->string('objective')->nullable()->after('level');
            $table->json('knowledge')->nullable()->after('objective');
            $table->json('actions')->nullable()->after('knowledge');
            $table->json('costs')->nullable()->after('actions');
            $table->json('routines')->nullable()->after('costs');
            $table->json('progression')->nullable()->after('routines');
            $table->boolean('locked')->default(false)->after('progression');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('growth_business_steps', function (Blueprint $table) {
            $table->dropColumn([
                'level', 'objective', 'knowledge', 'actions', 
                'costs', 'routines', 'progression', 'locked'
            ]);
        });

        Schema::table('growth_business_models', function (Blueprint $table) {
            $table->dropColumn([
                'season', 'cycle_duration', 'soil_types', 
                'yield_potential', 'main_risks', 'business_plan'
            ]);
        });

        Schema::table('growth_advices', function (Blueprint $table) {
            $table->dropColumn([
                'status', 'featured', 'video_url', 'author_name', 'reading_time_minutes'
            ]);
        });
    }
};
