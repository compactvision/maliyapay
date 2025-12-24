<?php

declare(strict_types=1);

namespace App\Modules\Growth\Infrastructure\Repositories;

use App\Modules\Growth\Domain\Entities\UserBusinessProgress;
use App\Modules\Growth\Domain\Repositories\UserBusinessProgressRepositoryInterface;
use App\Modules\Growth\Infrastructure\Models\UserBusinessProgressModel;

class EloquentUserBusinessProgressRepository implements UserBusinessProgressRepositoryInterface
{
    public function findByUserId(int $userId): array
    {
        return UserBusinessProgressModel::where('user_id', $userId)
            ->get()
            ->map(fn($model) => $this->toDomain($model))
            ->all();
    }

    public function findByUserAndModel(int $userId, string $businessModelId): ?UserBusinessProgress
    {
        $model = UserBusinessProgressModel::where('user_id', $userId)
            ->where('business_model_id', $businessModelId)
            ->first();

        return $model ? $this->toDomain($model) : null;
    }

    public function save(UserBusinessProgress $progress): void
    {
        UserBusinessProgressModel::updateOrCreate(
            ['id' => $progress->id],
            [
                'user_id' => $progress->userId,
                'business_model_id' => $progress->businessModelId,
                'completed_steps' => $progress->completedSteps,
                'status' => $progress->status,
            ]
        );
    }

    private function toDomain(UserBusinessProgressModel $model): UserBusinessProgress
    {
        return new UserBusinessProgress(
            $model->id,
            (int) $model->user_id,
            $model->business_model_id,
            $model->completed_steps ?? [],
            $model->status
        );
    }
}
