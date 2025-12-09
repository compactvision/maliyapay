<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->uuid('routine_task_id')->nullable()->after('user_id');
            $table->date('scheduled_for')->nullable()->after('due_date');

            $table->foreign('routine_task_id')
                ->references('id')
                ->on('routine_tasks')
                ->onDelete('set null');

            $table->index('scheduled_for');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['routine_task_id']);
            $table->dropColumn(['routine_task_id', 'scheduled_for']);
        });
    }
};
