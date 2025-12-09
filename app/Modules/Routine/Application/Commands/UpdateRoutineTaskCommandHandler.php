<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use Ramsey\Uuid\Uuid;

class UpdateRoutineTaskCommandHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(UpdateRoutineTaskCommand $command): void
    {
        $routineTask = $this->routineTaskRepository->findById(Uuid::fromString($command->routineTaskId));

        if (!$routineTask) {
            throw new \DomainException('Routine task not found');
        }

        // Verify user owns the routine
        $routine = $this->routineRepository->findById($routineTask->routineId());

        if (!$routine || $routine->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to update this task');
        }

        $routineTask->update(
            title: $command->title,
            description: $command->description,
            dayOfWeek: DayOfWeek::fromInt($command->dayOfWeek),
            timeRange: TimeRange::create($command->timeStart, $command->timeEnd),
            priority: TaskPriority::fromString($command->priority),
            orderIndex: $command->orderIndex
        );

        $this->routineTaskRepository->save($routineTask);
    }
}
