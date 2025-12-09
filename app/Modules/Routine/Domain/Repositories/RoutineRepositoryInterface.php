<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\Repositories;

use App\Modules\Routine\Domain\Entities\Routine;
use Ramsey\Uuid\UuidInterface;

interface RoutineRepositoryInterface
{
    public function save(Routine $routine): void;

    public function findById(UuidInterface $id): ?Routine;

    public function findByUserId(int $userId): array;

    public function findActiveByUserId(int $userId): array;

    public function delete(UuidInterface $id): void;

    public function exists(UuidInterface $id): bool;
}
