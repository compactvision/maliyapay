<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\DTOs;

use App\Modules\Category\Domain\Entities\Category;
use DateTimeImmutable;

/**
 * CategoryDTO
 * 
 * Data Transfer Object for Category
 * Used to transfer data between layers without exposing domain entities
 */
final class CategoryDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $type,
        public readonly string $color,
        public readonly string $userId,
        public readonly DateTimeImmutable $createdAt,
        public readonly DateTimeImmutable $updatedAt,
        public readonly ?DateTimeImmutable $deletedAt = null
    ) {
    }

    /**
     * Create DTO from domain entity
     */
    public static function fromEntity(Category $category): self
    {
        return new self(
            id: $category->id()->toString(),
            name: $category->name()->value(),
            type: $category->type()->value(),
            color: $category->color()->value(),
            userId: $category->userId()->toString(),
            createdAt: $category->createdAt(),
            updatedAt: $category->updatedAt(),
            deletedAt: $category->deletedAt()
        );
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'color' => $this->color,
            'user_id' => $this->userId,
            'created_at' => $this->createdAt->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deletedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
