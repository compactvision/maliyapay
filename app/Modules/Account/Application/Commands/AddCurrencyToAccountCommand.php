<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Commands;

use Ramsey\Uuid\UuidInterface;

final class AddCurrencyToAccountCommand
{
    public function __construct(
        public readonly UuidInterface $accountId,
        public readonly string $userId,
        public readonly string $currencyCode,
        public readonly float $initialBalance = 0.0
    ) {
    }
}
