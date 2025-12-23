<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Entities;

use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

/**
 * FinancialForecast - Prédiction financière de fin de mois
 * 
 * Calcule et stocke les projections basées sur les habitudes de dépenses
 */
class FinancialForecast
{
    public function __construct(
        private UuidInterface $id,
        private int $userId,
        private DateTimeImmutable $generatedAt,
        private string $currency,
        private float $currentBalance,
        private float $avgDailySpending,
        private float $projectedEndBalance,
        private ?DateTimeImmutable $zeroBalanceDate,
        private string $status,
        private array $recommendations,
        private DateTimeImmutable $createdAt
    ) {
    }

    public static function create(
        UuidInterface $id,
        int $userId,
        string $currency,
        float $currentBalance,
        float $avgDailySpending,
        float $projectedEndBalance,
        ?DateTimeImmutable $zeroBalanceDate,
        string $status,
        array $recommendations = []
    ): self {
        $now = new DateTimeImmutable();
        
        return new self(
            $id,
            $userId,
            $now,
            $currency,
            $currentBalance,
            $avgDailySpending,
            $projectedEndBalance,
            $zeroBalanceDate,
            $status,
            $recommendations,
            $now
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        int $userId,
        DateTimeImmutable $generatedAt,
        string $currency,
        float $currentBalance,
        float $avgDailySpending,
        float $projectedEndBalance,
        ?DateTimeImmutable $zeroBalanceDate,
        string $status,
        array $recommendations,
        DateTimeImmutable $createdAt
    ): self {
        return new self(
            $id,
            $userId,
            $generatedAt,
            $currency,
            $currentBalance,
            $avgDailySpending,
            $projectedEndBalance,
            $zeroBalanceDate,
            $status,
            $recommendations,
            $createdAt
        );
    }

    // Getters
    public function id(): UuidInterface
    {
        return $this->id;
    }

    public function userId(): int
    {
        return $this->userId;
    }

    public function generatedAt(): DateTimeImmutable
    {
        return $this->generatedAt;
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function currentBalance(): float
    {
        return $this->currentBalance;
    }

    public function avgDailySpending(): float
    {
        return $this->avgDailySpending;
    }

    public function projectedEndBalance(): float
    {
        return $this->projectedEndBalance;
    }

    public function zeroBalanceDate(): ?DateTimeImmutable
    {
        return $this->zeroBalanceDate;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function recommendations(): array
    {
        return $this->recommendations;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    // Business logic
    public function isCritical(): bool
    {
        return $this->status === 'critical';
    }

    public function isWarning(): bool
    {
        return $this->status === 'warning';
    }

    public function isPositive(): bool
    {
        return $this->status === 'positive';
    }

    public function daysUntilZeroBalance(): ?int
    {
        if ($this->zeroBalanceDate === null) {
            return null;
        }

        $now = new DateTimeImmutable();
        return $now->diff($this->zeroBalanceDate)->days;
    }

    public function projectedChange(): float
    {
        return $this->projectedEndBalance - $this->currentBalance;
    }

    public function projectedChangePercentage(): float
    {
        if ($this->currentBalance == 0) {
            return 0.0;
        }

        return (($this->projectedEndBalance - $this->currentBalance) / $this->currentBalance) * 100;
    }
}
