<?php

declare(strict_types=1);

namespace App\Modules\Task\Domain\Repositories;

use App\Modules\Task\Domain\Entities\Task;
use Ramsey\Uuid\UuidInterface;

interface TaskRepositoryInterface
{
    public function save(Task $task): void;

    public function findById(UuidInterface $id): ?Task;

    public function findByUserId(int $userId): array;

    public function delete(UuidInterface $id): void;

    public function exists(UuidInterface $id): bool;

    /**
     * @return Task[]
     */
    public function findAllActive(): array;
}
