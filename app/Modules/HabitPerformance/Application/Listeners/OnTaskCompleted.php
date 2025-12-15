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
        private GamificationProfileRepositoryInterface $gamificationRepository
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
        $profile->addXp(10); // 10 XP per task
        $profile->addCoins(5); // 5 Coins per task
        
        // Update Streak
        $profile->maintainStreak($date);

        $this->gamificationRepository->save($profile);
    }
}
