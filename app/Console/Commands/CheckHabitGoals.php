<?php

namespace App\Console\Commands;

use App\Modules\HabitPerformance\Domain\Services\HabitGoalNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckHabitGoals extends Command
{
    protected $signature = 'habit:check-goals';
    protected $description = 'Vérifie les objectifs quotidiens et envoie des notifications';

    public function handle(HabitGoalNotificationService $service): void
    {
        $this->info('Vérification des objectifs quotidiens...');
        
        try {
            $currentHour = (int) now()->format('H');
            
            // Get all active users
            $users = DB::table('users')
                ->where('receive_notifications', true)
                ->select('id')
                ->get();

            $goalAchievedCount = 0;
            $reminderSentCount = 0;

            foreach ($users as $user) {
                // Check for goal achievement (anytime)
                $service->checkDailyGoalAchievement($user->id);
                
                // Send evening reminder only at 19H
                if ($currentHour === 19) {
                    $service->sendEveningReminderNotification($user->id);
                    $reminderSentCount++;
                }
            }

            $this->info("Vérification terminée pour " . count($users) . " utilisateurs.");
            
            if ($currentHour === 19) {
                $this->info("Rappels du soir envoyés.");
            }
            
        } catch (\Exception $e) {
            $this->error('Erreur lors de la vérification : ' . $e->getMessage());
        }
    }
}
