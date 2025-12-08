<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\Events;

use Ramsey\Uuid\UuidInterface;

/**
 * CategoryDeleted Domain Event
 * 
 * Fired when a category is deleted
 */
final class CategoryDeleted
{
    public function __construct(
        public readonly UuidInterface $categoryId,
        public readonly string $userId,
        public readonly \DateTimeImmutable $occurredAt
    ) {
    }

    public static function create(
        UuidInterface $categoryId,
        string $userId
    ): self {
        return new self(
            categoryId: $categoryId,
            userId: $userId,
            occurredAt: new \DateTimeImmutable()
        );
    }
}
