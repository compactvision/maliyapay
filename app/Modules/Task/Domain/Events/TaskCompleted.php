<?php

declare(strict_types=1);

namespace App\Modules\Task\Domain\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Ramsey\Uuid\UuidInterface;
use DateTimeImmutable;

class TaskCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly UuidInterface $taskId,
        public readonly int $userId,
        public readonly DateTimeImmutable $completedAt
    ) {
    }
}
