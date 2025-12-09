<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use Ramsey\Uuid\Uuid;

class DeleteRoutineCommandHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(DeleteRoutineCommand $command): void
    {
        $routine = $this->routineRepository->findById(Uuid::fromString($command->routineId));

        if (!$routine) {
            throw new \DomainException('Routine not found');
        }

        if ($routine->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to delete this routine');
        }

        // Delete all routine tasks first (cascade will handle this, but being explicit)
        $this->routineTaskRepository->deleteByRoutineId($routine->id());

        $this->routineRepository->delete($routine->id());
    }
}
