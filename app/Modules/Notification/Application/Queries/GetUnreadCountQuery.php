<?php

namespace App\Modules\Notification\Application\Queries;

class GetUnreadCountQuery
{
    public function __construct(
        public readonly int $userId,
    ) {}
}
