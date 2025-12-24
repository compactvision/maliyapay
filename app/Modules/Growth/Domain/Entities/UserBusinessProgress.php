<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Entities;

class UserBusinessProgress
{
    /**
     * @param string[] $completedSteps
     */
    public function __construct(
        public readonly string $id,
        public readonly int $userId,
        public readonly string $businessModelId,
        public readonly array $completedSteps,
        public readonly string $status,
    ) {}
}
