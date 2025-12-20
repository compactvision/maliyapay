<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Commands;

use Ramsey\Uuid\UuidInterface;

final class DeleteAccountCommand
{
    public function __construct(
        public readonly UuidInterface $accountId,
        public readonly string $userId
    ) {
    }
}
