<?php

namespace App\Modules\Notification\Application\Queries;

class GetUserNotificationsQuery
{
    public function __construct(
        public readonly int $userId,
        public readonly bool $unreadOnly = false,
    ) {}
}
