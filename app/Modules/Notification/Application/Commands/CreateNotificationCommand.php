<?php

namespace App\Modules\Notification\Application\Commands;

use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;

class CreateNotificationCommand
{
    public function __construct(
        public readonly int $userId,
        public readonly NotificationType $type,
        public readonly NotificationPriority $priority,
        public readonly string $title,
        public readonly string $message,
        public readonly ?array $data = null,
    ) {}
}
