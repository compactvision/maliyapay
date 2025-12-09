<?php

declare(strict_types=1);

namespace App\Modules\Routine\Application\Commands;

class UpdateRoutineCommand
{
    public function __construct(
        public readonly string $routineId,
        public readonly int $userId,
        public readonly string $name,
        public readonly ?string $color
    ) {
    }
}
