<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Events;

use DateTimeImmutable;

/**
 * Event dispatché quand un utilisateur monte de niveau
 */
class LevelUp
{
    public function __construct(
        public readonly int $userId,
        public readonly int $oldLevel,
        public readonly int $newLevel,
        public readonly int $totalXp,
        public readonly int $coinsAwarded,
        public readonly DateTimeImmutable $leveledUpAt
    ) {
    }
}
