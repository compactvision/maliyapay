<?php

namespace App\Modules\HabitPerformance\Infrastructure\Repositories;

use App\Modules\HabitPerformance\Domain\Entities\GamificationProfile;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Infrastructure\Models\GamificationProfileModel;
use Ramsey\Uuid\Uuid;
use DateTimeImmutable;

class EloquentGamificationProfileRepository implements GamificationProfileRepositoryInterface
{
    public function findByUserId(int $userId): ?GamificationProfile
    {
        $model = GamificationProfileModel::where('user_id', $userId)->first();
        if (!$model) {
            return null;
        }
        return $this->toDomain($model);
    }

    public function save(GamificationProfile $profile): void
    {
        GamificationProfileModel::updateOrCreate(
            ['user_id' => $profile->userId()],
            [
                'id' => $profile->id()->toString(),
                'xp' => $profile->xp(),
                'current_level' => $profile->currentLevel(),
                'coins' => $profile->coins(),
                'streak_count' => $profile->streakCount(),
                'last_activity_date' => $profile->lastActivityDate(),
                'last_daily_bonus_claimed_at' => $profile->lastDailyBonusClaimedAt(),
                'financial_score' => $profile->financialScore(),
                'task_score' => $profile->taskScore(),
                'overall_score' => $profile->overallScore(),
                'level' => $profile->level(),
                'streak_days' => $profile->streakDays(),
            ]
        );
    }

    private function toDomain(GamificationProfileModel $model): GamificationProfile
    {
        return new GamificationProfile(
            Uuid::fromString($model->id),
            (int) $model->user_id,
            (int) $model->xp,
            (int) $model->current_level,
            (int) $model->coins,
            (int) $model->streak_count,
            $model->last_activity_date ? DateTimeImmutable::createFromMutable($model->last_activity_date) : null,
            $model->last_daily_bonus_claimed_at ? DateTimeImmutable::createFromMutable($model->last_daily_bonus_claimed_at) : null,
            DateTimeImmutable::createFromMutable($model->updated_at),
            (int) ($model->financial_score ?? 0),
            (int) ($model->task_score ?? 0),
            (int) ($model->overall_score ?? 0),
            (int) ($model->level ?? 1),
            (int) ($model->streak_days ?? 0)
        );
    }
}
