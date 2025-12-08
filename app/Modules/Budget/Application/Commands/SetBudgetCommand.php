<?php

declare(strict_types=1);

namespace App\Modules\Budget\Application\Commands;

final class SetBudgetCommand
{
    public function __construct(
        public readonly string $userId,
        public readonly string $categoryId,
        public readonly float $amount,
        public readonly string $currency,
        public readonly string $period
    ) {
    }
}
