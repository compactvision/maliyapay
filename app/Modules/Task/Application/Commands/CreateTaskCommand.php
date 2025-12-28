<?php

declare(strict_types=1);

namespace App\Modules\Task\Application\Commands;

class CreateTaskCommand
{
    public function __construct(
        public readonly int $userId,
        public readonly string $title,
        public readonly ?string $description,
        public readonly string $priority,
        public readonly ?string $dueDate,
        public readonly int $xp = 0
    ) {
    }
}
