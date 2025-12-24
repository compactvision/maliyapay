<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Entities;

class RoutineKitTask
{
    public function __construct(
        public readonly string $id,
        public readonly string $kitId,
        public readonly string $title,
        public readonly ?string $description,
        public readonly int $orderIndex,
        public readonly ?int $dayOfWeek,
        public readonly ?string $timeStart,
        public readonly ?string $timeEnd,
        public readonly string $priority,
    ) {}
}
