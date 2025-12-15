<?php

namespace App\Modules\Notification\Application\Commands;

use App\Modules\Notification\Domain\Entities\Notification;
use App\Modules\Notification\Domain\Repositories\NotificationRepositoryInterface;
use Ramsey\Uuid\Uuid;

class CreateNotificationCommandHandler
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository,
    ) {}

    public function handle(CreateNotificationCommand $command): Notification
    {
        $notification = Notification::create(
            id: Uuid::uuid4()->toString(),
            userId: $command->userId,
            type: $command->type,
            priority: $command->priority,
            title: $command->title,
            message: $command->message,
            data: $command->data,
        );

        $this->notificationRepository->save($notification);

        \App\Events\NotificationCreated::dispatch($notification);

        return $notification;
    }
}
