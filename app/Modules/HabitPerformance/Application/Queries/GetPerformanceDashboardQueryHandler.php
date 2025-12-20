<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

use App\Modules\HabitPerformance\Domain\Repositories\HabitInsightRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceMetricRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\ValueObjects\InsightType;
use App\Modules\HabitPerformance\Domain\ValueObjects\Period;
use DateTimeImmutable;

class GetPerformanceDashboardQueryHandler
{
    public function __construct(
        private HabitInsightRepositoryInterface $habitInsightRepository,
        private PerformanceMetricRepositoryInterface $performanceMetricRepository,
        private GamificationProfileRepositoryInterface $gamificationRepository
    ) {
    }

    public function handle(GetPerformanceDashboardQuery $query): array
    {
        $today = new DateTimeImmutable('today');
        $startOfWeek = $today->modify('monday this week');
        $endOfWeek = $today->modify('sunday this week');

        // Fetch latest Daily Task Insight (Summary)
        $latestTaskInsights = $this->habitInsightRepository->findLatest(InsightType::TASK, Period::DAY);
        $taskInsight = $latestTaskInsights[0] ?? null;

        // Fetch latest Monthly Finance Insight
        $latestFinanceInsights = $this->habitInsightRepository->findLatest(InsightType::FINANCE, Period::MONTH);
        $financeInsight = $latestFinanceInsights[0] ?? null;

        // Fetch Weekly Metrics for Calendar
        $weeklyMetrics = $this->performanceMetricRepository->findBetween(
            InsightType::TASK,
            $startOfWeek,
            $endOfWeek
        );

        // Fetch Gamification Profile
        $profile = $this->gamificationRepository->findByUserId($query->userId);
        
        $gamificationData = [
            'xp' => $profile ? $profile->xp() : 0,
            'level' => $profile ? $profile->level() : 1,
            'coins' => $profile ? $profile->coins() : 0,
            'streak' => $profile ? $profile->streakCount() : 0,
            'streakDays' => $profile ? $profile->streakDays() : 0,
            'overallScore' => $profile ? $profile->overallScore() : 0,
            'financialScore' => $profile ? $profile->financialScore() : 0,
            'taskScore' => $profile ? $profile->taskScore() : 0,
            'dailyBonusAvailable' => $profile ? $profile->canClaimDailyBonus(new DateTimeImmutable()) : true,
        ];

        return [
            'overview' => [
                'taskScore' => $taskInsight?->score()->toInt() ?? 0,
                'taskSummary' => $taskInsight?->summary() ?? 'Aucune donnée récente.',
                'financeScore' => $financeInsight?->score()->toInt() ?? 0,
                'financeSummary' => $financeInsight?->summary() ?? 'Aucune donnée récente.',
            ],
            'weeklyPerformance' => array_map(fn($m) => [
                'date' => $m->date()->format('Y-m-d'),
                'achieved' => $m->achieved(),
                'expected' => $m->expected(),
            ], $weeklyMetrics),
            'gamification' => $gamificationData
        ];
    }
}
