<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceSnapshot;
use DateTimeImmutable;

interface PerformanceSnapshotRepositoryInterface
{
    public function save(PerformanceSnapshot $snapshot): void;

    public function findById(string $id): ?PerformanceSnapshot;

    public function findByUserId(int $userId): array;

    public function findByUserIdAndDate(int $userId, DateTimeImmutable $date): ?PerformanceSnapshot;

    public function findByUserIdAndDateRange(
        int $userId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): array;

    public function findLatestByUserId(int $userId, int $limit = 30): array;

    public function delete(PerformanceSnapshot $snapshot): void;
}
