<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Events;

use DateTimeImmutable;

/**
 * UserRegistered Domain Event
 * 
 * Fired when a new user registers
 */
final class UserRegistered
{
    public function __construct(
        public readonly int $userId,
        public readonly string $email,
        public readonly string $name,
        public readonly DateTimeImmutable $occurredAt
    ) {
    }

    public static function create(int $userId, string $email, string $name): self
    {
        return new self(
            userId: $userId,
            email: $email,
            name: $name,
            occurredAt: new DateTimeImmutable()
        );
    }
}
