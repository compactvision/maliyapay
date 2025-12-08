<?php

declare(strict_types=1);

namespace App\Modules\Budget\Domain\ValueObjects;

enum BudgetPeriod: string
{
    case DAILY = 'daily';
    case WEEKLY = 'weekly';
    case MONTHLY = 'monthly';

    public static function fromString(string $value): self
    {
        return match($value) {
            'daily' => self::DAILY,
            'weekly' => self::WEEKLY,
            'monthly' => self::MONTHLY,
            default => throw new \InvalidArgumentException("Invalid budget period: $value"),
        };
    }
}
