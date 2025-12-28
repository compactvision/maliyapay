<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Listeners;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceMetric;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Entities\GamificationProfile;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\Task\Domain\Events\TaskCompleted;
use Ramsey\Uuid\Uuid;

class OnTaskCompleted
{
    public function __construct(
        private PerformanceMetricRepositoryInterface $metricRepository,
        private GamificationProfileRepositoryInterface $gamificationRepository,
        private \App\Modules\Task\Domain\Repositories\TaskRepositoryInterface $taskRepository
    ) {
    }

    public function handle(TaskCompleted $event): void
    {
        // 1. Update Performance Metric
        $date = $event->completedAt;
        
        $metric = $this->metricRepository->findByDate(InsightType::TASK, $date);

        if (!$metric) {
            $metric = PerformanceMetric::track(
                Uuid::uuid4(),
                InsightType::TASK,
                $date,
                0.0,
                0.0 // Expected will be calculated by Command later
            );
        }

        $metric->incrementAchieved();
        $this->metricRepository->save($metric);

        // 2. Update Gamification Profile (XP + Streak)
        $profile = $this->gamificationRepository->findByUserId($event->userId);
        
        if (!$profile) {
             $profile = GamificationProfile::create(
                 Uuid::uuid4(),
                 $event->userId
             );
        }

        // Award XP for completing a task
        $task = $this->taskRepository->findById($event->taskId);
        $xpToAward = $task ? $task->xp() : 10;
        
        // Ensure at least 10 XP (or keep as fallback?)
        // If 0 XP is configured, maybe user wants 0?
        // Let's assume if it is Routine Task it might have specific XP, otherwise default 10.
        // Actually, if it's 0, let's give 10 default.
        if ($xpToAward === 0) {
            $xpToAward = 10;
        }

        $profile->addXp($xpToAward); // Dynamic XP
        $profile->addCoins(5); // 5 Coins per task
        
        // Update Streak
        $profile->maintainStreak($date);

        $this->gamificationRepository->save($profile);
    }
}
