<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\Repositories;

use App\Modules\Routine\Domain\Entities\RoutineTask;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use Ramsey\Uuid\UuidInterface;

interface RoutineTaskRepositoryInterface
{
    public function save(RoutineTask $routineTask): void;

    public function findById(UuidInterface $id): ?RoutineTask;

    public function findByRoutineId(UuidInterface $routineId): array;

    public function findByDayOfWeek(int $userId, DayOfWeek $dayOfWeek): array;

    public function findByUserIdAndDayOfWeek(int $userId, DayOfWeek $dayOfWeek): array;

    public function delete(UuidInterface $id): void;

    public function deleteByRoutineId(UuidInterface $routineId): void;
}
