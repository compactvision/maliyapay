<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

use App\Modules\Routine\Domain\Entities\RoutineTask;
use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use Ramsey\Uuid\Uuid;

class CreateRoutineTaskCommandHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(CreateRoutineTaskCommand $command): RoutineTask
    {
        // Verify routine exists and user owns it
        $routine = $this->routineRepository->findById(Uuid::fromString($command->routineId));

        if (!$routine) {
            throw new \DomainException('Routine not found');
        }

        if ($routine->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to add tasks to this routine');
        }

        $routineTask = RoutineTask::create(
            id: Uuid::uuid4(),
            routineId: $routine->id(),
            title: $command->title,
            description: $command->description,
            dayOfWeek: DayOfWeek::fromInt($command->dayOfWeek),
            timeRange: TimeRange::create($command->timeStart, $command->timeEnd),
            priority: TaskPriority::fromString($command->priority),
            orderIndex: $command->orderIndex
        );

        $this->routineTaskRepository->save($routineTask);

        return $routineTask;
    }
}
