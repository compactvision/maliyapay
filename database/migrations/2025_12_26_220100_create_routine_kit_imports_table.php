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
        Schema::create('growth_routine_kit_imports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('kit_id')->constrained('growth_routine_kits')->onDelete('cascade');
            $table->timestamp('imported_at')->useCurrent();
            $table->timestamps();

            // Ensure one import record per user per kit
            $table->unique(['user_id', 'kit_id'], 'user_kit_import_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('growth_routine_kit_imports');
    }
};
