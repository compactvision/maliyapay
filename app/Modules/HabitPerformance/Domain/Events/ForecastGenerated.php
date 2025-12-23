<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Events;

use App\Modules\HabitPerformance\Domain\Entities\FinancialForecast;
use DateTimeImmutable;

/**
 * Event dispatché quand une prévision financière est générée
 */
class ForecastGenerated
{
    public function __construct(
        public readonly int $userId,
        public readonly string $forecastId,
        public readonly string $status,
        public readonly float $projectedEndBalance,
        public readonly ?DateTimeImmutable $zeroBalanceDate,
        public readonly array $recommendations,
        public readonly DateTimeImmutable $generatedAt
    ) {
    }

    public static function fromForecast(FinancialForecast $forecast): self
    {
        return new self(
            $forecast->userId(),
            $forecast->id()->toString(),
            $forecast->status(),
            $forecast->projectedEndBalance(),
            $forecast->zeroBalanceDate(),
            $forecast->recommendations(),
            $forecast->generatedAt()
        );
    }
}
