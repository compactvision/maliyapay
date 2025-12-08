<?php

declare(strict_types=1);

namespace App\Modules\Account\Infrastructure\Repositories;

use App\Modules\Account\Domain\Entities\Account;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Account\Domain\ValueObjects\AccountType;
use App\Modules\Account\Domain\ValueObjects\Balance;
use App\Modules\Account\Infrastructure\Models\Account as AccountModel;
use App\Modules\Account\Infrastructure\Models\AccountBalance as AccountBalanceModel;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class EloquentAccountRepository implements AccountRepositoryInterface
{
    public function __construct(
        private readonly AccountModel $model
    ) {
    }

    public function save(Account $account): void
    {
        DB::transaction(function () use ($account) {
            // Save Account
            $accountData = [
                'id' => $account->id()->toString(),
                'user_id' => $account->userId(),
                'name' => $account->name(),
                'type' => $account->type()->value,
                'color' => $account->color(),
                'is_archived' => $account->isArchived(),
                'deleted_at' => $account->deletedAt()?->format('Y-m-d H:i:s'),
            ];

            $this->model->updateOrCreate(
                ['id' => $account->id()->toString()],
                $accountData
            );

            // Save Balances
            // Strategy: Update existing or Create new.
            // Since we don't have IDs in Balance ValueObject, we use currency_code as key
            
            foreach ($account->balances() as $balance) {
                $balanceModel = AccountBalanceModel::firstOrNew([
                    'account_id' => $account->id()->toString(),
                    'currency_code' => $balance->currencyCode(),
                ]);

                if (!$balanceModel->exists) {
                    $balanceModel->id = Uuid::uuid4()->toString();
                }

                $balanceModel->balance = $balance->amount();
                $balanceModel->save();
            }
            
            // Note: If we need to remove balances that are not in the list, we'd need to diff.
            // For now, assume we only add/update.
        });
    }

    public function findById(UuidInterface $id, string $userId): ?Account
    {
        $model = $this->model->with('balances')
            ->where('id', $id->toString())
            ->where('user_id', $userId)
            ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAllByUser(string $userId): array
    {
        $models = $this->model->with('balances')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return $models->map(fn ($m) => $this->toDomainEntity($m))->all();
    }

    public function delete(Account $account): void
    {
        $this->model->where('id', $account->id()->toString())->delete();
    }

    private function toDomainEntity(AccountModel $model): Account
    {
        $balances = $model->balances->map(function ($b) {
            return new Balance(
                currencyCode: $b->currency_code,
                amount: (float) $b->balance
            );
        })->all();

        return Account::reconstitute(
            id: Uuid::fromString($model->id),
            userId: (string) $model->user_id,
            name: $model->name,
            type: AccountType::fromString($model->type),
            color: $model->color,
            isArchived: (bool) $model->is_archived,
            balances: $balances,
            createdAt: DateTimeImmutable::createFromMutable($model->created_at),
            updatedAt: DateTimeImmutable::createFromMutable($model->updated_at),
            deletedAt: $model->deleted_at ? DateTimeImmutable::createFromMutable($model->deleted_at) : null
        );
    }
}
