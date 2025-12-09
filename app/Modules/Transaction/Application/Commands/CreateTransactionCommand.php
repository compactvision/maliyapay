<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Commands;

use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use DateTimeImmutable;

class CreateTransactionCommand
{
    public function __construct(
        public readonly string $userId,
        public readonly string $accountId,
        public readonly string $categoryId,
        public readonly float $amount,
        public readonly string $currency,
        public readonly TransactionType $type,
        public readonly string $description,
        public readonly DateTimeImmutable $date
    ) {
    }
}
