<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routine_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('routine_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->tinyInteger('day_of_week'); // 1=Monday, 7=Sunday
            $table->time('time_start')->nullable();
            $table->time('time_end')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->foreign('routine_id')
                ->references('id')
                ->on('routines')
                ->onDelete('cascade');

            $table->index(['routine_id', 'day_of_week']);
            $table->index('day_of_week');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routine_tasks');
    }
};
