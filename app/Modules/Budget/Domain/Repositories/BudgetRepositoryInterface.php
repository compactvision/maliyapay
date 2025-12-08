<?php

declare(strict_types=1);

namespace App\Modules\Budget\Domain\Repositories;

use App\Modules\Budget\Domain\Entities\Budget;
use Ramsey\Uuid\UuidInterface;

interface BudgetRepositoryInterface
{
    public function save(Budget $budget): void;
    public function findById(UuidInterface $id): ?Budget;
    public function findByCategory(string $userId, string $categoryId): ?Budget;
    public function findAllByUser(string $userId): array;
    public function delete(UuidInterface $id): void;
}
