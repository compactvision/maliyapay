<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

use App\Modules\HabitPerformance\Domain\ValueObjects\Period;

/**
 * Query pour obtenir un rapport complet des habitudes d'un utilisateur
 */
class GetUserHabitReportQuery
{
    public function __construct(
        public readonly int $userId,
        public readonly Period $period = Period::WEEK
    ) {
    }
}
