<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Commands;

use Ramsey\Uuid\UuidInterface;

final class ExchangeCurrencyCommand
{
    public function __construct(
        public readonly UuidInterface $accountId,
        public readonly string $userId,
        public readonly string $fromCurrency,
        public readonly string $toCurrency,
        public readonly float $amount,
        public readonly float $rate
    ) {}
}
