<?php

namespace App\Modules\Notification\Presentation\Resources;

use App\Modules\Notification\Domain\Entities\Notification;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function __construct(private readonly Notification $notification)
    {
        parent::__construct($notification);
    }

    public function toArray($request): array
    {
        return [
            'id' => $this->notification->getId(),
            'type' => $this->notification->getType()->value,
            'typeLabel' => $this->notification->getType()->getLabel(),
            'typeIcon' => $this->notification->getType()->getIcon(),
            'typeColor' => $this->notification->getType()->getColor(),
            'priority' => $this->notification->getPriority()->value,
            'priorityLabel' => $this->notification->getPriority()->getLabel(),
            'title' => $this->notification->getTitle(),
            'message' => $this->notification->getMessage(),
            'data' => $this->notification->getData(),
            'isRead' => $this->notification->isRead(),
            'readAt' => $this->notification->getReadAt()?->format('Y-m-d H:i:s'),
            'createdAt' => $this->notification->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->notification->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ];
    }
}
