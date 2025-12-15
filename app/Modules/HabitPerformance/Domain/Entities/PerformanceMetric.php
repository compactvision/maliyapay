<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Entities;

use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use Ramsey\Uuid\UuidInterface;
use DateTimeImmutable;

class PerformanceMetric
{
    public function __construct(
        private UuidInterface $id,
        private InsightType $source,
        private DateTimeImmutable $date,
        private float $achieved,
        private float $expected,
        private float $delta,
        private ?string $metadata = null
    ) {
    }

    public static function track(
        UuidInterface $id,
        InsightType $source,
        DateTimeImmutable $date,
        float $achieved,
        float $expected
    ): self {
        return new self(
            id: $id,
            source: $source,
            date: $date,
            achieved: $achieved,
            expected: $expected,
            delta: $achieved - $expected
        );
    }

    public function incrementAchieved(float $amount = 1.0): void
    {
        $this->achieved += $amount;
        $this->delta = $this->achieved - $this->expected;
    }

    public function id(): UuidInterface { return $this->id; }
    public function source(): InsightType { return $this->source; }
    public function date(): DateTimeImmutable { return $this->date; }
    public function achieved(): float { return $this->achieved; }
    public function expected(): float { return $this->expected; }
    public function delta(): float { return $this->delta; }
    public function metadata(): ?string { return $this->metadata; }
}
