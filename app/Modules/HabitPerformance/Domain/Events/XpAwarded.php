<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Events;

use DateTimeImmutable;

/**
 * Event dispatché quand un utilisateur gagne des XP
 */
class XpAwarded
{
    public function __construct(
        public readonly int $userId,
        public readonly int $amount,
        public readonly string $reason,
        public readonly int $newTotalXp,
        public readonly int $currentLevel,
        public readonly DateTimeImmutable $awardedAt
    ) {
    }
}
