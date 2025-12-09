<?php

namespace App\Console\Commands;

use App\Modules\Notification\Domain\Services\BudgetNotificationService;
use Illuminate\Console\Command;

class CheckBudgetNotifications extends Command
{
    protected $signature = 'notifications:check-budget';
    protected $description = 'Vérifie les budgets et génère des alertes si les seuils (50%, 80%) sont dépassés';

    public function handle(BudgetNotificationService $service): void
    {
        $this->info('Début de la vérification des budgets...');
        
        try {
            $service->generateNotifications();
            $this->info('Vérification terminée.');
        } catch (\Exception $e) {
            $this->error('Erreur lors de la vérification : ' . $e->getMessage());
        }
    }
}
