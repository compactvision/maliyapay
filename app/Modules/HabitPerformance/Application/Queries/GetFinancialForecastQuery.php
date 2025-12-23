<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

/**
 * Query pour obtenir la prévision financière d'un utilisateur
 */
class GetFinancialForecastQuery
{
    public function __construct(
        public readonly int $userId
    ) {
    }
}
