<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

class CreateRoutineCommand
{
    public function __construct(
        public readonly int $userId,
        public readonly string $name,
        public readonly ?string $color,
        public readonly array $tasks = [] // [{title, description, dayOfWeek, timeStart, timeEnd, priority, orderIndex}]
    ) {
    }
}
