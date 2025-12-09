<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Queries;

class GetUserRoutinesQuery
{
    public function __construct(
        public readonly int $userId,
        public readonly bool $activeOnly = false
    ) {
    }
}
