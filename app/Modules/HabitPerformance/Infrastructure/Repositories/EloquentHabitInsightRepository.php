<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\HabitInsight;
use App\Modules\HabitPerformance\Domain\Repositories\HabitInsightRepositoryInterface;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\HabitPerformance\Domain\ValueObjects\Period;
use App\Modules\HabitPerformance\Domain\ValueObjects\Score;
use App\Modules\HabitPerformance\Infrastructure\Models\HabitInsightModel;
use Ramsey\Uuid\Uuid;

class EloquentHabitInsightRepository implements HabitInsightRepositoryInterface
{
    public function save(HabitInsight $insight): void
    {
        $model = HabitInsightModel::updateOrCreate(
            ['id' => $insight->id()->toString()],
            [
                'type' => $insight->type()->value,
                'period' => $insight->period()->value,
                'score' => $insight->score()->toInt(),
                'summary' => $insight->summary(),
                'created_at' => $insight->createdAt(),
            ]
        );
    }

    public function findLatest(InsightType $type, Period $period, int $limit = 1): array
    {
        $models = HabitInsightModel::where('type', $type->value)
            ->where('period', $period->value)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $models->map(fn ($model) => $this->toEntity($model))->toArray();
    }

    private function toEntity(HabitInsightModel $model): HabitInsight
    {
        return new HabitInsight(
            id: Uuid::fromString($model->id),
            type: InsightType::from($model->type),
            period: Period::from($model->period),
            score: Score::fromInt($model->score),
            summary: $model->summary,
            createdAt: $model->created_at->toImmutable()
        );
    }
}
