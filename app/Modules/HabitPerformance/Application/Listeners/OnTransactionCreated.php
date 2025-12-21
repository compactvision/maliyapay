<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Listeners;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceMetric;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Entities\GamificationProfile;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\Transaction\Domain\Events\TransactionCreated;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use Ramsey\Uuid\Uuid;

class OnTransactionCreated
{
    public function __construct(
        private PerformanceMetricRepositoryInterface $metricRepository,
        private GamificationProfileRepositoryInterface $gamificationRepository,
        private \App\Modules\HabitPerformance\Domain\Services\FinancialPerformanceService $financialPerformanceService
    ) {
    }

    public function handle(TransactionCreated $event): void
    {
        // We only care about tracking financial discipline (Spending vs Budget)
        // For now, let's track expenses as "achieved" = sum of expenses
        if ($event->type !== TransactionType::EXPENSE) {
            return;
        }

        $metric = $this->metricRepository->findByDate(
            InsightType::FINANCE,
            $event->date
        );

        if (!$metric) {
            $metric = PerformanceMetric::track(
                Uuid::uuid4(),
                InsightType::FINANCE,
                $event->date,
                $event->amount,
                0.0 
            );
        } else {
             // Re-constitute logic: track again with simplified increment
             $metric = PerformanceMetric::track(
                $metric->id(),
                $metric->source(),
                $metric->date(),
                $metric->achieved() + $event->amount,
                $metric->expected()
             );
        }

        $this->metricRepository->save($metric);

        // 2. Update Gamification Profile
        // Tracking expenses is responsible behavior -> small reward
        $profile = $this->gamificationRepository->findByUserId((int) $event->userId);
        
        if (!$profile) {
             $profile = GamificationProfile::create(
                 Uuid::uuid4(),
                 (int) $event->userId
             );
        }

        $profile->addXp(5); // 5 XP for tracking
        $profile->addCoins(2); // 2 Coins
        $profile->maintainStreak($event->date);

        $this->gamificationRepository->save($profile);

        // 3. Real-time Budget Check
        $user = \App\Models\User::find((int) $event->userId);
        if ($user) {
            $this->financialPerformanceService->checkBudgetThresholds($user);
        }
    }
}
