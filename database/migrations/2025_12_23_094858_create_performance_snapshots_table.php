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
        Schema::create('performance_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date')->index();
            $table->integer('financial_score')->default(0);
            $table->integer('task_score')->default(0);
            $table->integer('overall_score')->default(0);
            $table->integer('xp_gained')->default(0);
            $table->integer('xp_lost')->default(0);
            $table->json('insights')->nullable();
            $table->timestamps();
            
            // Ensure one snapshot per user per day
            $table->unique(['user_id', 'date']);
            
            // Index for querying date ranges
            $table->index(['user_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_snapshots');
    }
};
