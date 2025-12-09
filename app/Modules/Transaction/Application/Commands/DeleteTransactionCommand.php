<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Commands;

class DeleteTransactionCommand
{
    public function __construct(
        public readonly string $transactionId,
        public readonly string $userId
    ) {
    }
}
