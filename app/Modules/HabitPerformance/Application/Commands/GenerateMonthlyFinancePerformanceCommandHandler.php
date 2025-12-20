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

class GenerateMonthlyFinancePerformanceCommandHandler
{
    public function __construct(
        private HabitInsightRepositoryInterface $habitInsightRepository,
        private \App\Modules\HabitPerformance\Domain\Services\FinancialPerformanceService $financialPerformanceService,
        private \App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface $gamificationRepository,
        private \App\Models\User $userModel // Better to use a repository but this works for dependency injection if bound
    ) {
    }

    public function handle(GenerateMonthlyFinancePerformanceCommand $command): void
    {
        $user = \App\Models\User::find($command->userId);
        if (!$user) return;

        $performance = $this->financialPerformanceService->calculateMonthlyPerformance($user);
        
        // Update Insight
        $insight = HabitInsight::create(
            Uuid::uuid4(),
            InsightType::FINANCE,
            Period::MONTH,
            Score::fromInt($performance->adherenceScore),
            $performance->advice
        );
        $this->habitInsightRepository->save($insight);

        // Update Gamification Profile Score
        $profile = $this->gamificationRepository->findByUserId($user->id);
        if ($profile) {
            $profile->updateFinancialScore($performance->adherenceScore);
            // Also award points for staying within budget
            $this->financialPerformanceService->awardFinancialPoints($user, $performance);
            $this->gamificationRepository->save($profile);
        }

        // Check budget thresholds for notifications
        $this->financialPerformanceService->checkBudgetThresholds($user);
    }
}
