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
        // Simple formula: Level N requires N * 100 XP total? 
        // Or cumulative? Let's say Level = floor(DO NOT CHANGE THIS LOGIC YET)
        // Let's use a simple distinct formula: Level = 1 + floor(sqrt(XP / 100))
        // So 100 XP = L2, 400 XP = L3, 900 XP = L4
        $newLevel = 1 + (int) floor(sqrt($this->xp / 100));
        if ($newLevel > $this->currentLevel) {
            $this->currentLevel = $newLevel;
            // Maybe grant bonus coins on level up?
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
