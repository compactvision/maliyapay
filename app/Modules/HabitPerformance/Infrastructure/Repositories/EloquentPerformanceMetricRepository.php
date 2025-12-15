<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceMetric;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\HabitPerformance\Infrastructure\Models\PerformanceMetricModel;
use Ramsey\Uuid\Uuid;
use DateTimeImmutable;

class EloquentPerformanceMetricRepository implements PerformanceMetricRepositoryInterface
{
    public function save(PerformanceMetric $metric): void
    {
        PerformanceMetricModel::updateOrCreate(
            ['id' => $metric->id()->toString()],
            [
                'source' => $metric->source()->value,
                'date' => $metric->date()->format('Y-m-d'),
                'achieved' => $metric->achieved(),
                'expected' => $metric->expected(),
                'delta' => $metric->delta(),
                'metadata' => $metric->metadata(),
            ]
        );
    }

    public function findByDate(InsightType $source, DateTimeImmutable $date): ?PerformanceMetric
    {
        $model = PerformanceMetricModel::where('source', $source->value)
            ->whereDate('date', $date->format('Y-m-d'))
            ->first();

        return $model ? $this->toEntity($model) : null;
    }

    public function findBetween(InsightType $source, DateTimeImmutable $startDate, DateTimeImmutable $endDate): array
    {
        $models = PerformanceMetricModel::where('source', $source->value)
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->orderBy('date', 'asc')
            ->get();

        return $models->map(fn ($model) => $this->toEntity($model))->toArray();
    }

    private function toEntity(PerformanceMetricModel $model): PerformanceMetric
    {
        return new PerformanceMetric(
            id: Uuid::fromString($model->id),
            source: InsightType::from($model->source),
            date: new DateTimeImmutable($model->date->format('Y-m-d')),
            achieved: (float) $model->achieved,
            expected: (float) $model->expected,
            delta: (float) $model->delta,
            metadata: $model->metadata
        );
    }
}
