<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = collect(Schema::getIndexes('budgets'))->pluck('name');

        if ($indexes->contains('budgets_user_id_category_id_unique')) {
            Schema::table('budgets', function (Blueprint $table): void {
                $table->dropUnique('budgets_user_id_category_id_unique');
            });
        }

        $indexes = collect(Schema::getIndexes('budgets'))->pluck('name');

        if (! $indexes->contains('budgets_user_category_currency_unique')) {
            Schema::table('budgets', function (Blueprint $table): void {
                $table->unique(
                    ['user_id', 'category_id', 'currency'],
                    'budgets_user_category_currency_unique'
                );
            });
        }
    }

    public function down(): void
    {
        $indexes = collect(Schema::getIndexes('budgets'))->pluck('name');

        if ($indexes->contains('budgets_user_category_currency_unique')) {
            Schema::table('budgets', function (Blueprint $table): void {
                $table->dropUnique('budgets_user_category_currency_unique');
            });
        }
    }
};
