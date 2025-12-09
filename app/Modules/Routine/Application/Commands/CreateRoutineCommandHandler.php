<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

use App\Modules\Routine\Domain\Entities\Routine;
use App\Modules\Routine\Domain\Entities\RoutineTask;
use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use Ramsey\Uuid\Uuid;

class CreateRoutineCommandHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(CreateRoutineCommand $command): Routine
    {
        $routine = Routine::create(
            id: Uuid::uuid4(),
            userId: $command->userId,
            name: $command->name,
            color: $command->color
        );

        $this->routineRepository->save($routine);

        // Create routine tasks
        foreach ($command->tasks as $taskData) {
            $routineTask = RoutineTask::create(
                id: Uuid::uuid4(),
                routineId: $routine->id(),
                title: $taskData['title'],
                description: $taskData['description'] ?? null,
                dayOfWeek: DayOfWeek::fromInt($taskData['dayOfWeek']),
                timeRange: TimeRange::create(
                    $taskData['timeStart'] ?? null,
                    $taskData['timeEnd'] ?? null
                ),
                priority: TaskPriority::fromString($taskData['priority'] ?? 'medium'),
                orderIndex: $taskData['orderIndex'] ?? 0
            );

            $this->routineTaskRepository->save($routineTask);
        }

        return $routine;
    }
}
