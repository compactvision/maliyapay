<?php

namespace App\Modules\Notification\Domain\Services;

use App\Modules\Notification\Application\Commands\CreateNotificationCommand;
use App\Modules\Notification\Application\Commands\CreateNotificationCommandHandler;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;
use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use App\Modules\Task\Domain\Repositories\TaskRepositoryInterface;
use App\Modules\Task\Domain\Entities\Task;
use Carbon\Carbon;

class TaskNotificationService
{
    public function __construct(
        private readonly TaskRepositoryInterface $taskRepository,
        private readonly CreateNotificationCommandHandler $createNotificationHandler,
    ) {}

    public function generateNotifications(): void
    {
        // On pourrait récupérer tous les utilisateurs ou le faire par utilisateur
        // Pour simplifier ici, on suppose qu'on peut récupérer toutes les tâches actives
        // Idéalement, le TaskRepository devrait avoir une méthode pour trouver les tâches à notifier
        
        $tasks = $this->taskRepository->findAllActive(); // Méthode hypothétique à adapter

        foreach ($tasks as $task) {
            $this->checkAndNotify($task);
        }
    }

    private function checkAndNotify(Task $task): void
    {
        if (!$task->dueDate()) {
            return;
        }

        $dueDate = Carbon::parse($task->dueDate());
        $today = Carbon::today();
        
        // Tâche en retard
        if ($dueDate->lt($today)) {
            $this->createNotification(
                $task, 
                NotificationType::TASK_OVERDUE, 
                NotificationPriority::HIGH,
                "Tâche en retard : {$task->title()}",
                "La tâche '{$task->title()}' était prévue pour le {$dueDate->format('d/m/Y')}."
            );
            return;
        }

        // Tâche pour aujourd'hui
        if ($dueDate->isSameDay($today)) {
            $this->createNotification(
                $task,
                NotificationType::TASK_TODAY,
                NotificationPriority::MEDIUM,
                "Tâche pour aujourd'hui : {$task->title()}",
                "N'oubliez pas de terminer '{$task->title()}' aujourd'hui."
            );
            return;
        }

        // Tâche à venir (dans les 3 prochains jours)
        if ($dueDate->gt($today) && $dueDate->lte($today->copy()->addDays(3))) {
            $diff = $dueDate->diffInDays($today);
            $this->createNotification(
                $task,
                NotificationType::TASK_UPCOMING,
                NotificationPriority::LOW,
                "Tâche à venir : {$task->title()}",
                "La tâche '{$task->title()}' est prévue dans {$diff} jours ({$dueDate->format('d/m')})."
            );
        }
    }

    private function createNotification(
        Task $task, 
        NotificationType $type, 
        NotificationPriority $priority, 
        string $title, 
        string $message
    ): void {
        // Vérifier les préférences de l'utilisateur
        // Note: On suppose que $task->user est chargé ou on le récupère. 
        // Ici on va faire une requête légère pour vérifier le flag
        $userWantsNotifications = \Illuminate\Support\Facades\DB::table('users')
            ->where('id', $task->userId())
            ->value('receive_notifications');

        if ($userWantsNotifications === 0) { // 0 = false en DB sqlite/mysql parfois, ou false
            return;
        }

        // Ici on pourrait ajouter une vérification pour ne pas spammer (ex: si notif déjà envoyée aujourd'hui)
        // Pour l'instant on crée simplement la commande
        
        $command = new CreateNotificationCommand(
            userId: $task->userId(),
            type: $type,
            priority: $priority,
            title: $title,
            message: $message,
            data: ['task_id' => $task->id()->toString()]
        );

        $this->createNotificationHandler->handle($command);
    }
}
