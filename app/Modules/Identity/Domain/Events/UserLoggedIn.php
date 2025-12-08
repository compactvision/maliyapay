<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Events;

use DateTimeImmutable;

/**
 * UserLoggedIn Domain Event
 */
final class UserLoggedIn
{
    public function __construct(
        public readonly int $userId,
        public readonly string $email,
        public readonly string $ipAddress,
        public readonly DateTimeImmutable $occurredAt
    ) {
    }

    public static function create(int $userId, string $email, string $ipAddress): self
    {
        return new self(
            userId: $userId,
            email: $email,
            ipAddress: $ipAddress,
            occurredAt: new DateTimeImmutable()
        );
    }
}
