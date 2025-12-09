<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

class DeleteRoutineTaskCommand
{
    public function __construct(
        public readonly string $routineTaskId,
        public readonly int $userId
    ) {
    }
}
