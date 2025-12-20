<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\DTOs;

class TaskCompletionDTO
{
    public function __construct(
        public readonly int $totalTasks,
        public readonly int $completedTasks,
        public readonly float $completionRate, // 0.0 to 1.0
        public readonly int $disciplineScore, // 0-100
        public readonly bool $allCompleted,
        public readonly string $advice
    ) {
    }

    public static function create(
        int $totalTasks,
        int $completedTasks
    ): self {
        $completionRate = $totalTasks > 0 ? $completedTasks / $totalTasks : 0;
        $allCompleted = $totalTasks > 0 && $completedTasks === $totalTasks;
        
        // Calculate discipline score
        $disciplineScore = (int) round($completionRate * 100);
        
        // Generate advice
        $advice = self::generateAdvice($completionRate, $allCompleted);

        return new self(
            totalTasks: $totalTasks,
            completedTasks: $completedTasks,
            completionRate: $completionRate,
            disciplineScore: $disciplineScore,
            allCompleted: $allCompleted,
            advice: $advice
        );
    }

    private static function generateAdvice(float $rate, bool $allCompleted): string
    {
        if ($allCompleted) {
            return "🎉 Formidable ! Discipline exemplaire : 100% des tâches accomplies.";
        }
        
        if ($rate >= 0.8) {
            return "💪 Presque fini ! Un dernier effort pour atteindre la perfection.";
        }
        
        if ($rate >= 0.5) {
            return "📈 Vous avancez bien. Ne lâchez pas pour finir la journée en beauté.";
        }
        
        if ($rate > 0) {
            return "⏳ Ne prenez pas de retard. Chaque tâche complétée compte !";
        }
        
        return "🚀 Allez ! Le premier pas est le plus dur. Accomplissez une tâche maintenant.";
    }
}
