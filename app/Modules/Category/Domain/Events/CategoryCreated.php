<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\Events;

use Ramsey\Uuid\UuidInterface;

/**
 * CategoryCreated Domain Event
 * 
 * Fired when a new category is created
 */
final class CategoryCreated
{
    public function __construct(
        public readonly UuidInterface $categoryId,
        public readonly string $name,
        public readonly string $type,
        public readonly string $color,
        public readonly string $userId,
        public readonly \DateTimeImmutable $occurredAt
    ) {
    }

    public static function create(
        UuidInterface $categoryId,
        string $name,
        string $type,
        string $color,
        string $userId
    ): self {
        return new self(
            categoryId: $categoryId,
            name: $name,
            type: $type,
            color: $color,
            userId: $userId,
            occurredAt: new \DateTimeImmutable()
        );
    }
}
