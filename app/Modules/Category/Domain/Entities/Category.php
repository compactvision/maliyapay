<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\Entities;

use App\Modules\Category\Domain\ValueObjects\CategoryColor;
use App\Modules\Category\Domain\ValueObjects\CategoryName;
use App\Modules\Category\Domain\ValueObjects\CategoryType;
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

/**
 * Category Domain Entity
 * 
 * Represents a transaction category with business rules
 * This is the heart of the domain model
 */
final class Category
{
    private UuidInterface $id;
    private CategoryName $name;
    private CategoryType $type;
    private CategoryColor $color;
    private UuidInterface $userId;
    private DateTimeImmutable $createdAt;
    private DateTimeImmutable $updatedAt;
    private ?DateTimeImmutable $deletedAt;

    private function __construct(
        UuidInterface $id,
        CategoryName $name,
        CategoryType $type,
        CategoryColor $color,
        UuidInterface $userId,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->type = $type;
        $this->color = $color;
        $this->userId = $userId;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->deletedAt = $deletedAt;
    }

    /**
     * Create a new category
     */
    public static function create(
        UuidInterface $id,
        CategoryName $name,
        CategoryType $type,
        CategoryColor $color,
        UuidInterface $userId
    ): self {
        $now = new DateTimeImmutable();

        return new self(
            id: $id,
            name: $name,
            type: $type,
            color: $color,
            userId: $userId,
            createdAt: $now,
            updatedAt: $now
        );
    }

    /**
     * Reconstitute from persistence
     */
    public static function reconstitute(
        UuidInterface $id,
        CategoryName $name,
        CategoryType $type,
        CategoryColor $color,
        UuidInterface $userId,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt,
        ?DateTimeImmutable $deletedAt = null
    ): self {
        return new self(
            id: $id,
            name: $name,
            type: $type,
            color: $color,
            userId: $userId,
            createdAt: $createdAt,
            updatedAt: $updatedAt,
            deletedAt: $deletedAt
        );
    }

    /**
     * Update category details
     */
    public function update(
        CategoryName $name,
        CategoryType $type,
        CategoryColor $color
    ): void {
        $this->name = $name;
        $this->type = $type;
        $this->color = $color;
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * Soft delete the category
     */
    public function delete(): void
    {
        if ($this->isDeleted()) {
            throw new \DomainException('Category is already deleted');
        }

        $this->deletedAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * Restore a soft-deleted category
     */
    public function restore(): void
    {
        if (!$this->isDeleted()) {
            throw new \DomainException('Category is not deleted');
        }

        $this->deletedAt = null;
        $this->updatedAt = new DateTimeImmutable();
    }

    /**
     * Check if category is deleted
     */
    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    /**
     * Check if category belongs to user
     */
    public function belongsToUser(UuidInterface $userId): bool
    {
        return $this->userId->equals($userId);
    }

    // Getters
    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function name(): CategoryName
    {
        return $this->name;
    }

    public function type(): CategoryType
    {
        return $this->type;
    }

    public function color(): CategoryColor
    {
        return $this->color;
    }

    public function userId(): UuidInterface
    {
        return $this->userId;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function deletedAt(): ?DateTimeImmutable
    {
        return $this->deletedAt;
    }
}
