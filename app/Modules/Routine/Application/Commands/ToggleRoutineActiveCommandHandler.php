<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use Ramsey\Uuid\Uuid;

class ToggleRoutineActiveCommandHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository
    ) {
    }

    public function handle(ToggleRoutineActiveCommand $command): void
    {
        $routine = $this->routineRepository->findById(Uuid::fromString($command->routineId));

        if (!$routine) {
            throw new \DomainException('Routine not found');
        }

        if ($routine->userId() !== $command->userId) {
            throw new \DomainException('Unauthorized to update this routine');
        }

        $routine->toggleActive();

        $this->routineRepository->save($routine);
    }
}
