<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use App\Modules\HabitPerformance\Domain\Entities\HabitInsight;
use App\Modules\HabitPerformance\Domain\Repositories\HabitInsightRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\HabitPerformance\Domain\ValueObjects\Period;
use App\Modules\HabitPerformance\Domain\ValueObjects\Score;
use Ramsey\Uuid\Uuid;
use DateTimeImmutable;

class GenerateDailyTaskPerformanceCommandHandler
{
    public function __construct(
        private HabitInsightRepositoryInterface $habitInsightRepository,
        private \App\Modules\HabitPerformance\Domain\Services\TaskPerformanceService $taskPerformanceService,
        private \App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface $gamificationRepository
    ) {
    }

    public function handle(GenerateDailyTaskPerformanceCommand $command): void
    {
        $user = \App\Models\User::find($command->userId);
        if (!$user) return;

        $performance = $this->taskPerformanceService->calculateDailyCompletion($user);
        
        // Update Insight
        $insight = HabitInsight::create(
            Uuid::uuid4(),
            InsightType::TASK,
            Period::DAY,
            Score::fromInt($performance->disciplineScore),
            $performance->advice
        );
        $this->habitInsightRepository->save($insight);

        // Update Gamification Profile Score
        $profile = $this->gamificationRepository->findByUserId($user->id);
        if ($profile) {
            $profile->updateTaskScore($performance->disciplineScore);
            // Award points for completion
            $this->taskPerformanceService->awardTaskPoints($user, $performance);
            $this->gamificationRepository->save($profile);
        }

        // Send task reminders
        $this->taskPerformanceService->sendTaskReminders($user);
    }
}
