<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Commands;

class DeleteTaskCommand
{
    public function __construct(
        public readonly string $taskId,
        public readonly int $userId
    ) {
    }
}
