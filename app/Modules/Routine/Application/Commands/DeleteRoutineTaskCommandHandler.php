<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use Ramsey\Uuid\Uuid;

class DeleteRoutineTaskCommandHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(DeleteRoutineTaskCommand $command): void
    {
        $routineTask = $this->routineTaskRepository->findById(Uuid::fromString($command->routineTaskId));

        if (!$routineTask) {
            throw new \DomainException('Routine task not found');
        }

        // Verify user owns the routine
        $routine = $this->routineRepository->findById($routineTask->routineId());

        if (!$routine || $routine->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to delete this task');
        }

        $this->routineTaskRepository->delete($routineTask->id());
    }
}
