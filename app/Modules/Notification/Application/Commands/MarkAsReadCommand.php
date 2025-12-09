<?php

namespace App\Modules\Notification\Application\Commands;

class MarkAsReadCommand
{
    public function __construct(
        public readonly string $notificationId,
        public readonly int $userId,
    ) {}
}
