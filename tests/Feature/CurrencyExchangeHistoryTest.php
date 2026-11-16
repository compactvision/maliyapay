<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Ramsey\Uuid\Uuid;
use RuntimeException;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CurrencyExchangeHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_exchange_is_dated_in_history_and_does_not_count_as_spending(): void
    {
        $this->travelTo(now()->setDate(2026, 11, 16)->setTime(8, 42, 31));
        $accountId = $this->walletForSignedInUser();

        $this->postJson("/api/accounts/{$accountId}/exchange", $this->exchangePayload())
            ->assertOk()
            ->assertJsonPath('converted_amount', 22501.125);

        $history = $this->getJson('/api/transactions?month=2026-11')->assertOk();
        $history->assertJsonCount(1, 'data')->assertJsonCount(0, 'meta.totals');
        $entry = $history->json('data.0');
        $this->assertSame('exchange', $entry['type']);
        $this->assertSame('2026-11-16T08:42:31+00:00', $entry['date']);
        $this->assertSame($accountId, $entry['account_id']);
        $this->assertSame(10.0005, $entry['amount']);
        $this->assertSame('USD', $entry['currency']);
        $this->assertSame(22501.125, $entry['converted_amount']);
        $this->assertSame('CDF', $entry['to_currency']);
        $this->assertSame(2250, $entry['exchange_rate']);
        $this->assertNull($entry['category_id']);

        $this->getJson('/api/transactions?month=2026-10')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/dashboard')->assertOk()
            ->assertJsonPath('recent_transactions.0.id', $entry['id'])
            ->assertJsonPath('recent_transactions.0.converted_amount', 22501.125)
            ->assertJsonCount(0, 'stats.expenses');
        $this->getJson('/api/statistics?currency=USD')->assertOk()
            ->assertJsonPath('transactionCount', 0)
            ->assertJsonPath('currentExpenses', 0);

        $this->putJson("/api/transactions/{$entry['id']}", ['amount' => 1])->assertConflict();
        $this->deleteJson("/api/transactions/{$entry['id']}")->assertConflict();
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('account_balances', ['account_id' => $accountId, 'currency_code' => 'USD', 'balance' => 89.9995]);
        $this->assertDatabaseHas('account_balances', ['account_id' => $accountId, 'currency_code' => 'CDF', 'balance' => 22501.125]);
    }

    public function test_month_offsets_place_the_exchange_in_the_local_month(): void
    {
        $this->travelTo(now()->setDate(2026, 11, 30)->setTime(23, 30));
        $accountId = $this->walletForSignedInUser();
        $this->postJson("/api/accounts/{$accountId}/exchange", $this->exchangePayload())->assertOk();
        $expenseId = $this->recordExpense($accountId);
        $this->putJson("/api/transactions/{$expenseId}", ['category_id' => null, 'type' => 'exchange'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'type']);

        $offsets = ['X-Month-Start-Offset' => '60', 'X-Month-End-Offset' => '60'];
        $this->getJson('/api/transactions?month=2026-11', $offsets)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $expenseId)
            ->assertJsonPath('data.0.type', 'expense')
            ->assertJsonPath('data.0.date', '2026-11-30 23:30:00');
        $this->getJson('/api/transactions?month=2026-12', $offsets)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.date', '2026-11-30T23:30:00+00:00');
        $this->getJson('/api/transactions?month=2026-11', ['X-Month-Start-Offset' => 'invalid', 'X-Month-End-Offset' => '60'])
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_rejected_exchange_leaves_the_history_and_balances_untouched(): void
    {
        $accountId = $this->walletForSignedInUser();

        $this->postJson("/api/accounts/{$accountId}/exchange", [...$this->exchangePayload(), 'amount' => 101])
            ->assertBadRequest();

        $this->assertUnchangedWallet($accountId);
    }

    public function test_history_write_failure_rolls_back_both_wallet_balances(): void
    {
        $accountId = $this->walletForSignedInUser();
        $this->mock(TransactionRepositoryInterface::class)
            ->shouldReceive('save')
            ->once()
            ->andThrow(new RuntimeException('Simulated history write failure'));

        $this->postJson("/api/accounts/{$accountId}/exchange", $this->exchangePayload())
            ->assertInternalServerError();

        $this->assertUnchangedWallet($accountId);
    }

    private function walletForSignedInUser(): string
    {
        $user = User::factory()->create();
        foreach (['edit accounts', 'view transactions', 'edit transactions', 'delete transactions', 'view dashboard', 'view statistics'] as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }
        Sanctum::actingAs($user);

        $accountId = Uuid::uuid4()->toString();
        DB::table('accounts')->insert([
            'id' => $accountId,
            'user_id' => $user->id,
            'name' => 'Cash',
            'type' => 'cash',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        foreach (['USD' => 100, 'CDF' => 0] as $currency => $balance) {
            DB::table('account_balances')->insert([
                'id' => Uuid::uuid4()->toString(),
                'account_id' => $accountId,
                'currency_code' => $currency,
                'balance' => $balance,
            ]);
        }

        return $accountId;
    }

    private function recordExpense(string $accountId): string
    {
        $categoryId = Uuid::uuid4()->toString();
        DB::table('categories')->insert([
            'id' => $categoryId,
            'user_id' => auth()->id(),
            'name' => 'Courses',
            'color' => '#0A6633',
            'type' => 'expense',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $expenseId = Uuid::uuid4()->toString();
        DB::table('transactions')->insert([
            'id' => $expenseId,
            'user_id' => auth()->id(),
            'account_id' => $accountId,
            'category_id' => $categoryId,
            'amount' => 1,
            'currency' => 'USD',
            'type' => 'expense',
            'description' => 'Courses',
            'date' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $expenseId;
    }

    private function exchangePayload(): array
    {
        return ['from_currency' => 'USD', 'to_currency' => 'CDF', 'amount' => 10.0005, 'rate' => 2250];
    }

    private function assertUnchangedWallet(string $accountId): void
    {
        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseHas('account_balances', ['account_id' => $accountId, 'currency_code' => 'USD', 'balance' => 100]);
        $this->assertDatabaseHas('account_balances', ['account_id' => $accountId, 'currency_code' => 'CDF', 'balance' => 0]);
    }
}
