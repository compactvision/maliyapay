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
        private PerformanceMetricRepositoryInterface $performanceMetricRepository
    ) {
    }

    public function handle(GenerateDailyTaskPerformanceCommand $command): void
    {
        $today = new DateTimeImmutable('today');
        
        $metric = $this->performanceMetricRepository->findByDate(
            InsightType::TASK,
            $today
        );

        if (!$metric) {
            // No activity today
            $scoreVal = 0;
            $summary = "Aucune tâche complétée aujourd'hui.";
        } else {
            // Simple logic: if achieved >= 1, score 100 (MVP). 
            // In real world: achieved / expected * 100.
            // Since we don't track 'expected' accurately yet (need Routine integration),
            // let's say 3 tasks is a "good day" (100%), 1 is 33%.
            $target = 3.0; // Arbitrary target strictly for MVP demo
            $scoreVal = (int) min(100, ($metric->achieved() / $target) * 100);
            
            if ($scoreVal >= 80) {
                $summary = "Excellente productivité ! Tu as maintenu tes habitudes.";
            } elseif ($scoreVal >= 50) {
                $summary = "Bon travail, continue sur cette lancée.";
            } else {
                $summary = "Un peu de relâchement aujourd'hui, on reprend demain !";
            }
        }

        $insight = HabitInsight::create(
            Uuid::uuid4(),
            InsightType::TASK,
            Period::DAY,
            Score::fromInt($scoreVal),
            $summary
        );

        $this->habitInsightRepository->save($insight);
    }
}
