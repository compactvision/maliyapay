<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Queries;

class GetRoutineTasksForDayQuery
{
    public function __construct(
        public readonly int $userId,
        public readonly int $dayOfWeek // 1-7
    ) {
    }
}
