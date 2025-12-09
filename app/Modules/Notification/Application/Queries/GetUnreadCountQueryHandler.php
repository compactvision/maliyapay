<?php

namespace App\Modules\Notification\Application\Queries;

use App\Modules\Notification\Domain\Repositories\NotificationRepositoryInterface;

class GetUnreadCountQueryHandler
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository,
    ) {}

    public function handle(GetUnreadCountQuery $query): int
    {
        return $this->notificationRepository->getUnreadCount($query->userId);
    }
}
