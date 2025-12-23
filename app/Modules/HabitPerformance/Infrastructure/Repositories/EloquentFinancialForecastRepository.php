<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Infrastructure\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\FinancialForecast;
use App\Modules\HabitPerformance\Domain\Repositories\FinancialForecastRepositoryInterface;
use App\Modules\HabitPerformance\Infrastructure\Models\FinancialForecastModel;
use DateTimeImmutable;
use Ramsey\Uuid\Uuid;

class EloquentFinancialForecastRepository implements FinancialForecastRepositoryInterface
{
    public function save(FinancialForecast $forecast): void
    {
        FinancialForecastModel::updateOrCreate(
            [
                'id' => $forecast->id()->toString(),
            ],
            [
                'user_id' => $forecast->userId(),
                'generated_at' => $forecast->generatedAt()->format('Y-m-d H:i:s'),
                'currency' => $forecast->currency(),
                'current_balance' => $forecast->currentBalance(),
                'avg_daily_spending' => $forecast->avgDailySpending(),
                'projected_end_balance' => $forecast->projectedEndBalance(),
                'zero_balance_date' => $forecast->zeroBalanceDate()?->format('Y-m-d H:i:s'),
                'status' => $forecast->status(),
                'recommendations' => $forecast->recommendations(),
            ]
        );
    }

    public function findById(string $id): ?FinancialForecast
    {
        $model = FinancialForecastModel::find($id);

        return $model ? $this->toDomain($model) : null;
    }

    public function findLatestByUserId(int $userId): ?FinancialForecast
    {
        $model = FinancialForecastModel::where('user_id', $userId)
            ->orderBy('generated_at', 'desc')
            ->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function findLatestForEachCurrency(int $userId): array
    {
        $models = FinancialForecastModel::where('user_id', $userId)
            ->orderBy('generated_at', 'desc')
            ->get();

        $latest = [];
        foreach ($models as $model) {
            $currency = $model->currency ?? 'USD'; // Fallback for old records
            if (!isset($latest[$currency])) {
                $latest[$currency] = $this->toDomain($model);
            }
        }

        return array_values($latest);
    }

    public function findByUserId(int $userId): array
    {
        $models = FinancialForecastModel::where('user_id', $userId)
            ->orderBy('generated_at', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findByUserIdAndPeriod(
        int $userId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array {
        $models = FinancialForecastModel::where('user_id', $userId)
            ->whereBetween('generated_at', [
                $startDate->format('Y-m-d H:i:s'),
                $endDate->format('Y-m-d H:i:s')
            ])
            ->orderBy('generated_at', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function findCriticalForecasts(): array
    {
        $models = FinancialForecastModel::where('status', 'critical')
            ->orderBy('generated_at', 'desc')
            ->get();

        return $models->map(fn($model) => $this->toDomain($model))->all();
    }

    public function delete(FinancialForecast $forecast): void
    {
        FinancialForecastModel::where('id', $forecast->id()->toString())->delete();
    }

    private function toDomain(FinancialForecastModel $model): FinancialForecast
    {
        $generatedAt = $model->generated_at instanceof \DateTimeInterface
            ? DateTimeImmutable::createFromInterface($model->generated_at)
            : new DateTimeImmutable($model->generated_at);

        $zeroBalanceDate = null;
        if ($model->zero_balance_date) {
            $zeroBalanceDate = $model->zero_balance_date instanceof \DateTimeInterface
                ? DateTimeImmutable::createFromInterface($model->zero_balance_date)
                : new DateTimeImmutable($model->zero_balance_date);
        }

        $createdAt = $model->created_at instanceof \DateTimeInterface
            ? DateTimeImmutable::createFromInterface($model->created_at)
            : new DateTimeImmutable($model->created_at);

        return FinancialForecast::reconstitute(
            Uuid::fromString($model->id),
            (int) $model->user_id,
            $generatedAt,
            $model->currency ?? 'USD',
            (float) $model->current_balance,
            (float) $model->avg_daily_spending,
            (float) $model->projected_end_balance,
            $zeroBalanceDate,
            $model->status,
            $model->recommendations ?? [],
            $createdAt
        );
    }
}
