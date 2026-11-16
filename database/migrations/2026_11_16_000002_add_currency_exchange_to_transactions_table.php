<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->uuid('category_id')->nullable()->change();
            $table->decimal('amount', 20, 6)->change();
            $table->decimal('converted_amount', 20, 6)->nullable();
            $table->string('to_currency', 3)->nullable();
            $table->double('exchange_rate')->nullable();
        });
    }

    public function down(): void
    {
        DB::table('transactions')->where('type', 'exchange')->delete();

        Schema::table('transactions', function (Blueprint $table) {
            $table->uuid('category_id')->nullable(false)->change();
            $table->decimal('amount', 15, 2)->change();
            $table->dropColumn(['converted_amount', 'to_currency', 'exchange_rate']);
        });
    }
};
