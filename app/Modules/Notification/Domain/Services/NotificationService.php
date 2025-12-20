<?php

declare(strict_types=1);

namespace App\Modules\Notification\Domain\Services;

use App\Models\User;
use App\Modules\Notification\Application\Commands\CreateNotificationCommand;
use App\Modules\Notification\Application\Commands\CreateNotificationCommandHandler;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;
use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function __construct(
        private CreateNotificationCommandHandler $createNotificationHandler
    ) {
    }

    public function send(
        User $user,
        string $title,
        string $message,
        string $type = 'info',
        string $priority = 'medium',
        array $data = []
    ): void {
        // Check user preferences
        $wantsNotifications = DB::table('users')
            ->where('id', $user->id)
            ->value('receive_notifications');

        if ($wantsNotifications === 0) {
            return;
        }

        // Map string type to ValueObjects
        $notifType = match ($type) {
            'budget_exceeded', 'budget_critical' => NotificationType::BUDGET_CRITICAL,
            'budget_warning', 'budget_90_percent', 'budget_75_percent', 'budget_50_percent' => NotificationType::BUDGET_WARNING,
            'task_overdue' => NotificationType::TASK_OVERDUE,
            'task_today', 'task_reminder' => NotificationType::TASK_TODAY,
            'task_upcoming' => NotificationType::TASK_UPCOMING,
            default => NotificationType::BUDGET_WARNING // Fallback
        };

        $notifPriority = match ($priority) {
            'high' => NotificationPriority::HIGH,
            'low' => NotificationPriority::LOW,
            default => NotificationPriority::MEDIUM
        };

        $command = new CreateNotificationCommand(
            userId: $user->id,
            type: $notifType,
            priority: $notifPriority,
            title: $title,
            message: $message,
            data: $data
        );

        $this->createNotificationHandler->handle($command);
    }
}
