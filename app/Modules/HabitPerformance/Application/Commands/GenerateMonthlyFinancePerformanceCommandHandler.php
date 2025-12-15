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
        private PerformanceMetricRepositoryInterface $performanceMetricRepository
    ) {
    }

    public function handle(GenerateMonthlyFinancePerformanceCommand $command): void
    {
        $startOfMonth = new DateTimeImmutable('first day of this month');
        $endOfMonth = new DateTimeImmutable('last day of this month');
        
        $metrics = $this->performanceMetricRepository->findBetween(
            InsightType::FINANCE,
            $startOfMonth,
            $endOfMonth
        );

        $totalSpent = 0.0;
        foreach ($metrics as $metric) {
            $totalSpent += $metric->achieved();
        }

        // Just mocking budget logic for now
        $budgetLimit = 2000.0; // Assume global monthly budget

        if ($totalSpent > $budgetLimit) {
             $scoreVal = max(0, 100 - (int)(($totalSpent - $budgetLimit) / 10)); // Penalize overflow
             $summary = "Attention, vous avez dépassé votre budget mensuel de " . ($totalSpent - $budgetLimit) . ".";
        } else {
            $savings = $budgetLimit - $totalSpent;
            $scoreVal = 100;
            $summary = "Félicitations ! Vous avez respecté votre budget et économisé " . $savings . ".";
        }

        $insight = HabitInsight::create(
            Uuid::uuid4(),
            InsightType::FINANCE,
            Period::MONTH,
            Score::fromInt($scoreVal),
            $summary
        );

        $this->habitInsightRepository->save($insight);
    }
}
