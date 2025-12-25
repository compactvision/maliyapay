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
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
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

        // Check if user already imported this kit (by checking if a routine with the same name exists)
        $existingRoutines = $this->routineRepository->findByUserId($userId);
        foreach ($existingRoutines as $existingRoutine) {
            if ($existingRoutine->name() === $kit->name) {
                throw new \Exception("Vous avez déjà importé cette routine");
            }
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
            // Skip tasks without required fields
            if (!$task->dayOfWeek || !$task->timeStart || !$task->timeEnd) {
                continue;
            }
            
            $routineTask = RoutineTask::create(
                id: Uuid::uuid4(),
                routineId: $routineId,
                title: $task->title,
                description: $task->description,
                dayOfWeek: DayOfWeek::from($task->dayOfWeek),
                timeRange: TimeRange::create($task->timeStart, $task->timeEnd),
                priority: TaskPriority::from($task->priority),
                orderIndex: $task->orderIndex
            );
            $this->routineTaskRepository->save($routineTask);
        }
    }
}
