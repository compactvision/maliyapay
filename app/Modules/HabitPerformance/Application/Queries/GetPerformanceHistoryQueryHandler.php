<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Queries;

use App\Modules\HabitPerformance\Domain\Repositories\PerformanceSnapshotRepositoryInterface;
use DateTimeImmutable;

/**
 * Handler pour obtenir l'historique de performance
 */
class GetPerformanceHistoryQueryHandler
{
    public function __construct(
        private PerformanceSnapshotRepositoryInterface $snapshotRepository
    ) {
    }

    public function handle(GetPerformanceHistoryQuery $query): array
    {
        $endDate = new DateTimeImmutable();
        $startDate = $endDate->modify("-{$query->days} days");

        $snapshots = $this->snapshotRepository->findByUserIdAndDateRange(
            $query->userId,
            $startDate,
            $endDate
        );

        return [
            'period' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d'),
                'days' => $query->days,
            ],
            'snapshots' => array_map(function ($snapshot) {
                return [
                    'date' => $snapshot->date()->format('Y-m-d'),
                    'financial_score' => $snapshot->financialScore(),
                    'task_score' => $snapshot->taskScore(),
                    'overall_score' => $snapshot->overallScore(),
                    'xp_gained' => $snapshot->xpGained(),
                    'xp_lost' => $snapshot->xpLost(),
                    'net_xp' => $snapshot->netXp(),
                    'insights' => $snapshot->insights(),
                ];
            }, $snapshots),
            'statistics' => $this->calculateStatistics($snapshots),
        ];
    }

    private function calculateStatistics(array $snapshots): array
    {
        if (empty($snapshots)) {
            return [
                'avg_financial_score' => 0,
                'avg_task_score' => 0,
                'avg_overall_score' => 0,
                'total_xp_gained' => 0,
                'total_xp_lost' => 0,
                'net_xp' => 0,
            ];
        }

        $totalFinancial = 0;
        $totalTask = 0;
        $totalOverall = 0;
        $totalXpGained = 0;
        $totalXpLost = 0;

        foreach ($snapshots as $snapshot) {
            $totalFinancial += $snapshot->financialScore();
            $totalTask += $snapshot->taskScore();
            $totalOverall += $snapshot->overallScore();
            $totalXpGained += $snapshot->xpGained();
            $totalXpLost += $snapshot->xpLost();
        }

        $count = count($snapshots);

        return [
            'avg_financial_score' => (int) round($totalFinancial / $count),
            'avg_task_score' => (int) round($totalTask / $count),
            'avg_overall_score' => (int) round($totalOverall / $count),
            'total_xp_gained' => $totalXpGained,
            'total_xp_lost' => $totalXpLost,
            'net_xp' => $totalXpGained - $totalXpLost,
        ];
    }
}
