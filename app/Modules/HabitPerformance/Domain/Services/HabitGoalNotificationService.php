<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Modules\Notification\Application\Commands\CreateNotificationCommand;
use App\Modules\Notification\Application\Commands\CreateNotificationCommandHandler;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;
use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use App\Modules\HabitPerformance\Domain\Services\ProductivityAnalysisService;
use Illuminate\Support\Facades\DB;
use DateTimeImmutable;

class HabitGoalNotificationService
{
    public function __construct(
        private readonly ProductivityAnalysisService $productivityAnalysisService,
        private readonly CreateNotificationCommandHandler $createNotificationHandler,
    ) {}

    /**
     * Check if user has achieved their daily goal and send notification
     */
    public function checkDailyGoalAchievement(int $userId): void
    {
        // Check if user wants notifications
        if (!$this->userWantsNotifications($userId)) {
            return;
        }

        // Check if we already sent a notification today
        if ($this->hasGoalNotificationToday($userId)) {
            return;
        }

        $analysis = $this->productivityAnalysisService->analyze($userId);
        $score = $analysis['score'];

        // Goal achieved (100% completion)
        if ($score >= 100) {
            $this->sendGoalAchievedNotification($userId, $analysis);
        }
    }

    /**
     * Send evening reminder if goal not achieved (before 20H)
     */
    public function sendEveningReminderNotification(int $userId): void
    {
        // Check if user wants notifications
        if (!$this->userWantsNotifications($userId)) {
            return;
        }

        // Check if we already sent a reminder today
        if ($this->hasReminderNotificationToday($userId)) {
            return;
        }

        $analysis = $this->productivityAnalysisService->analyze($userId);
        $score = $analysis['score'];
        $completedCount = $analysis['completedCount'];
        $totalToday = $analysis['totalToday'];

        // Only send if goal not achieved
        if ($score < 100 && $totalToday > 0) {
            $remaining = $totalToday - $completedCount;
            
            $message = $remaining === 1 
                ? "Il vous reste 1 tâche à terminer pour atteindre votre objectif du jour !"
                : "Il vous reste {$remaining} tâches à terminer pour atteindre votre objectif du jour !";

            $command = new CreateNotificationCommand(
                userId: $userId,
                type: NotificationType::TASK_TODAY,
                priority: NotificationPriority::HIGH,
                title: "⏰ Il est presque 20H !",
                message: $message,
                data: [
                    'type' => 'evening_reminder',
                    'remaining_tasks' => $remaining,
                    'completion_rate' => $score
                ]
            );

            $this->createNotificationHandler->handle($command);
        }
    }

    /**
     * Send goal achieved notification with celebration
     */
    private function sendGoalAchievedNotification(int $userId, array $analysis): void
    {
        $completedCount = $analysis['completedCount'];
        
        $messages = [
            "🎉 Youpi ! Vous avez accompli toutes vos {$completedCount} tâches du jour !",
            "🏆 Bravo ! Objectif quotidien atteint avec {$completedCount} tâches terminées !",
            "⭐ Fantastique ! Vous avez terminé toutes vos tâches aujourd'hui !",
            "🎊 Excellent travail ! {$completedCount} tâches accomplies, objectif 100% atteint !",
        ];

        $message = $messages[array_rand($messages)];

        $command = new CreateNotificationCommand(
            userId: $userId,
            type: NotificationType::TASK_TODAY,
            priority: NotificationPriority::MEDIUM,
            title: "🎯 Objectif du jour atteint !",
            message: $message,
            data: [
                'type' => 'goal_achieved',
                'completed_count' => $completedCount,
                'celebration' => true
            ]
        );

        $this->createNotificationHandler->handle($command);
    }

    /**
     * Check if user has notification preferences enabled
     */
    private function userWantsNotifications(int $userId): bool
    {
        $receiveNotifications = DB::table('users')
            ->where('id', $userId)
            ->value('receive_notifications');

        return (bool) $receiveNotifications;
    }

    /**
     * Check if we already sent a goal achievement notification today
     */
    private function hasGoalNotificationToday(int $userId): bool
    {
        $today = new DateTimeImmutable('today');
        
        return DB::table('notifications')
            ->where('user_id', $userId)
            ->whereJsonContains('data->type', 'goal_achieved')
            ->whereDate('created_at', $today->format('Y-m-d'))
            ->exists();
    }

    /**
     * Check if we already sent an evening reminder today
     */
    private function hasReminderNotificationToday(int $userId): bool
    {
        $today = new DateTimeImmutable('today');
        
        return DB::table('notifications')
            ->where('user_id', $userId)
            ->whereJsonContains('data->type', 'evening_reminder')
            ->whereDate('created_at', $today->format('Y-m-d'))
            ->exists();
    }
}
