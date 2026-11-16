<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Transaction\Domain\Events\TransactionCreated;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Ramsey\Uuid\Uuid;
use RuntimeException;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

final class TransactionIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/transactions/idempotent';

    public function test_replay_returns_the_original_id_after_funds_and_budget_are_spent(): void
    {
        Event::fake([TransactionCreated::class]);
        $user = $this->signIn();
        $payload = $this->expense($user);
        $headers = ['Idempotency-Key' => 'lost-response'];

        DB::table('budgets')->insert([
            'id' => Uuid::uuid4()->toString(),
            'user_id' => $user->id,
            'category_id' => $payload['category_id'],
            'amount' => $payload['amount'],
            'currency' => $payload['currency'],
            'period' => 'monthly',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $first = $this->postJson(self::ENDPOINT, $payload, $headers)->assertCreated();
        $id = $first->json('transaction_id');

        $this->postJson(self::ENDPOINT, $payload, $headers)
            ->assertCreated()
            ->assertJsonPath('transaction_id', $id);

        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('transaction_idempotency_keys', ['transaction_id' => $id]);
        $this->assertDatabaseHas('account_balances', ['account_id' => $payload['account_id'], 'balance' => 0]);
        Event::assertDispatchedTimes(TransactionCreated::class, 1);
    }

    public function test_reusing_the_same_key_for_another_payload_conflicts(): void
    {
        Event::fake([TransactionCreated::class]);
        $payload = $this->expense($this->signIn());
        $headers = ['Idempotency-Key' => 'shared-key'];

        $this->postJson(self::ENDPOINT, $payload, $headers)->assertCreated();
        $this->postJson(self::ENDPOINT, [...$payload, 'amount' => 1], $headers)->assertConflict();

        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseHas('account_balances', ['account_id' => $payload['account_id'], 'balance' => 0]);
        Event::assertDispatchedTimes(TransactionCreated::class, 1);
    }

    public function test_same_key_can_be_used_by_another_user(): void
    {
        Event::fake([TransactionCreated::class]);
        $firstUser = $this->signIn();
        $headers = ['Idempotency-Key' => 'device-key'];
        $first = $this->postJson(self::ENDPOINT, $this->expense($firstUser), $headers)->assertCreated();

        $secondUser = $this->signIn();
        $second = $this->postJson(self::ENDPOINT, $this->expense($secondUser), $headers)->assertCreated();

        $this->assertNotSame($first->json('transaction_id'), $second->json('transaction_id'));
        $this->assertDatabaseCount('transaction_idempotency_keys', 2);
    }

    public function test_replay_does_not_recreate_a_transaction_after_its_category_is_deleted(): void
    {
        Event::fake([TransactionCreated::class]);
        $payload = $this->expense($this->signIn());
        $headers = ['Idempotency-Key' => 'deleted-transaction'];

        $first = $this->postJson(self::ENDPOINT, $payload, $headers)->assertCreated();
        DB::table('categories')->where('id', $payload['category_id'])->delete();

        $this->postJson(self::ENDPOINT, $payload, $headers)
            ->assertCreated()
            ->assertJsonPath('transaction_id', $first->json('transaction_id'));

        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseCount('transaction_idempotency_keys', 1);
        Event::assertDispatchedTimes(TransactionCreated::class, 1);
    }

    public function test_failure_during_write_rolls_back_wallet_transaction_and_key(): void
    {
        Event::fake([TransactionCreated::class]);
        $payload = $this->expense($this->signIn());
        $headers = ['Idempotency-Key' => 'failed-write'];
        $rejectLedgerInsert = true;

        DB::listen(static function (QueryExecuted $query) use (&$rejectLedgerInsert): void {
            if ($rejectLedgerInsert && str_contains($query->sql, 'insert into "transaction_idempotency_keys"')) {
                throw new RuntimeException('Simulated failure while saving the idempotency record');
            }
        });

        $this->postJson(self::ENDPOINT, $payload, $headers)->assertInternalServerError();

        $this->assertDatabaseHas('account_balances', ['account_id' => $payload['account_id'], 'balance' => 20]);
        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseCount('transaction_idempotency_keys', 0);
        Event::assertNotDispatched(TransactionCreated::class);

        $rejectLedgerInsert = false;
        $this->postJson(self::ENDPOINT, $payload, $headers)->assertCreated();

        $this->assertDatabaseHas('account_balances', ['account_id' => $payload['account_id'], 'balance' => 0]);
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseCount('transaction_idempotency_keys', 1);
        Event::assertDispatchedTimes(TransactionCreated::class, 1);
    }

    public function test_key_is_required_only_on_the_dedicated_endpoint(): void
    {
        Event::fake([TransactionCreated::class]);
        $payload = $this->expense($this->signIn());

        $this->postJson(self::ENDPOINT, [...$payload, 'idempotency_key' => 'body-only'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('idempotency_key');
        $this->postJson(self::ENDPOINT, $payload, ['Idempotency-Key' => 'invalid,key'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('idempotency_key');
        $this->assertDatabaseCount('transactions', 0);

        $this->postJson('/api/transactions', $payload)->assertCreated();
        $this->assertDatabaseCount('transactions', 1);
        $this->assertDatabaseCount('transaction_idempotency_keys', 0);
    }

    private function signIn(): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('create transactions', 'web'));
        Sanctum::actingAs($user);

        return $user;
    }

    private function expense(User $user): array
    {
        $accountId = Uuid::uuid4()->toString();
        $categoryId = Uuid::uuid4()->toString();

        DB::table('accounts')->insert([
            'id' => $accountId,
            'user_id' => $user->id,
            'name' => 'Cash',
            'type' => 'cash',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('account_balances')->insert([
            'id' => Uuid::uuid4()->toString(),
            'account_id' => $accountId,
            'currency_code' => 'USD',
            'balance' => 20,
        ]);
        DB::table('categories')->insert([
            'id' => $categoryId,
            'user_id' => $user->id,
            'name' => 'Groceries',
            'color' => '#0A6633',
            'type' => 'expense',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [
            'account_id' => $accountId,
            'category_id' => $categoryId,
            'amount' => 20,
            'currency' => 'USD',
            'type' => 'expense',
            'description' => 'Groceries',
            'date' => '2026-11-16T08:00:00Z',
        ];
    }
}
