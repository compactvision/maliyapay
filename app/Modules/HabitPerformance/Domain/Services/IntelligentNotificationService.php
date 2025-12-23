<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Modules\HabitPerformance\Domain\Entities\FinancialForecast;
use App\Modules\Budget\Domain\Entities\Budget;
use App\Modules\Notification\Domain\Services\NotificationService;
use App\Models\User;
use DateTimeImmutable;

/**
 * IntelligentNotificationService - Notifications contextuelles et intelligentes
 * 
 * Gère toutes les notifications du module Habit/Performance
 */
class IntelligentNotificationService
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    /**
     * Notifie l'utilisateur d'un dépassement de seuil budgétaire
     */
    public function notifyBudgetThreshold(
        User $user,
        Budget $budget,
        string $threshold,
        float $spent,
        float $percentage
    ): void {
        $categoryName = $budget->categoryName() ?? 'Catégorie';
        $limit = $budget->amount();
        $currency = $budget->currency();

        [$title, $message, $icon] = match ($threshold) {
            '50%' => [
                '⚠️ Budget à 50%',
                "Vous avez utilisé 50% de votre budget {$categoryName} ({$spent}{$currency}/{$limit}{$currency}). Surveillez vos dépenses.",
                '⚠️'
            ],
            '80%' => [
                '🔶 Alerte Budget',
                "Attention ! 80% de votre budget {$categoryName} est consommé ({$spent}{$currency}/{$limit}{$currency}). Limitez vos dépenses.",
                '🔶'
            ],
            '100%' => [
                '🚨 Budget Dépassé',
                "Budget {$categoryName} dépassé ! {$spent}{$currency}/{$limit}{$currency} (" . number_format($percentage, 1) . "%). Réduisez immédiatement vos dépenses.",
                '🚨'
            ],
            default => [
                'ℹ️ Info Budget',
                "Budget {$categoryName}: {$spent}{$currency}/{$limit}{$currency}",
                'ℹ️'
            ]
        };

        $this->notificationService->send(
            $user,
            $title,
            $message,
            'budget_threshold_' . $threshold
        );
    }

    /**
     * Notifie l'utilisateur d'une prévision financière négative
     */
    public function notifyNegativeForecast(User $user, FinancialForecast $forecast): void
    {
        $projectedBalance = $forecast->projectedEndBalance();
        $daysUntilZero = $forecast->daysUntilZeroBalance();
        
        if ($forecast->isCritical()) {
            $title = '🔮 Prévision Critique';
            
            if ($daysUntilZero !== null && $daysUntilZero > 0) {
                $message = "À ce rythme, votre solde atteindra 0$ dans {$daysUntilZero} jour(s). Réduisez vos dépenses immédiatement !";
            } else {
                $deficit = abs($projectedBalance);
                $message = "Vous risquez un déficit de " . number_format($deficit, 2) . "$ en fin de mois. Action urgente requise !";
            }
            
            // Ajouter la première recommandation
            if (!empty($forecast->recommendations())) {
                $message .= "\n\n" . $forecast->recommendations()[0];
            }
            
            $this->notificationService->send(
                $user,
                $title,
                $message,
                'forecast_critical'
            );
        } elseif ($forecast->isWarning()) {
            $title = '⚠️ Prévision Financière';
            $message = "Votre solde diminue rapidement. Balance projetée: " . number_format($projectedBalance, 2) . "$. Soyez vigilant.";
            
            $this->notificationService->send(
                $user,
                $title,
                $message,
                'forecast_warning'
            );
        }
    }

    /**
     * Notifie l'utilisateur d'une prévision positive
     */
    public function notifyPositiveForecast(User $user, FinancialForecast $forecast): void
    {
        if ($forecast->isPositive()) {
            $surplus = $forecast->projectedChange();
            $title = '🌟 Excellente Gestion !';
            $message = "Vous terminerez le mois avec +" . number_format($surplus, 2) . "$. Continuez ainsi ! 💰";
            
            $this->notificationService->send(
                $user,
                $title,
                $message,
                'forecast_positive'
            );
        }
    }

    /**
     * Envoie un rappel pour les tâches non terminées
     */
    public function notifyTaskReminder(User $user, int $remainingTasks, string $timeOfDay = 'evening'): void
    {
        [$title, $message, $icon] = match ($timeOfDay) {
            'morning' => [
                '☀️ Bonjour !',
                "Vous avez {$remainingTasks} tâche(s) à compléter aujourd'hui. Bon courage !",
                '☀️'
            ],
            'afternoon' => [
                '⏰ Rappel',
                "Il vous reste {$remainingTasks} tâche(s) à compléter aujourd'hui.",
                '⏰'
            ],
            'evening' => [
                '🌙 Dernière Chance',
                "{$remainingTasks} tâche(s) non complétées. Terminez-les avant la fin de la journée !",
                '🌙'
            ],
            '20h' => [
                '🕗 Rappel 20h',
                "Il est 20h, et vous avez encore {$remainingTasks} tâche(s). Courage, ne lâchez rien !",
                '🕗'
            ],
            default => [
                'ℹ️ Tâches',
                "{$remainingTasks} tâche(s) restantes.",
                'ℹ️'
            ]
        };

        $this->notificationService->send(
            $user,
            $title,
            $message,
            'task_reminder_' . $timeOfDay
        );
    }

    /**
     * Notifie l'utilisateur qu'il a gagné des XP
     */
    public function notifyXpGained(User $user, int $xp, string $reason): void
    {
        $title = '✨ XP Gagnés !';
        $message = "+{$xp} XP — {$reason}";
        
        $this->notificationService->send(
            $user,
            $title,
            $message,
            'xp_gained'
        );
    }

    /**
     * Notifie l'utilisateur qu'il a perdu des XP (pénalité)
     */
    public function notifyXpLost(User $user, int $xp, string $reason): void
    {
        $title = '⚠️ XP Perdus';
        $message = "−{$xp} XP — {$reason}";
        
        $this->notificationService->send(
            $user,
            $title,
            $message,
            'xp_lost'
        );
    }

    /**
     * Notifie l'utilisateur qu'il a monté de niveau
     */
    public function notifyLevelUp(User $user, int $newLevel, int $coinsAwarded): void
    {
        $title = '🎉 Niveau ' . $newLevel . ' Atteint !';
        
        $levelTitles = [
            10 => 'Apprenti',
            20 => 'Pratiquant',
            30 => 'Compétent',
            40 => 'Expérimenté',
            50 => 'Expert',
            60 => 'Maître',
            70 => 'Grand Maître',
            80 => 'Virtuose',
            90 => 'Légende',
            100 => 'Perfection Absolue'
        ];

        $levelTitle = '';
        foreach ($levelTitles as $level => $title) {
            if ($newLevel >= $level) {
                $levelTitle = $title;
            }
        }

        $message = "Félicitations ! Vous êtes maintenant {$levelTitle}. ";
        $message .= "Bonus : +{$coinsAwarded} coins 💰";
        
        $this->notificationService->send(
            $user,
            $title,
            $message,
            'level_up'
        );
    }

    /**
     * Notifie l'utilisateur de l'atteinte de son objectif quotidien
     */
    public function notifyDailyGoalAchieved(User $user, int $xpEarned): void
    {
        $title = '🎯 Objectif Atteint !';
        $message = "Excellent travail ! Vous avez complété toutes vos tâches aujourd'hui. +{$xpEarned} XP 💪";
        
        $this->notificationService->send(
            $user,
            $title,
            $message,
            'daily_goal_achieved'
        );
    }

    /**
     * Notifie l'utilisateur d'un streak maintenu
     */
    public function notifyStreakMaintained(User $user, int $streakDays): void
    {
        $title = '🔥 Streak de ' . $streakDays . ' jours !';
        $message = "Incroyable ! Vous maintenez votre régularité depuis {$streakDays} jours consécutifs. Continuez ! 🚀";
        
        // Bonus spécial pour les milestones
        if (in_array($streakDays, [7, 14, 30, 60, 90, 180, 365])) {
            $message .= "\n🎁 Milestone atteint ! Bonus spécial débloqué.";
        }
        
        $this->notificationService->send(
            $user,
            $title,
            $message,
            'streak_maintained'
        );
    }

    /**
     * Notifie l'utilisateur d'une rupture de streak
     */
    public function notifyStreakBroken(User $user, int $previousStreak): void
    {
        if ($previousStreak >= 3) {
            $title = '💔 Streak Interrompu';
            $message = "Votre série de {$previousStreak} jours s'est arrêtée. Recommencez dès aujourd'hui !";
            
            $this->notificationService->send(
                $user,
                $title,
                $message,
                'streak_broken'
            );
        }
    }

    /**
     * Envoie un résumé de performance hebdomadaire
     */
    public function notifyWeeklySummary(
        User $user,
        int $financialScore,
        int $taskScore,
        int $overallScore,
        int $xpGained,
        int $xpLost
    ): void {
        $title = '📊 Résumé Hebdomadaire';
        
        $netXp = $xpGained - $xpLost;
        $xpText = $netXp >= 0 ? "+{$netXp} XP" : "{$netXp} XP";
        
        $message = "Cette semaine:\n";
        $message .= "💰 Finance: {$financialScore}/100\n";
        $message .= "✅ Tâches: {$taskScore}/100\n";
        $message .= "📈 Global: {$overallScore}/100\n";
        $message .= "⭐ XP: {$xpText}";
        
        $this->notificationService->send(
            $user,
            $title,
            $message,
            'weekly_summary'
        );
    }
}
