<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Queries;

final class GetAllAccountsQuery
{
    public function __construct(
        public readonly string $userId
    ) {
    }
}
