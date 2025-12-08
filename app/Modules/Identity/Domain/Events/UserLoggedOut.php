<?php

declare(strict_types=1);

namespace App\Modules\Identity\Domain\Events;

use DateTimeImmutable;

/**
 * UserLoggedOut Domain Event
 */
final class UserLoggedOut
{
    public function __construct(
        public readonly int $userId,
        public readonly DateTimeImmutable $occurredAt
    ) {
    }

    public static function create(int $userId): self
    {
        return new self(
            userId: $userId,
            occurredAt: new DateTimeImmutable()
        );
    }
}
