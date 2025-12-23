<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Events;

use DateTimeImmutable;

/**
 * Event dispatché quand un seuil de budget est dépassé
 */
class BudgetThresholdExceeded
{
    public function __construct(
        public readonly int $userId,
        public readonly string $budgetId,
        public readonly string $categoryId,
        public readonly string $threshold, // '50%', '80%', '100%'
        public readonly float $budgetLimit,
        public readonly float $currentSpending,
        public readonly float $percentage,
        public readonly DateTimeImmutable $exceededAt
    ) {
    }
}
