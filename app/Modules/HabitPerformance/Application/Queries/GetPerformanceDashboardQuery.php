<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

class GetPerformanceDashboardQuery
{
    public function __construct(
        public readonly int $userId
    ) {
    }
}
