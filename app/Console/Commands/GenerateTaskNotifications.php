<?php

namespace App\Console\Commands;

use App\Modules\Notification\Domain\Services\TaskNotificationService;
use Illuminate\Console\Command;

class GenerateTaskNotifications extends Command
{
    protected $signature = 'notifications:generate-tasks';
    protected $description = 'Génère les notifications de rappel pour les tâches (retard, aujourd\'hui, à venir)';

    public function handle(TaskNotificationService $service): void
    {
        $this->info('Début de la génération des notifications de tâches...');
        
        try {
            $service->generateNotifications();
            $this->info('Notifications générées avec succès.');
        } catch (\Exception $e) {
            $this->error('Erreur lors de la génération : ' . $e->getMessage());
        }
    }
}
