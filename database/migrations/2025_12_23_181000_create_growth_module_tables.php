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
        Schema::create('growth_advices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('summary');
            $table->text('content')->nullable();
            $table->string('category');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        Schema::create('growth_routine_kits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });

        Schema::create('growth_routine_kit_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kit_id')->constrained('growth_routine_kits')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->integer('day_of_week')->nullable(); // 1-7
            $table->string('time_start')->nullable();
            $table->string('time_end')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->timestamps();
        });

        Schema::create('growth_business_models', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('icon')->nullable();
            $table->string('difficulty')->default('Moyen');
            $table->string('potential')->default('Élevé');
            $table->timestamps();
        });

        Schema::create('growth_business_steps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_model_id')->constrained('growth_business_models')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        Schema::create('growth_user_business_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('business_model_id')->constrained('growth_business_models')->onDelete('cascade');
            $table->json('completed_steps')->nullable();
            $table->string('status')->default('in_progress');
            $table->timestamps();

            $table->unique(['user_id', 'business_model_id'], 'user_business_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('growth_user_business_progress');
        Schema::dropIfExists('growth_business_steps');
        Schema::dropIfExists('growth_business_models');
        Schema::dropIfExists('growth_routine_kit_tasks');
        Schema::dropIfExists('growth_routine_kits');
        Schema::dropIfExists('growth_advices');
    }
};
