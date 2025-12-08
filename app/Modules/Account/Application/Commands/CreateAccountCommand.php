<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Commands;

use Ramsey\Uuid\UuidInterface;

final class CreateAccountCommand
{
    public function __construct(
        public readonly UuidInterface $id,
        public readonly string $userId,
        public readonly string $name,
        public readonly string $type,
        public readonly ?string $color,
        public readonly ?string $initialCurrency = null,
        public readonly ?float $initialBalance = null
    ) {
    }
}
