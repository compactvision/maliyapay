<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

/**
 * Command pour appliquer une pénalité XP à un utilisateur
 */
class ApplyXpPenaltyCommand
{
    public function __construct(
        public readonly int $userId,
        public readonly int $amount,
        public readonly string $reason
    ) {
    }
}
