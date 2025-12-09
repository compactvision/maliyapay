<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Infrastructure\Repositories;

use App\Modules\Transaction\Domain\Entities\Transaction;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use App\Modules\Transaction\Infrastructure\Models\Transaction as TransactionModel;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

class EloquentTransactionRepository implements TransactionRepositoryInterface
{
    public function save(Transaction $transaction): void
    {
        TransactionModel::updateOrCreate(
            ['id' => $transaction->id()->toString()],
            [
                'user_id' => $transaction->userId(),
                'account_id' => $transaction->accountId(),
                'category_id' => $transaction->categoryId(),
                'amount' => $transaction->amount(),
                'currency' => $transaction->currency(),
                'type' => $transaction->type()->value,
                'description' => $transaction->description(),
                'date' => $transaction->date(),
                'created_at' => $transaction->createdAt(),
                'updated_at' => $transaction->updatedAt(),
            ]
        );
    }

    public function getSpentAmountForCategory(string $userId, string $categoryId, DateTimeImmutable $startDate, DateTimeImmutable $endDate): float
    {
        return (float) TransactionModel::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', TransactionType::EXPENSE->value)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
    }

    public function getIncomeAmountForCategory(string $userId, string $categoryId, DateTimeImmutable $startDate, DateTimeImmutable $endDate): float
    {
        return (float) TransactionModel::where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->where('type', TransactionType::INCOME->value)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
    }

    public function findAllByUser(string $userId, ?int $limit = null): array
    {
        $query = TransactionModel::where('user_id', $userId)
            ->orderBy('date', 'desc');

        if ($limit) {
            $query->limit($limit);
        }

        $models = $query->get();

        return $models->map(fn (TransactionModel $model) => $this->toDomain($model))->toArray();
    }

    public function findByUserAndPeriod(string $userId, DateTimeImmutable $startDate, DateTimeImmutable $endDate): array
    {
        $models = TransactionModel::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        return $models->map(fn (TransactionModel $model) => $this->toDomain($model))->toArray();
    }

    public function findById(string $id, string $userId): ?Transaction
    {
        $model = TransactionModel::where('id', $id)->where('user_id', $userId)->first();
        if (!$model) {
            return null;
        }
        return $this->toDomain($model);
    }

    public function delete(Transaction $transaction): void
    {
        TransactionModel::where('id', $transaction->id()->toString())->delete();
    }

    private function toDomain(TransactionModel $model): Transaction
    {
        return Transaction::reconstitute(
            id: Uuid::fromString($model->id),
            userId: (string) $model->user_id,
            accountId: $model->account_id,
            categoryId: $model->category_id,
            amount: (float) $model->amount,
            currency: $model->currency,
            type: TransactionType::from($model->type),
            description: $model->description,
            date: new DateTimeImmutable($model->date->toDateTimeString()), // Ensure correct format
            createdAt: new DateTimeImmutable($model->created_at->toDateTimeString()),
            updatedAt: new DateTimeImmutable($model->updated_at->toDateTimeString())
        );
    }
}
