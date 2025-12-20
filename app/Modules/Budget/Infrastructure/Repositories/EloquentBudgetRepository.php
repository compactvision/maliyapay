<?php

declare(strict_types=1);

namespace App\Modules\Budget\Infrastructure\Repositories;

use App\Modules\Budget\Domain\Entities\Budget;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Budget\Domain\ValueObjects\BudgetPeriod;
use App\Modules\Budget\Infrastructure\Models\Budget as BudgetModel;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class EloquentBudgetRepository implements BudgetRepositoryInterface
{
    public function __construct(
        private readonly BudgetModel $model
    ) {
    }

    public function save(Budget $budget): void
    {
        $this->model->updateOrCreate(
            ['id' => $budget->id()->toString()],
            [
                'user_id' => $budget->userId(),
                'category_id' => $budget->categoryId(),
                'amount' => $budget->amount(),
                'currency' => $budget->currency(),
                'period' => $budget->period()->value,
            ]
        );
    }

    public function findById(UuidInterface $id): ?Budget
    {
        $model = $this->model->with(['category'])->find($id->toString());
        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findByCategory(string $userId, string $categoryId): ?Budget
    {
        $model = $this->model
            ->with(['category'])
            ->where('user_id', $userId)
            ->where('category_id', $categoryId)
            ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAllByUser(string $userId): array
    {
        $models = $this->model
            ->where('user_id', $userId)
            ->with(['category'])
            ->get();

        return $models->map(fn ($m) => $this->toDomainEntity($m))->all();
    }

    public function delete(UuidInterface $id): void
    {
        $this->model->where('id', $id->toString())->delete();
    }

    private function toDomainEntity(BudgetModel $model): Budget
    {
        return Budget::reconstitute(
            id: Uuid::fromString($model->id),
            userId: (string) $model->user_id,
            categoryId: $model->category_id,
            amount: (float) $model->amount,
            currency: $model->currency,
            period: BudgetPeriod::fromString($model->period),
            createdAt: DateTimeImmutable::createFromMutable($model->created_at),
            updatedAt: DateTimeImmutable::createFromMutable($model->updated_at),
            categoryName: $model->category->name ?? null
        );
    }
}
