<?php

namespace App\Modules\Notification\Domain\ValueObjects;

enum NotificationType: string
{
    case TASK_OVERDUE = 'task_overdue';
    case TASK_TODAY = 'task_today';
    case TASK_UPCOMING = 'task_upcoming';
    case BUDGET_WARNING = 'budget_warning';
    case BUDGET_CRITICAL = 'budget_critical';

    public function getLabel(): string
    {
        return match($this) {
            self::TASK_OVERDUE => 'Tâche en retard',
            self::TASK_TODAY => 'Tâche du jour',
            self::TASK_UPCOMING => 'Tâche à venir',
            self::BUDGET_WARNING => 'Alerte budget',
            self::BUDGET_CRITICAL => 'Budget critique',
        };
    }

    public function getIcon(): string
    {
        return match($this) {
            self::TASK_OVERDUE => 'alert-circle',
            self::TASK_TODAY => 'calendar',
            self::TASK_UPCOMING => 'clock',
            self::BUDGET_WARNING => 'alert-triangle',
            self::BUDGET_CRITICAL => 'alert-octagon',
        };
    }

    public function getColor(): string
    {
        return match($this) {
            self::TASK_OVERDUE => 'red',
            self::TASK_TODAY => 'yellow',
            self::TASK_UPCOMING => 'blue',
            self::BUDGET_WARNING => 'yellow',
            self::BUDGET_CRITICAL => 'red',
        };
    }
}
