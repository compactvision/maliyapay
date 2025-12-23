<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Entities;

use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

/**
 * PerformanceSnapshot - Historique des performances quotidiennes
 * 
 * Permet de comparer les performances dans le temps et générer des graphiques
 */
class PerformanceSnapshot
{
    public function __construct(
        private UuidInterface $id,
        private int $userId,
        private DateTimeImmutable $date,
        private int $financialScore,
        private int $taskScore,
        private int $overallScore,
        private int $xpGained,
        private int $xpLost,
        private array $insights,
        private DateTimeImmutable $createdAt
    ) {
    }

    public static function create(
        UuidInterface $id,
        int $userId,
        DateTimeImmutable $date,
        int $financialScore,
        int $taskScore,
        int $overallScore,
        int $xpGained,
        int $xpLost,
        array $insights = []
    ): self {
        return new self(
            $id,
            $userId,
            $date,
            $financialScore,
            $taskScore,
            $overallScore,
            $xpGained,
            $xpLost,
            $insights,
            new DateTimeImmutable()
        );
    }

    public static function reconstitute(
        UuidInterface $id,
        int $userId,
        DateTimeImmutable $date,
        int $financialScore,
        int $taskScore,
        int $overallScore,
        int $xpGained,
        int $xpLost,
        array $insights,
        DateTimeImmutable $createdAt
    ): self {
        return new self(
            $id,
            $userId,
            $date,
            $financialScore,
            $taskScore,
            $overallScore,
            $xpGained,
            $xpLost,
            $insights,
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

    public function date(): DateTimeImmutable
    {
        return $this->date;
    }

    public function financialScore(): int
    {
        return $this->financialScore;
    }

    public function taskScore(): int
    {
        return $this->taskScore;
    }

    public function overallScore(): int
    {
        return $this->overallScore;
    }

    public function xpGained(): int
    {
        return $this->xpGained;
    }

    public function xpLost(): int
    {
        return $this->xpLost;
    }

    public function netXp(): int
    {
        return $this->xpGained - $this->xpLost;
    }

    public function insights(): array
    {
        return $this->insights;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    /**
     * Compare ce snapshot avec un autre pour détecter les tendances
     */
    public function compareWith(PerformanceSnapshot $other): array
    {
        return [
            'financial_trend' => $this->financialScore - $other->financialScore,
            'task_trend' => $this->taskScore - $other->taskScore,
            'overall_trend' => $this->overallScore - $other->overallScore,
            'xp_trend' => $this->netXp() - $other->netXp(),
            'days_apart' => $this->date->diff($other->date())->days,
        ];
    }
}
