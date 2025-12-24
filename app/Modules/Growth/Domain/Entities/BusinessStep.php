<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Entities;

class BusinessStep
{
    public function __construct(
        public readonly string $id,
        public readonly string $businessModelId,
        public readonly string $title,
        public readonly ?string $description,
        public readonly int $orderIndex,
        public readonly int $level = 1,
        public readonly ?string $objective = null,
        public readonly array $knowledge = [],
        public readonly array $actions = [],
        public readonly array $costs = [],
        public readonly array $routines = [],
        public readonly array $progression = [],
        public readonly bool $locked = false,
        public readonly bool $isPaid = false,
        public readonly ?float $priceAmount = null,
    ) {}
}
