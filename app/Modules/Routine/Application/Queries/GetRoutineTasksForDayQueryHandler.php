<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Queries;

use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;

class GetRoutineTasksForDayQueryHandler
{
    public function __construct(
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function handle(GetRoutineTasksForDayQuery $query): array
    {
        $dayOfWeek = DayOfWeek::fromInt($query->dayOfWeek);

        return $this->routineTaskRepository->findByUserIdAndDayOfWeek(
            $query->userId,
            $dayOfWeek
        );
    }
}
