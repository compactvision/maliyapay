<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceSnapshot;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceSnapshotRepositoryInterface;
use App\Modules\HabitPerformance\Infrastructure\Models\PerformanceSnapshotModel;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

class EloquentPerformanceSnapshotRepository implements PerformanceSnapshotRepositoryInterface
{
    public function save(PerformanceSnapshot $snapshot): void
    {
        PerformanceSnapshotModel::updateOrCreate(
            [
                'id' => $snapshot->id()->toString(),
            ],
            [
                'user_id' => $snapshot->userId(),
                'date' => $snapshot->date()->format('Y-m-d'),
                'financial_score' => $snapshot->financialScore(),
                'task_score' => $snapshot->taskScore(),
                'overall_score' => $snapshot->overallScore(),
                'xp_gained' => $snapshot->xpGained(),
                'xp_lost' => $snapshot->xpLost(),
                'insights' => $snapshot->insights(),
            ]
        );
    }

    public function findById(string $id): ?PerformanceSnapshot
    {
        $model = PerformanceSnapshotModel::find($id);

        return $model ? $this->toDomain($model) : null;
    }

    public function findByUserId(int $userId): array
    {
        $models = PerformanceSnapshotModel::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByUserIdAndDate(int $userId, DateTimeImmutable $date): ?PerformanceSnapshot
    {
        $model = PerformanceSnapshotModel::where('user_id', $userId)
            ->whereDate('date', $date->format('Y-m-d'))
            ->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function findByUserIdAndDateRange(
        int $userId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array {
        $models = PerformanceSnapshotModel::where('user_id', $userId)
            ->whereBetween('date', [
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d')
            ])
            ->orderBy('date', 'asc')
            ->get();

        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findLatestByUserId(int $userId, int $limit = 30): array
    {
        $models = PerformanceSnapshotModel::where('user_id', $userId)
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();

        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function delete(PerformanceSnapshot $snapshot): void
    {
        PerformanceSnapshotModel::where('id', $snapshot->id()->toString())->delete();
    }

    private function toDomain(PerformanceSnapshotModel $model): PerformanceSnapshot
    {
        $date = $model->date instanceof \DateTimeInterface
            ? DateTimeImmutable::createFromInterface($model->date)
            : new DateTimeImmutable($model->date);

        $createdAt = $model->created_at instanceof \DateTimeInterface
            ? DateTimeImmutable::createFromInterface($model->created_at)
            : new DateTimeImmutable($model->created_at);

        return PerformanceSnapshot::reconstitute(
            Uuid::fromString($model->id),
            (int) $model->user_id,
            $date,
            $model->financial_score,
            $model->task_score,
            $model->overall_score,
            $model->xp_gained,
            $model->xp_lost,
            $model->insights ?? [],
            $createdAt
        );
    }
}
