<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\Entities;

use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use App\Modules\Routine\Domain\ValueObjects\TimeRange;
use App\Modules\Task\Domain\ValueObjects\TaskPriority;
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

class RoutineTask
{
    public function __construct(
        private UuidInterface $id,
        private UuidInterface $routineId,
        private string $title,
        private ?string $description,
        private DayOfWeek $dayOfWeek,
        private TimeRange $timeRange,
        private TaskPriority $priority,
        private int $orderIndex,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        UuidInterface $id,
        UuidInterface $routineId,
        string $title,
        ?string $description,
        DayOfWeek $dayOfWeek,
        TimeRange $timeRange,
        TaskPriority $priority,
        int $orderIndex = 0
    ): self {
        $now = new DateTimeImmutable();
        return new self(
            id: $id,
            routineId: $routineId,
            title: $title,
            description: $description,
            dayOfWeek: $dayOfWeek,
            timeRange: $timeRange,
            priority: $priority,
            orderIndex: $orderIndex,
            createdAt: $now,
            updatedAt: $now
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        UuidInterface $routineId,
        string $title,
        ?string $description,
        DayOfWeek $dayOfWeek,
        TimeRange $timeRange,
        TaskPriority $priority,
        int $orderIndex,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt
    ): self {
        return new self(
            id: $id,
            routineId: $routineId,
            title: $title,
            description: $description,
            dayOfWeek: $dayOfWeek,
            timeRange: $timeRange,
            priority: $priority,
            orderIndex: $orderIndex,
            createdAt: $createdAt,
            updatedAt: $updatedAt
        );
    }

    public function update(
        string $title,
        ?string $description,
        DayOfWeek $dayOfWeek,
        TimeRange $timeRange,
        TaskPriority $priority,
        int $orderIndex
    ): void {
        $this->title = $title;
        $this->description = $description;
        $this->dayOfWeek = $dayOfWeek;
        $this->timeRange = $timeRange;
        $this->priority = $priority;
        $this->orderIndex = $orderIndex;
        $this->updatedAt = new DateTimeImmutable();
    }

    // Getters
    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function routineId(): UuidInterface
    {
        return $this->routineId;
    }

    public function title(): string
    {
        return $this->title;
    }

    public function description(): ?string
    {
        return $this->description;
    }

    public function dayOfWeek(): DayOfWeek
    {
        return $this->dayOfWeek;
    }

    public function timeRange(): TimeRange
    {
        return $this->timeRange;
    }

    public function priority(): TaskPriority
    {
        return $this->priority;
    }

    public function orderIndex(): int
    {
        return $this->orderIndex;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
