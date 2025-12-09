<?php

declare(strict_types=1);

namespace App\Modules\Routine\Domain\Entities;

use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

class Routine
{
    public function __construct(
        private UuidInterface $id,
        private int $userId,
        private string $name,
        private ?string $color,
        private bool $isActive,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        UuidInterface $id,
        int $userId,
        string $name,
        ?string $color
    ): self {
        $now = new DateTimeImmutable();
        return new self(
            id: $id,
            userId: $userId,
            name: $name,
            color: $color,
            isActive: true,
            createdAt: $now,
            updatedAt: $now
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        int $userId,
        string $name,
        ?string $color,
        bool $isActive,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            name: $name,
            color: $color,
            isActive: $isActive,
            createdAt: $createdAt,
            updatedAt: $updatedAt
        );
    }

    public function update(string $name, ?string $color): void
    {
        $this->name = $name;
        $this->color = $color;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function activate(): void
    {
        $this->isActive = true;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function deactivate(): void
    {
        $this->isActive = false;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function toggleActive(): void
    {
        $this->isActive = !$this->isActive;
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

    public function name(): string
    {
        return $this->name;
    }

    public function color(): ?string
    {
        return $this->color;
    }

    public function isActive(): bool
    {
        return $this->isActive;
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
