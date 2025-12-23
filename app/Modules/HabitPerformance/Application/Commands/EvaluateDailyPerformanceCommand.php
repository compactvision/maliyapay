<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use DateTimeImmutable;

/**
 * Command pour évaluer la performance quotidienne d'un utilisateur
 */
class EvaluateDailyPerformanceCommand
{
    public function __construct(
        public readonly int $userId,
        public readonly DateTimeImmutable $date
    ) {
    }
}
