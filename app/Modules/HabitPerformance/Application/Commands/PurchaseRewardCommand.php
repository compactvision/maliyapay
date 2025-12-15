<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

class PurchaseRewardCommand
{
    public function __construct(
        public readonly int $userId,
        public readonly int $rewardId,
        public readonly int $cost
    ) {
    }
}
