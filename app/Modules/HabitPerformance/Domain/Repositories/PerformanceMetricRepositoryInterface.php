<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceMetric;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use DateTimeImmutable;

interface PerformanceMetricRepositoryInterface
{
    public function save(PerformanceMetric $metric): void;
    
    public function findByDate(InsightType $source, DateTimeImmutable $date): ?PerformanceMetric;
    
    /**
     * @return PerformanceMetric[]
     */
    public function findBetween(InsightType $source, DateTimeImmutable $startDate, DateTimeImmutable $endDate): array;
}
