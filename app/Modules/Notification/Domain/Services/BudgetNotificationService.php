<?php

namespace App\Modules\Notification\Domain\Services;

use App\Modules\Budget\Domain\ValueObjects\BudgetPeriod;
use App\Modules\Notification\Application\Commands\CreateNotificationCommand;
use App\Modules\Notification\Application\Commands\CreateNotificationCommandHandler;
use App\Modules\Notification\Domain\ValueObjects\NotificationPriority;
use App\Modules\Notification\Domain\ValueObjects\NotificationType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BudgetNotificationService
{
    public function __construct(
        private readonly CreateNotificationCommandHandler $createNotificationHandler,
    ) {}

    public function generateNotifications(): void
    {
        // 1. Récupérer tous les budgets définis
        // Note: On utilise DB directement pour l'efficacité ici, plutôt que d'hydrater des entités Budget
        $budgets = DB::table('budgets')->get();

        foreach ($budgets as $budget) {
            $this->checkBudget((object) $budget);
        }
    }

    public function checkUserBudgets(int $userId): void
    {
        $budgets = DB::table('budgets')->where('user_id', $userId)->get();

        foreach ($budgets as $budget) {
            $this->checkBudget((object) $budget);
        }
    }

    private function checkBudget(object $budget): void
    {
        // 2. Calculer les dépenses pour la période
        $startDate = $this->getStartDate(BudgetPeriod::from($budget->period));
        
        $totalExpenses = DB::table('transactions')
            ->where('user_id', $budget->user_id)
            // Si le budget est lié à une catégorie spécifique
            ->when($budget->category_id, function($query) use ($budget) {
                return $query->where('category_id', $budget->category_id);
            })
            ->where('type', 'expense') // On suppose que 'expense' est le type pour les dépenses
            ->where('created_at', '>=', $startDate)
            ->sum('amount');

        // 3. Calculer le pourcentage
        if ($budget->amount <= 0) return;
        
        $percentage = ($totalExpenses / $budget->amount) * 100;

        // 4. Générer les notifications
        
        // Seuil critique (80%)
        if ($percentage >= 80) {
            // Vérifier si une notification a déjà été envoyée aujourd'hui pour ce budget
            // Pour éviter le spam. Ici on simplifie.
            
            $this->createNotification(
                $budget->user_id,
                NotificationType::BUDGET_CRITICAL,
                NotificationPriority::HIGH,
                "Budget critique : {$percentage}% atteint",
                "Attention ! Vous avez consommé " . number_format($percentage, 1) . "% de votre budget ({$budget->amount} {$budget->currency}). Dépenses : {$totalExpenses}"
            );
            return;
        }

        // Seuil d'avertissement (50%)
        if ($percentage >= 50) {
            $this->createNotification(
                $budget->user_id,
                NotificationType::BUDGET_WARNING,
                NotificationPriority::MEDIUM,
                "Avertissement budget : {$percentage}% atteint",
                "Vous avez dépassé la moitié de votre budget ({$budget->amount} {$budget->currency}). Dépenses : {$totalExpenses}"
            );
        }
    }

    private function getStartDate(BudgetPeriod $period): Carbon
    {
        $now = Carbon::now();
        
        return match($period) {
            BudgetPeriod::DAILY => $now->startOfDay(),
            BudgetPeriod::WEEKLY => $now->startOfWeek(),
            BudgetPeriod::MONTHLY => $now->startOfMonth(),
        };
    }

    private function createNotification(
        int $userId,
        NotificationType $type, 
        NotificationPriority $priority, 
        string $title, 
        string $message
    ): void {
        // Vérifier les préférences utilisateur
        $userWantsNotifications = DB::table('users')
            ->where('id', $userId)
            ->value('receive_notifications');

        if ($userWantsNotifications === 0) {
            return;
        }

        // Logique anti-spam simplifiée : on pourrait vérifier en DB si une notif similaire existe depuis X temps
        // Ici on suppose que le cron tourne à une fréquence raisonnable (ex: 1h)
        
        // Vérification basique pour ne pas spammer toutes les heures si on est toujours au même niveau
        $exists = DB::table('notifications')
            ->where('user_id', $userId)
            ->where('type', $type->value)
            ->where('created_at', '>=', Carbon::now()->subHours(24)) // Une fois par 24h max pour le même type
            ->exists();

        if ($exists) return;

        $command = new CreateNotificationCommand(
            userId: $userId,
            type: $type,
            priority: $priority,
            title: $title,
            message: $message,
        );

        $this->createNotificationHandler->handle($command);
    }
}
