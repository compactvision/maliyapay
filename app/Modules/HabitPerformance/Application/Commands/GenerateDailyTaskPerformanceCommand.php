<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

class GenerateDailyTaskPerformanceCommand
{
    public function __construct(
        public readonly int $userId
    ) {
    }
}
