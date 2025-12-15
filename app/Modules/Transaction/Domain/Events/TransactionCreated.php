<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Domain\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Ramsey\Uuid\UuidInterface;
use DateTimeImmutable;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;

class TransactionCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly UuidInterface $transactionId,
        public readonly string $userId,
        public readonly float $amount,
        public readonly string $categoryId,
        public readonly TransactionType $type,
        public readonly DateTimeImmutable $date
    ) {
    }
}
