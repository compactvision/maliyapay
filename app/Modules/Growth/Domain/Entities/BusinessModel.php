<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Entities;

class BusinessModel
{
    /**
     * @param BusinessStep[] $steps
     */
    public function __construct(
        public readonly string $id,
        public readonly string $title,
        public readonly string $description,
        public readonly ?string $icon,
        public readonly string $difficulty,
        public readonly string $potential,
        public readonly string $sector = 'Général',
        public readonly ?string $image = null,
        public readonly ?string $season = null,
        public readonly ?string $cycleDuration = null,
        public readonly array $soilTypes = [],
        public readonly ?string $yieldPotential = null,
        public readonly array $mainRisks = [],
        public readonly array $businessPlan = [],
        public readonly array $steps = [],
        public readonly string $status = 'published',
    ) {}

    public bool $started = false;
}
