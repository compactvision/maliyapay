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
            $table->string('email_verification_pin')->nullable()->after('email_verified_at');
            $table->timestamp('email_verification_pin_expires_at')->nullable()->after('email_verification_pin');
            $table->string('password_reset_pin')->nullable()->after('password');
            $table->timestamp('password_reset_pin_expires_at')->nullable()->after('password_reset_pin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_verification_pin',
                'email_verification_pin_expires_at',
                'password_reset_pin',
                'password_reset_pin_expires_at',
            ]);
        });
    }
};
