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
        Schema::create('habit_insights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type'); // task, finance
            $table->string('period'); // day, week, month
            $table->integer('score');
            $table->text('summary');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('performance_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('source'); // task, finance
            $table->date('date');
            $table->decimal('achieved', 10, 2);
            $table->decimal('expected', 10, 2);
            $table->decimal('delta', 10, 2);
            $table->text('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['source', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_metrics');
        Schema::dropIfExists('habit_insights');
    }
};
