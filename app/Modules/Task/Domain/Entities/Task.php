<?php

declare(strict_types=1);

namespace App\Modules\Task\Domain\Entities;

use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

class Task
{
    public function __construct(
        private UuidInterface $id,
        private int $userId,
        private string $title,
        private ?string $description,
        private TaskPriority $priority,
        private ?DateTimeImmutable $dueDate,
        private bool $completed,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt,
        private int $xp = 0,
        private ?UuidInterface $routineTaskId = null
    ) {
    }

    public static function create(
        UuidInterface $id,
        int $userId,
        string $title,
        ?string $description,
        TaskPriority $priority,
        ?DateTimeImmutable $dueDate,
        int $xp = 0,
        ?UuidInterface $routineTaskId = null
    ): self {
        $now = new DateTimeImmutable();
        return new self(
            id: $id,
            userId: $userId,
            title: $title,
            description: $description,
            priority: $priority,
            dueDate: $dueDate,
            completed: false,
            createdAt: $now,
            updatedAt: $now,
            xp: $xp,
            routineTaskId: $routineTaskId
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        int $userId,
        string $title,
        ?string $description,
        TaskPriority $priority,
        ?DateTimeImmutable $dueDate,
        bool $completed,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        int $xp = 0,
        ?UuidInterface $routineTaskId = null
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            title: $title,
            description: $description,
            priority: $priority,
            dueDate: $dueDate,
            completed: $completed,
            createdAt: $createdAt,
            updatedAt: $updatedAt,
            xp: $xp,
            routineTaskId: $routineTaskId
        );
    }

    public function update(
        string $title,
        ?string $description,
        TaskPriority $priority,
        ?DateTimeImmutable $dueDate
    ): void {
        $this->title = $title;
        $this->description = $description;
        $this->priority = $priority;
        $this->dueDate = $dueDate;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toggleCompletion(): void
    {
        $this->completed = !$this->completed;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function markAsCompleted(): void
    {
        $this->completed = true;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function markAsIncomplete(): void
    {
        $this->completed = false;
        $this->updatedAt = new DateTimeImmutable();
    }

    // Getters
    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function userId(): int
    {
        return $this->userId;
    }

    public function title(): string
    {
        return $this->title;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    public function priority(): TaskPriority
    {
        return $this->priority;
    }

    public function dueDate(): ?DateTimeImmutable
    {
        return $this->dueDate;
    }

    public function completed(): bool
    {
        return $this->completed;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function xp(): int
    {
        return $this->xp;
    }

    public function routineTaskId(): ?UuidInterface
    {
        return $this->routineTaskId;
    }

    public function isOverdue(): bool
    {
        if ($this->dueDate === null || $this->completed) {
            return false;
        }

        $today = new DateTimeImmutable('today');
        return $this->dueDate < $today;
    }
}
