<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Entities;

use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\HabitPerformance\Domain\ValueObjects\Period;
use App\Modules\HabitPerformance\Domain\ValueObjects\Score;
use Ramsey\Uuid\UuidInterface;
use DateTimeImmutable;

class HabitInsight
{
    public function __construct(
        private UuidInterface $id,
        private InsightType $type,
        private Period $period,
        private Score $score,
        private string $summary,
        private DateTimeImmutable $createdAt
    ) {
    }

    public static function create(
        UuidInterface $id,
        InsightType $type,
        Period $period,
        Score $score,
        string $summary
    ): self {
        return new self(
            id: $id,
            type: $type,
            period: $period,
            score: $score,
            summary: $summary,
            createdAt: new DateTimeImmutable()
        );
    }

    // Identifiers and Props
    public function id(): UuidInterface { return $this->id; }
    public function type(): InsightType { return $this->type; }
    public function period(): Period { return $this->period; }
    public function score(): Score { return $this->score; }
    public function summary(): string { return $this->summary; }
    public function createdAt(): DateTimeImmutable { return $this->createdAt; }
}
