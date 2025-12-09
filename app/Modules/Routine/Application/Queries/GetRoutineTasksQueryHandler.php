<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Queries;

use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use Ramsey\Uuid\Uuid;

class GetRoutineTasksQueryHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(GetRoutineTasksQuery $query): array
    {
        // Verify user owns the routine
        $routine = $this->routineRepository->findById(Uuid::fromString($query->routineId));

        if (!$routine || $routine->userId() !== $query->userId) {
            throw new \DomainException('Unauthorized to view this routine');
        }

        return $this->routineTaskRepository->findByRoutineId($routine->id());
    }
}
