<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Queries;

use App\Modules\Routine\Domain\Repositories\RoutineRepositoryInterface;

class GetUserRoutinesQueryHandler
{
    public function __construct(
        private RoutineRepositoryInterface $routineRepository
    ) {
    }

    public function handle(GetUserRoutinesQuery $query): array
    {
        if ($query->activeOnly) {
            return $this->routineRepository->findActiveByUserId($query->userId);
        }

        return $this->routineRepository->findByUserId($query->userId);
    }
}
