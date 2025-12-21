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
        Schema::table('users', function (Blueprint $table) {
            $table->string('pin_code')->nullable()->after('password');
            $table->boolean('auto_lock_enabled')->default(false)->after('pin_code');
            $table->integer('auto_lock_timeout')->default(5)->after('auto_lock_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pin_code', 'auto_lock_enabled', 'auto_lock_timeout']);
        });
    }
};
