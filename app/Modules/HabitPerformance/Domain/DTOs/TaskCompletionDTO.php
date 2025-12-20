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
            return "🎉 Excellent travail! Toutes vos tâches sont complétées. Vous êtes très discipliné!";
        }
        
        if ($rate >= 0.8) {
            return "Très bien! Encore quelques tâches et vous aurez tout terminé!";
        }
        
        if ($rate >= 0.5) {
            return "Bon début! Continuez sur cette lancée pour terminer vos tâches.";
        }
        
        if ($rate > 0) {
            return "⚠️ Attention! Il vous reste beaucoup de tâches. Concentrez-vous!";
        }
        
        return "Aucune tâche complétée aujourd'hui. Commencez maintenant!";
    }
}
