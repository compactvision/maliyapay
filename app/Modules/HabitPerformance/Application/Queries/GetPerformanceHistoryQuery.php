<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

/**
 * Query pour obtenir l'historique de performance d'un utilisateur
 */
class GetPerformanceHistoryQuery
{
    public function __construct(
        public readonly int $userId,
        public readonly int $days = 30
    ) {
    }
}
