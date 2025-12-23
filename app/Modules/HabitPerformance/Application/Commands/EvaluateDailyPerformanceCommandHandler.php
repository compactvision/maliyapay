<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Application\Commands;

use App\Modules\HabitPerformance\Domain\Entities\PerformanceSnapshot;
use App\Modules\HabitPerformance\Domain\Events\PerformanceEvaluated;
use App\Modules\HabitPerformance\Domain\Events\XpAwarded;
use App\Modules\HabitPerformance\Domain\Repositories\PerformanceSnapshotRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\HabitPerformance\Domain\Services\FinancialAnalysisService;
use App\Modules\HabitPerformance\Domain\Services\TaskPerformanceService;
use App\Modules\HabitPerformance\Domain\Services\IntelligentNotificationService;
use App\Models\User;
use Ramsey\Uuid\Uuid;
use Illuminate\Support\Facades\Event;

/**
 * Handler pour l'évaluation quotidienne de performance
 */
class EvaluateDailyPerformanceCommandHandler
{
    public function __construct(
        private PerformanceSnapshotRepositoryInterface $snapshotRepository,
        private GamificationProfileRepositoryInterface $gamificationRepository,
        private FinancialAnalysisService $financialAnalysisService,
        private TaskPerformanceService $taskPerformanceService,
        private IntelligentNotificationService $notificationService
    ) {
    }

    public function handle(EvaluateDailyPerformanceCommand $command): void
    {
        $user = User::find($command->userId);
        if (!$user) {
            return;
        }

        // 1. Analyser les finances
        $financialAnalysis = $this->financialAnalysisService->analyze($command->userId);
        $financialScore = $financialAnalysis['score'];

        // 2. Analyser les tâches
        $taskCompletion = $this->taskPerformanceService->calculateDailyCompletion(
            $user,
            \Carbon\Carbon::instance($command->date)
        );
        $taskScore = (int) ($taskCompletion->completionRate * 100);

        // 3. Calculer score global (60% finance, 40% tâches)
        $overallScore = (int) round(($financialScore * 0.6) + ($taskScore * 0.4));

        // 4. Calculer XP gagnés/perdus
        $xpGained = 0;
        $xpLost = 0;

        // XP pour les tâches
        if ($taskCompletion->allCompleted && $taskCompletion->totalTasks > 0) {
            $taskXp = 30 + ($taskCompletion->totalTasks >= 10 ? 20 : 0);
            $xpGained += $taskXp;
        } elseif ($taskCompletion->completionRate > 0) {
            $taskXp = (int) ($taskCompletion->completionRate * 30);
            $xpGained += $taskXp;
        }

        // XP pour la gestion financière
        if ($financialScore >= 90) {
            $xpGained += 50; // Excellente gestion
        } elseif ($financialScore >= 70) {
            $xpGained += 30; // Bonne gestion
        } elseif ($financialScore >= 50) {
            $xpGained += 10; // Gestion correcte
        }

        // Pénalités
        if ($taskCompletion->totalTasks > 0 && $taskCompletion->completedTasks == 0) {
            $xpLost += 20; // Aucune tâche complétée
        }

        if ($financialScore < 30) {
            $xpLost += 30; // Très mauvaise gestion financière
        }

        // 5. Mettre à jour le profil de gamification
        $profile = $this->gamificationRepository->findByUserId($user->id);
        if ($profile) {
            $oldLevel = $profile->currentLevel();
            
            if ($xpGained > 0) {
                $profile->addXp($xpGained);
            }
            
            if ($xpLost > 0) {
                $profile->removeXp($xpLost);
            }

            // Mettre à jour les scores
            $profile->updateFinancialScore($financialScore);
            $profile->updateTaskScore($taskScore);

            // Maintenir le streak si toutes les tâches sont complétées
            if ($taskCompletion->allCompleted) {
                $profile->maintainStreak($command->date);
                $profile->incrementStreakDays();
                
                // Notifier si milestone de streak
                if ($profile->streakDays() % 7 == 0) {
                    $this->notificationService->notifyStreakMaintained($user, $profile->streakDays());
                }
            } else {
                $previousStreak = $profile->streakDays();
                $profile->resetStreakDays();
                
                if ($previousStreak >= 3) {
                    $this->notificationService->notifyStreakBroken($user, $previousStreak);
                }
            }

            $this->gamificationRepository->save($profile);

            // Dispatcher events
            if ($xpGained > 0) {
                Event::dispatch(new XpAwarded(
                    $user->id,
                    $xpGained,
                    'Performance quotidienne',
                    $profile->xp(),
                    $profile->currentLevel(),
                    $command->date
                ));

                $this->notificationService->notifyXpGained($user, $xpGained, 'Performance quotidienne');
            }

            if ($xpLost > 0) {
                $this->notificationService->notifyXpLost($user, $xpLost, 'Pénalités de performance');
            }

            // Notifier si objectif quotidien atteint
            if ($taskCompletion->allCompleted && $taskCompletion->totalTasks > 0) {
                $this->notificationService->notifyDailyGoalAchieved($user, $xpGained);
            }
        }

        // 6. Créer le snapshot
        $insights = [
            'financial_analysis' => $financialAnalysis['advice'] ?? [],
            'task_completion' => [
                'total' => $taskCompletion->totalTasks,
                'completed' => $taskCompletion->completedTasks,
                'rate' => $taskCompletion->completionRate,
            ],
        ];

        $snapshot = PerformanceSnapshot::create(
            Uuid::uuid4(),
            $user->id,
            $command->date,
            $financialScore,
            $taskScore,
            $overallScore,
            $xpGained,
            $xpLost,
            $insights
        );

        $this->snapshotRepository->save($snapshot);

        // 7. Dispatcher event de performance évaluée
        Event::dispatch(new PerformanceEvaluated(
            $user->id,
            $financialScore,
            $taskScore,
            $overallScore,
            $insights,
            $command->date
        ));
    }
}
