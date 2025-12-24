<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Entities;

class RoutineKit
{
    /**
     * @param RoutineKitTask[] $tasks
     */
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly ?string $description,
        public readonly ?string $category,
        public readonly ?string $color,
        public readonly string $status = 'published',
        public readonly bool $isPaid = false,
        public readonly ?float $priceAmount = null,
        public readonly ?string $priceCurrency = null,
        public readonly array $images = [],
        public readonly array $tasks = [],
    ) {}
}
