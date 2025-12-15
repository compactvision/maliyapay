<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\HabitInsight;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\HabitPerformance\Domain\ValueObjects\Period;

interface HabitInsightRepositoryInterface
{
    public function save(HabitInsight $insight): void;
    
    /**
     * @return HabitInsight[]
     */
    public function findLatest(InsightType $type, Period $period, int $limit = 1): array;
}
