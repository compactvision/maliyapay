<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Models\User;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\HabitPerformance\Domain\DTOs\TaskCompletionDTO;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\Notification\Domain\Services\NotificationService;
use Carbon\Carbon;

class TaskPerformanceService
{
    public function __construct(
        private TaskRepositoryInterface $taskRepository,
        private GamificationProfileRepositoryInterface $gamificationRepository,
        private NotificationService $notificationService
    ) {
    }

    public function calculateDailyCompletion(User $user, ?Carbon $date = null): TaskCompletionDTO
    {
        $date = $date ?? Carbon::now();
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        $tasks = $this->taskRepository->findByUserIdAndDateRange(
            $user->id,
            $startOfDay,
            $endOfDay
        );

        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'completed')->count();

        return TaskCompletionDTO::create($totalTasks, $completedTasks);
    }

    public function calculateWeeklyCompletion(User $user, ?Carbon $weekStart = null): TaskCompletionDTO
    {
        $weekStart = $weekStart ?? Carbon::now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();

        $tasks = $this->taskRepository->findByUserIdAndDateRange(
            $user->id,
            $weekStart,
            $weekEnd
        );

        $totalTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'completed')->count();

        return TaskCompletionDTO::create($totalTasks, $completedTasks);
    }

    public function awardTaskPoints(User $user, TaskCompletionDTO $completion): int
    {
        $points = 0;

        // Daily completion points
        if ($completion->allCompleted && $completion->totalTasks > 0) {
            $points = 30; // Full day completion
        } else {
            // Partial points based on completion rate
            $points = (int) ($completion->completionRate * 30);
        }

        // Bonus for high task count
        if ($completion->totalTasks >= 10 && $completion->allCompleted) {
            $points += 20; // Productivity bonus
        }

        // Update gamification profile
        if ($points > 0) {
            $profile = $this->gamificationRepository->findByUserId($user->id);
            if ($profile) {
                $profile->addXp($points);
                
                // Update streak if all tasks completed
                if ($completion->allCompleted) {
                    $profile->maintainStreak(new \DateTimeImmutable());
                }
                
                $this->gamificationRepository->save($profile);
            }
        }

        return $points;
    }

    public function sendTaskReminders(User $user): void
    {
        $today = Carbon::now();
        $completion = $this->calculateDailyCompletion($user, $today);

        if ($completion->totalTasks === 0) {
            return; // No tasks to remind about
        }

        $remainingTasks = $completion->totalTasks - $completion->completedTasks;

        if ($remainingTasks === 0) {
            return; // All done!
        }

        $hour = $today->hour;

        // Morning reminder (8 AM)
        if ($hour === 8) {
            $this->notificationService->send(
                $user,
                '☀️ Bonjour!',
                "Vous avez {$completion->totalTasks} tâches à compléter aujourd'hui. Bon courage!",
                'task_morning_reminder'
            );
        }

        // Afternoon reminder (2 PM)
        if ($hour === 14 && $remainingTasks > 0) {
            $this->notificationService->send(
                $user,
                '⏰ Rappel',
                "Il vous reste {$remainingTasks} tâches à compléter aujourd'hui.",
                'task_afternoon_reminder'
            );
        }

        // Evening reminder (6 PM)
        if ($hour === 18 && $remainingTasks > 0) {
            $this->notificationService->send(
                $user,
                '🌙 Dernière chance!',
                "{$remainingTasks} tâches non complétées. Terminez-les avant la fin de la journée!",
                'task_evening_reminder'
            );
        }
    }
}
