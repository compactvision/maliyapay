<?php

namespace App\Modules\Notification\Application\Queries;

use App\Modules\Notification\Domain\Repositories\NotificationRepositoryInterface;

class GetUserNotificationsQueryHandler
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository,
    ) {}

    public function handle(GetUserNotificationsQuery $query): array
    {
        return $this->notificationRepository->findByUserId(
            $query->userId,
            $query->unreadOnly
        );
    }
}
