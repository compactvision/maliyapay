<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\FinancialForecast;
use DateTimeImmutable;

interface FinancialForecastRepositoryInterface
{
    public function save(FinancialForecast $forecast): void;

    public function findById(string $id): ?FinancialForecast;

    public function findLatestByUserId(int $userId): ?FinancialForecast;

    /**
     * @return FinancialForecast[]
     */
    public function findLatestForEachCurrency(int $userId): array;

    public function findByUserId(int $userId): array;

    public function findByUserIdAndPeriod(
        int $userId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array;

    public function findCriticalForecasts(): array;

    public function delete(FinancialForecast $forecast): void;
}
