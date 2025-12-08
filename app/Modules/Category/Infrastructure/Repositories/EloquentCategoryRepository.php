<?php

declare(strict_types=1);

namespace App\Modules\Category\Infrastructure\Repositories;

use App\Modules\Category\Domain\Entities\Category as CategoryEntity;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use App\Modules\Category\Domain\ValueObjects\CategoryColor;
use App\Modules\Category\Domain\ValueObjects\CategoryName;
use App\Modules\Category\Domain\ValueObjects\CategoryType;
use App\Modules\Category\Infrastructure\Models\Category as CategoryModel;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

/**
 * Eloquent Category Repository
 * 
 * Implements the repository interface using Eloquent ORM
 * Handles mapping between domain entities and Eloquent models
 */
class EloquentCategoryRepository implements CategoryRepositoryInterface
{
    public function __construct(
        private readonly CategoryModel $model
    ) {
    }

    public function findById(UuidInterface $id, string $userId): ?CategoryEntity
    {
        $model = $this->model
            ->where('id', $id->toString())
            ->where('user_id', $userId)
            ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    public function findAllByUser(string $userId): array
    {
        $models = $this->model
            ->where('user_id', $userId)
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function findByType(CategoryType $type, string $userId): array
    {
        $models = $this->model
            ->where('user_id', $userId)
            ->where('type', $type->value())
            ->orderBy('name')
            ->get();

        return $models->map(fn($model) => $this->toDomainEntity($model))->all();
    }

    public function existsByName(string $name, string $userId, ?UuidInterface $excludeId = null): bool
    {
        $query = $this->model
            ->where('user_id', $userId)
            ->where('name', $name);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId->toString());
        }

        return $query->exists();
    }

    public function save(CategoryEntity $category): void
    {
        $data = [
            'id' => $category->id()->toString(),
            'name' => $category->name()->value(),
            'type' => $category->type()->value(),
            'color' => $category->color()->value(),
            'user_id' => $category->userId(),
            'deleted_at' => $category->deletedAt()?->format('Y-m-d H:i:s'),
        ];

        $this->model->updateOrCreate(
            ['id' => $category->id()->toString()],
            $data
        );
    }

    public function delete(CategoryEntity $category): void
    {
        $this->model
            ->where('id', $category->id()->toString())
            ->delete();
    }

    public function countByUser(string $userId): int
    {
        return $this->model
            ->where('user_id', $userId)
            ->count();
    }

    public function countByType(CategoryType $type, string $userId): int
    {
        return $this->model
            ->where('user_id', $userId)
            ->where('type', $type->value())
            ->count();
    }

    /**
     * Map Eloquent model to domain entity
     */
    private function toDomainEntity(CategoryModel $model): CategoryEntity
    {
        return CategoryEntity::reconstitute(
            id: Uuid::fromString($model->id),
            name: CategoryName::fromString($model->name),
            type: CategoryType::fromString($model->type),
            color: CategoryColor::fromString($model->color),
            userId: (string) $model->user_id,
            createdAt: DateTimeImmutable::createFromMutable($model->created_at),
            updatedAt: DateTimeImmutable::createFromMutable($model->updated_at),
            deletedAt: $model->deleted_at ? DateTimeImmutable::createFromMutable($model->deleted_at) : null
        );
    }
}
