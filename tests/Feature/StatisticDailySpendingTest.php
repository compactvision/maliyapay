<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

final class StatisticDailySpendingTest extends TestCase
{
    use RefreshDatabase;

    public function test_daily_spending_includes_trailing_dates_across_a_month_boundary(): void
    {
        $this->travelTo(Carbon::parse('2026-11-02 12:00:00'));

        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('view statistics', 'web'));
        Sanctum::actingAs($user);

        $account = Str::uuid()->toString();
        $expenseCategory = Str::uuid()->toString();
        $incomeCategory = Str::uuid()->toString();
        DB::table('accounts')->insert([
            'id' => $account,
            'user_id' => $user->id,
            'name' => 'Wallet',
            'type' => 'cash',
        ]);
        DB::table('categories')->insert([
            ['id' => $expenseCategory, 'user_id' => $user->id, 'name' => 'Food', 'type' => 'expense', 'color' => '#10B981'],
            ['id' => $incomeCategory, 'user_id' => $user->id, 'name' => 'Income', 'type' => 'income', 'color' => '#10B981'],
        ]);

        $transactions = [];
        foreach ([
            ['2026-10-26 23:59:59', 99, 'USD', 'expense'],
            ['2026-10-27 00:00:00', 10, 'USD', 'expense'],
            ['2026-10-31 23:59:59', 40, 'USD', 'expense'],
            ['2026-11-01 00:00:00', 20, 'USD', 'expense'],
            ['2026-11-01 15:00:00', 500, 'CDF', 'expense'],
            ['2026-11-02 08:00:00', 100, 'USD', 'income'],
        ] as [$date, $amount, $currency, $type]) {
            $transactions[] = [
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'account_id' => $account,
                'category_id' => $type === 'expense' ? $expenseCategory : $incomeCategory,
                'amount' => $amount,
                'currency' => $currency,
                'type' => $type,
                'description' => 'Payment',
                'date' => $date,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        DB::table('transactions')->insert($transactions);

        $this->getJson('/api/statistics?currency=USD')
            ->assertOk()
            ->assertJsonPath('currency', 'USD')
            ->assertJsonPath('dailySpending', [
                ['name' => 'Mar', 'amount' => 10],
                ['name' => 'Mer', 'amount' => 0],
                ['name' => 'Jeu', 'amount' => 0],
                ['name' => 'Ven', 'amount' => 0],
                ['name' => 'Sam', 'amount' => 40],
                ['name' => 'Dim', 'amount' => 20],
                ['name' => 'Lun', 'amount' => 0],
            ])
            ->assertJsonPath('currentIncome', 100)
            ->assertJsonPath('currentExpenses', 20)
            ->assertJsonPath('transactionCount', 2)
            ->assertJsonPath('expensesByCategory.0.value', 20)
            ->assertJsonPath('monthlyTrend.4.expenses', 149)
            ->assertJsonPath('monthlyTrend.5.expenses', 20);
    }
}
