<?php

declare(strict_types=1);

namespace App\Modules\Account\Domain\ValueObjects;

enum AccountType: string
{
    case CASH = 'cash';
    case BANK = 'bank';
    case MOBILE_MONEY = 'mobile_money';
    case SAVING = 'saving';
    case OTHER = 'other';

    public static function fromString(string $value): self
    {
        return match($value) {
            'cash' => self::CASH,
            'bank' => self::BANK,
            'mobile_money' => self::MOBILE_MONEY,
            'saving' => self::SAVING,
            'other' => self::OTHER,
            default => throw new \InvalidArgumentException("Invalid account type: $value"),
        };
    }
}
