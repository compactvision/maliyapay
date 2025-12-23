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
        private int $streakDays = 0,
        private int $totalXpEarned = 0,
        private int $totalXpLost = 0,
        private ?DateTimeImmutable $lastPenaltyAt = null
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
    public function totalXpEarned(): int { return $this->totalXpEarned; }
    public function totalXpLost(): int { return $this->totalXpLost; }
    public function lastPenaltyAt(): ?DateTimeImmutable { return $this->lastPenaltyAt; }

    // Logic
    public function addXp(int $amount): void
    {
        $this->xp += $amount;
        $this->totalXpEarned += $amount;
        $this->checkLevelUp();
        $this->updatedAt = new DateTimeImmutable();
    }

    public function removeXp(int $amount): void
    {
        $this->xp = max(0, $this->xp - $amount);
        $this->totalXpLost += $amount;
        $this->lastPenaltyAt = new DateTimeImmutable();
        $this->checkLevelDown();
        $this->updatedAt = new DateTimeImmutable();
    }

    private function checkLevelUp(): void
    {
        // Système 1-100 niveaux: 1000 XP par niveau
        // Niveau 1: 0-999 XP
        // Niveau 2: 1000-1999 XP
        // Niveau 3: 2000-2999 XP
        // ...
        // Niveau 100: 99000-99999+ XP
        
        $newLevel = min(100, (int)floor($this->xp / 1000) + 1);

        if ($newLevel > $this->currentLevel) {
            $oldLevel = $this->currentLevel;
            $this->currentLevel = $newLevel;
            // Bonus coins on level up (progressif)
            $this->addCoins(100 * $newLevel); 
            // Event LevelUp sera dispatché par le handler
        }
    }

    private function checkLevelDown(): void
    {
        // Vérifier si on descend de niveau après perte d'XP
        $newLevel = max(1, min(100, (int)floor($this->xp / 1000) + 1));

        if ($newLevel < $this->currentLevel) {
            $this->currentLevel = $newLevel;
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

    /**
     * Applique une pénalité pour inactivité
     */
    public function applyInactivityPenalty(int $daysInactive): int
    {
        // Pénalité progressive: 10 XP par jour d'inactivité
        $penalty = $daysInactive * 10;
        $this->removeXp($penalty);
        return $penalty;
    }

    /**
     * Applique une pénalité pour dépassement de budget
     */
    public function applyBudgetExcessPenalty(float $excessPercentage): int
    {
        // Pénalité basée sur le pourcentage de dépassement
        // 10% dépassement = 20 XP, 50% = 100 XP, etc.
        $penalty = (int)($excessPercentage * 2);
        $this->removeXp($penalty);
        return $penalty;
    }

    /**
     * Calcule le progrès vers le prochain niveau (0-100%)
     */
    public function progressToNextLevel(): float
    {
        if ($this->currentLevel >= 100) {
            return 100.0; // Max level atteint
        }

        $currentLevelXp = ($this->currentLevel - 1) * 1000;
        $nextLevelXp = $this->currentLevel * 1000;
        $xpInCurrentLevel = $this->xp - $currentLevelXp;
        
        return ($xpInCurrentLevel / 1000) * 100;
    }

    /**
     * XP requis pour le prochain niveau
     */
    public function xpToNextLevel(): int
    {
        if ($this->currentLevel >= 100) {
            return 0;
        }

        $nextLevelXp = $this->currentLevel * 1000;
        return max(0, $nextLevelXp - $this->xp);
    }
}
