<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Queries;

use Ramsey\Uuid\UuidInterface;

final class GetAccountByIdQuery
{
    public function __construct(
        public readonly UuidInterface $id,
        public readonly string $userId
    ) {
    }
}
