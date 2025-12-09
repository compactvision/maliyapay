<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

class CreateRoutineTaskCommand
{
    public function __construct(
        public readonly string $routineId,
        public readonly int $userId,
        public readonly string $title,
        public readonly ?string $description,
        public readonly int $dayOfWeek,
        public readonly ?string $timeStart,
        public readonly ?string $timeEnd,
        public readonly string $priority,
        public readonly int $orderIndex = 0
    ) {
    }
}
