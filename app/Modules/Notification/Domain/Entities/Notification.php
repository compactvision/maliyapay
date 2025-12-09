<?php

namespace App\Modules\Notification\Domain\Entities;

use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;
use DateTimeInterface;

class Notification
{
    public function __construct(
        private string $id,
        private int $userId,
        private NotificationType $type,
        private NotificationPriority $priority,
        private string $title,
        private string $message,
        private ?array $data = null,
        private ?DateTimeInterface $readAt = null,
        private ?DateTimeInterface $createdAt = null,
        private ?DateTimeInterface $updatedAt = null,
    ) {}

    public static function create(
        string $id,
        int $userId,
        NotificationType $type,
        NotificationPriority $priority,
        string $title,
        string $message,
        ?array $data = null,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            type: $type,
            priority: $priority,
            title: $title,
            message: $message,
            data: $data,
        );
    }

    public function markAsRead(): void
    {
        if ($this->readAt === null) {
            $this->readAt = new \DateTimeImmutable();
        }
    }

    public function isRead(): bool
    {
        return $this->readAt !== null;
    }

    public function isUnread(): bool
    {
        return !$this->isRead();
    }

    // Getters
    public function getId(): string
    {
        return $this->id;
    }

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getType(): NotificationType
    {
        return $this->type;
    }

    public function getPriority(): NotificationPriority
    {
        return $this->priority;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function getReadAt(): ?DateTimeInterface
    {
        return $this->readAt;
    }

    public function getCreatedAt(): ?DateTimeInterface
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?DateTimeInterface
    {
        return $this->updatedAt;
    }
}
