<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Entities;

use DateTimeImmutable;
use Ramsey\Uuid\UuidInterface;

class GamificationProfile
{
    public function __construct(
        private UuidInterface $id,
        private int $userId,
        private int $xp,
        private int $currentLevel,
        private int $coins,
        private int $streakCount,
        private ?DateTimeImmutable $lastActivityDate,
        private ?DateTimeImmutable $lastDailyBonusClaimedAt,
        private DateTimeImmutable $updatedAt,
        private int $financialScore = 0,
        private int $taskScore = 0,
        private int $overallScore = 0,
        private int $level = 1,
        private int $streakDays = 0
    ) {
    }

    public static function create(
        UuidInterface $id,
        int $userId
    ): self {
        return new self(
            $id,
            $userId,
            0, // xp
            1, // level
            0, // coins
            0, // streak
            null, // lastActivityDate
            null, // lastDailyBonusClaimedAt
            new DateTimeImmutable()
        );
    }

    // Getters
    public function id(): UuidInterface { return $this->id; }
    public function userId(): int { return $this->userId; }
    public function xp(): int { return $this->xp; }
    public function currentLevel(): int { return $this->currentLevel; }
    public function coins(): int { return $this->coins; }
    public function streakCount(): int { return $this->streakCount; }
    public function lastActivityDate(): ?DateTimeImmutable { return $this->lastActivityDate; }
    public function lastDailyBonusClaimedAt(): ?DateTimeImmutable { return $this->lastDailyBonusClaimedAt; }
    public function financialScore(): int { return $this->financialScore; }
    public function taskScore(): int { return $this->taskScore; }
    public function overallScore(): int { return $this->overallScore; }
    public function level(): int { return $this->level; }
    public function streakDays(): int { return $this->streakDays; }

    // Logic
    public function addXp(int $amount): void
    {
        $this->xp += $amount;
        $this->checkLevelUp();
        $this->updatedAt = new DateTimeImmutable();
    }

    private function checkLevelUp(): void
    {
        // Level 1: 0 - 1,000 XP
        // Level 2: 1,000 - 10,000 XP
        // Level 3+: Scalable (e.g. every 10,000 thereafter or exponential?)
        // Let's implement specific thresholds for early levels and scalable for later.

        $newLevel = 1;
        if ($this->xp < 1000) {
            $newLevel = 1;
        } elseif ($this->xp < 10000) {
            $newLevel = 2;
        } else {
            // Level 3 start at 10,000. Let's say every 15,000 after that adds a level?
            // Or simple log scale.
            // For scalability: Level = 2 + floor((XP - 10000) / 10000)
            // 10,000 -> L3 (2 + 0) -> Wait, if < 10000 is L2, then >= 10000 starts L3?
            // User said "Level 2: 1000 - 10000". So at 10000 you are Level 3? Or still 2 until 10001?
            // Let's assume inclusive lower bound.
            // At 10,000 XP -> Level 3.
            $base = 10000;
            $step = 10000; // 10k per level after
            $newLevel = 3 + (int) floor(($this->xp - $base) / $step);
        }

        if ($newLevel > $this->currentLevel) {
            $this->currentLevel = $newLevel;
            // Bonus coins on level up
            $this->addCoins(100 * $newLevel); 
        }
    }

    public function addCoins(int $amount): void
    {
        $this->coins += $amount;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function spendCoins(int $amount): bool
    {
        if ($this->coins >= $amount) {
            $this->coins -= $amount;
            $this->updatedAt = new DateTimeImmutable();
            return true;
        }
        return false;
    }

    public function maintainStreak(DateTimeImmutable $activityDate): void
    {
        if ($this->lastActivityDate === null) {
            $this->streakCount = 1;
        } else {
            $diff = $activityDate->diff($this->lastActivityDate);
            if ($diff->days == 1) {
                // Consecutive day
                $this->streakCount++;
            } elseif ($diff->days > 1) {
                // Break in streak
                $this->streakCount = 1;
            }
            // If diff->days == 0 (same day), do nothing
        }
        $this->lastActivityDate = $activityDate;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function canClaimDailyBonus(DateTimeImmutable $now): bool
    {
        if ($this->lastDailyBonusClaimedAt === null) {
            return true;
        }
        
        $today = $now->format('Y-m-d');
        $lastClaim = $this->lastDailyBonusClaimedAt->format('Y-m-d');

        return $today !== $lastClaim;
    }

    public function claimDailyBonus(DateTimeImmutable $now): bool
    {
        if ($this->canClaimDailyBonus($now)) {
            $this->lastDailyBonusClaimedAt = $now;
            $this->addCoins(50); // Daily bonus amount
            $this->updatedAt = new DateTimeImmutable();
            return true;
        }
        return false;
    }

    public function updateFinancialScore(int $score): void
    {
        $this->financialScore = max(0, min(100, $score));
        $this->recalculateOverallScore();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function updateTaskScore(int $score): void
    {
        $this->taskScore = max(0, min(100, $score));
        $this->recalculateOverallScore();
        $this->updatedAt = new DateTimeImmutable();
    }

    private function recalculateOverallScore(): void
    {
        // Weighted average: 60% financial, 40% tasks
        $this->overallScore = (int) round(
            ($this->financialScore * 0.6) + ($this->taskScore * 0.4)
        );
        $this->updateLevel();
    }

    private function updateLevel(): void
    {
        // Level based on overall score
        $this->level = match (true) {
            $this->overallScore >= 90 => 5, // Légende
            $this->overallScore >= 80 => 4, // Maître
            $this->overallScore >= 70 => 3, // Expert
            $this->overallScore >= 60 => 2, // Avancé
            default => 1 // Débutant
        };
    }

    public function incrementStreakDays(): void
    {
        $this->streakDays++;
        $this->updatedAt = new DateTimeImmutable();
    }

    public function resetStreakDays(): void
    {
        $this->streakDays = 0;
        $this->updatedAt = new DateTimeImmutable();
    }
}
