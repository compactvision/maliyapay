<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Routine\Domain\Repositories\RoutineTaskRepositoryInterface;
use App\Modules\Routine\Domain\ValueObjects\DayOfWeek;
use DateTimeImmutable;

class ProductivityAnalysisService
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
        private RoutineTaskRepositoryInterface $routineTaskRepository
    ) {
    }

    public function analyze(int $userId): array
    {
        $today = new DateTimeImmutable('today');
        
        // 1. Regular Tasks
        $allTasks = $this->taskRepository->findByUserId($userId);
        
        $tasksDueToday = [];
        $completedTodayCount = 0;
        $lateCount = 0;
        
        foreach ($allTasks as $task) {
            $isDueToday = $task->dueDate() && $task->dueDate()->format('Y-m-d') === $today->format('Y-m-d');
            $isCompleted = $task->completed();
            
            if ($isDueToday) {
                $tasksDueToday[] = $task;
                if ($isCompleted) {
                    $completedTodayCount++;
                }
            }
            
            if ($task->isOverdue()) {
                $lateCount++;
            }
        }
        
        // 2. Routine Tasks baseline
        $dayOfWeek = DayOfWeek::from((int)$today->format('N'));
        $routineTasks = $this->routineTaskRepository->findByUserIdAndDayOfWeek($userId, $dayOfWeek);
        
        // Total expected is tasks explicitly due today + routine tasks.
        // Assuming routine tasks are not auto-created into tasks table yet, or if they are, we might double count.
        // For accurate productivity, let's treat routineTasks as "Extra Expected" only if they don't map to tasks.
        // Given the ambiguity, and the prompt asking for "Tasks and Routines", let's simply report on Tasks completion 
        // but mention routines count as part of day plan.
        
        // If the system generates tasks from routines effectively, `findByUserId` should catch them.
        // Let's assume the Tasks table is the source of truth for "execution".
        
        $totalTasks = count($tasksDueToday);
        // Use max to avoid division by zero
        $completionRate = $totalTasks > 0 ? ($completedTodayCount / $totalTasks) * 100 : 0;
        
        // Generate personalized advice
        $advice = [];
        $currentHour = (int) $today->format('H');
        
        // Priority: Late tasks
        if ($lateCount > 0) {
            if ($lateCount === 1) {
                $advice[] = "⚠️ Vous avez 1 tâche en retard. Traitez-la en priorité !";
            } else {
                $advice[] = "⚠️ Vous avez $lateCount tâches en retard. Concentrez-vous sur les plus urgentes.";
            }
        }
        
        // Completion rate feedback
        if ($completionRate >= 100) {
            $advice[] = "🎉 Parfait ! Vous avez accompli toutes vos tâches du jour !";
        } elseif ($completionRate >= 80) {
            $remaining = $totalTasks - $completedTodayCount;
            $advice[] = "💪 Excellent travail ! Plus que $remaining tâche" . ($remaining > 1 ? 's' : '') . " pour atteindre 100% !";
        } elseif ($completionRate >= 50) {
            $advice[] = "👍 Bon rythme ! Continuez sur cette lancée.";
        } elseif ($completionRate > 0 && $totalTasks > 0) {
            if ($currentHour >= 18) {
                $advice[] = "⏰ La journée avance, concentrez-vous sur l'essentiel.";
            } else {
                $advice[] = "💡 Commencez par une tâche rapide pour prendre de l'élan.";
            }
        } elseif ($totalTasks === 0) {
            $advice[] = "📝 Planifiez vos tâches pour rester productif et organisé.";
        }
        
        // Routine reminders
        if (count($routineTasks) > 0) {
            $routineCount = count($routineTasks);
            $advice[] = "🔄 N'oubliez pas vos $routineCount routine" . ($routineCount > 1 ? 's' : '') . " du jour.";
        }
        
        // Time-based encouragement
        if ($currentHour >= 19 && $completionRate < 100 && $totalTasks > 0) {
            $advice[] = "🌙 Il est tard, mais vous pouvez encore progresser !";
        }
        
        return [
            'score' => (int)$completionRate,
            'summary' => "Tâches du jour : $completedTodayCount/$totalTasks accomplies.",
            'completionRate' => $completionRate,
            'lateCount' => $lateCount,
            'completedCount' => $completedTodayCount,
            'totalToday' => $totalTasks,
            'routineCount' => count($routineTasks),
            'advice' => $advice
        ];
    }
}
