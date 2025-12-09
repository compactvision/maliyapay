<?php

namespace App\Modules\Notification\Application\Commands;

use App\Modules\Notification\Domain\Repositories\NotificationRepositoryInterface;

class MarkAsReadCommandHandler
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository,
    ) {}

    public function handle(MarkAsReadCommand $command): void
    {
        $notification = $this->notificationRepository->findById($command->notificationId);

        if (!$notification) {
            throw new \Exception('Notification not found');
        }

        if ($notification->getUserId() !== $command->userId) {
            throw new \Exception('Unauthorized');
        }

        $this->notificationRepository->markAsRead($command->notificationId);
    }
}
