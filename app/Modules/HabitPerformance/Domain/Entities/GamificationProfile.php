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
        private DateTimeImmutable $updatedAt
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
}
