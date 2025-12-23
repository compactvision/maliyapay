<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Events;

use DateTimeImmutable;

/**
 * Event dispatché après évaluation de la performance
 */
class PerformanceEvaluated
{
    public function __construct(
        public readonly int $userId,
        public readonly int $financialScore,
        public readonly int $taskScore,
        public readonly int $overallScore,
        public readonly array $insights,
        public readonly DateTimeImmutable $evaluatedAt
    ) {
    }
}
