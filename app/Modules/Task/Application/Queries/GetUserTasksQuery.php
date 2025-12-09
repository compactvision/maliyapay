<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Queries;

class GetUserTasksQuery
{
    public function __construct(
        public readonly int $userId
    ) {
    }
}
