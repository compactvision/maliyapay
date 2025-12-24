<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Services;

use App\Modules\Growth\Domain\Repositories\RoutineKitRepositoryInterface;
use App\Modules\Routine\Domain\Entities\Routine;
use App\Modules\Routine\Domain\Entities\RoutineTask;
use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

class RoutineImportService
{
    public function __construct(
        private readonly RoutineKitRepositoryInterface $routineKitRepository,
        private readonly RoutineRepositoryInterface $routineRepository,
        private readonly RoutineTaskRepositoryInterface $routineTaskRepository
    ) {}

    public function importKitToUser(string $kitId, int $userId): void
    {
        $kit = $this->routineKitRepository->findById($kitId);
        if (!$kit) {
            throw new \Exception("Routine kit not found");
        }

        // Create a new normal routine for the user based on the kit
        $routineId = Uuid::uuid4();
        $routine = Routine::reconstitute(
            id: $routineId,
            userId: $userId,
            name: $kit->name,
            color: $kit->color ?? '#3b82f6',
            isActive: true,
            createdAt: new DateTimeImmutable(),
            updatedAt: new DateTimeImmutable()
        );

        $this->routineRepository->save($routine);

        // Copy all tasks from the kit
        foreach ($kit->tasks as $task) {
            $routineTask = RoutineTask::reconstitute(
                id: Uuid::uuid4(),
                routineId: $routineId,
                title: $task->title,
                description: $task->description,
                dayOfWeek: $task->dayOfWeek ? new DayOfWeek($task->dayOfWeek) : null,
                timeRange: ($task->timeStart && $task->timeEnd) 
                    ? new TimeRange($task->timeStart, $task->timeEnd) 
                    : null,
                priority: $task->priority,
                orderIndex: $task->orderIndex,
                createdAt: new DateTimeImmutable(),
                updatedAt: new DateTimeImmutable()
            );
            $this->routineTaskRepository->save($routineTask);
        }
    }
}
