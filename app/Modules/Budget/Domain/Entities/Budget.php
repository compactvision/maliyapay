<?php

declare(strict_types=1);

namespace App\Modules\Budget\Domain\Entities;

use App\Modules\Budget\Domain\ValueObjects\BudgetPeriod;
use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

final class Budget
{
    public function __construct(
        private UuidInterface $id,
        private string $userId,
        private string $categoryId,
        private float $amount,
        private string $currency,
        private BudgetPeriod $period,
        private DateTimeImmutable $createdAt,
        private DateTimeImmutable $updatedAt
    ) {
    }

    public static function create(
        UuidInterface $id,
        string $userId,
        string $categoryId,
        float $amount,
        string $currency,
        BudgetPeriod $period
    ): self {
        $now = new DateTimeImmutable();
        return new self(
            $id,
            $userId,
            $categoryId,
            $amount,
            $currency,
            $period,
            $now,
            $now
        );
    }
    
    public static function reconstitute(
        UuidInterface $id,
        string $userId,
        string $categoryId,
        float $amount,
        string $currency,
        BudgetPeriod $period,
        DateTimeImmutable $createdAt,
        DateTimeImmutable $updatedAt
    ): self {
        return new self(
            $id,
            $userId,
            $categoryId,
            $amount,
            $currency,
            $period,
            $createdAt,
            $updatedAt
        );
    }

    public function id(): UuidInterface { return $this->id; }
    public function userId(): string { return $this->userId; }
    public function categoryId(): string { return $this->categoryId; }
    public function amount(): float { return $this->amount; }
    public function currency(): string { return $this->currency; }
    public function period(): BudgetPeriod { return $this->period; }
    public function createdAt(): DateTimeImmutable { return $this->createdAt; }
    public function updatedAt(): DateTimeImmutable { return $this->updatedAt; }
}
