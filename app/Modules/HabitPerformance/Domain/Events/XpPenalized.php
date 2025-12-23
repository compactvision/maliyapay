<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Events;

use DateTimeImmutable;

/**
 * Event dispatché quand un utilisateur perd des XP (pénalité)
 */
class XpPenalized
{
    public function __construct(
        public readonly int $userId,
        public readonly int $amount,
        public readonly string $reason,
        public readonly int $newTotalXp,
        public readonly int $currentLevel,
        public readonly DateTimeImmutable $penalizedAt
    ) {
    }
}
