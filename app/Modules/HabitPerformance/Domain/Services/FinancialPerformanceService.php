<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Models\User;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\HabitPerformance\Domain\DTOs\BudgetPerformanceDTO;
use App\Modules\HabitPerformance\Domain\Repositories\GamificationProfileRepositoryInterface;
use App\Modules\Notification\Domain\Services\NotificationService;
use Carbon\Carbon;

class FinancialPerformanceService
{
    public function __construct(
        private BudgetRepositoryInterface $budgetRepository,
        private TransactionRepositoryInterface $transactionRepository,
        private GamificationProfileRepositoryInterface $gamificationRepository,
        private NotificationService $notificationService
    ) {
    }

    public function calculateMonthlyPerformance(User $user, ?Carbon $month = null): BudgetPerformanceDTO
    {
        $month = $month ?? Carbon::now();
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        // Get all budgets for the user
        $budgets = $this->budgetRepository->findByUserId($user->id);
        
        // Get all transactions for the month
        $transactions = $this->transactionRepository->findByUserIdAndDateRange(
            $user->id,
            $startOfMonth,
            $endOfMonth
        );

        $totalBudget = 0;
        $totalSpent = 0;
        $categoriesOverBudget = [];

        foreach ($budgets as $budget) {
            // Only consider monthly budgets for now
            if ($budget->period !== 'monthly') {
                continue;
            }

            $totalBudget += $budget->amount;

            // Calculate spending for this category
            $categorySpending = $transactions
                ->where('category_id', $budget->category_id)
                ->where('type', 'expense')
                ->sum('amount');

            $totalSpent += $categorySpending;

            // Check if over budget
            if ($categorySpending > $budget->amount) {
                $categoriesOverBudget[] = [
                    'category_id' => $budget->category_id,
                    'name' => $budget->category->name ?? 'Unknown',
                    'budget' => $budget->amount,
                    'spent' => $categorySpending,
                    'overage' => $categorySpending - $budget->amount
                ];
            }
        }

        return BudgetPerformanceDTO::create(
            totalBudget: $totalBudget,
            totalSpent: $totalSpent,
            categoriesOverBudget: $categoriesOverBudget
        );
    }

    public function awardFinancialPoints(User $user, BudgetPerformanceDTO $performance): int
    {
        $points = 0;

        // Award points based on adherence score
        if ($performance->adherenceScore >= 90) {
            $points = 100; // Excellent
        } elseif ($performance->adherenceScore >= 75) {
            $points = 75; // Good
        } elseif ($performance->adherenceScore >= 50) {
            $points = 50; // Acceptable
        } elseif ($performance->adherenceScore >= 25) {
            $points = 25; // Warning
        }

        // Deduct points if over budget
        if ($performance->isOverBudget) {
            $overagePercent = ($performance->spendingRatio - 1.0) * 100;
            $penalty = (int) ($overagePercent * 2.5); // 2.5 points per % over
            $points = max(0, $points - $penalty);
        }

        // Update gamification profile
        if ($points > 0) {
            $profile = $this->gamificationRepository->findByUserId($user->id);
            if ($profile) {
                $profile->addXp($points);
                $this->gamificationRepository->save($profile);
            }
        }

        return $points;
    }

    public function checkBudgetThresholds(User $user): void
    {
        $performance = $this->calculateMonthlyPerformance($user);
        
        $spendingPercent = $performance->spendingRatio * 100;

        // Send notifications at specific thresholds
        if ($spendingPercent >= 100 && $spendingPercent < 105) {
            $this->notificationService->send(
                $user,
                '🚨 Budget Dépassé!',
                'Vous avez dépassé votre budget mensuel. Réduisez vos dépenses immédiatement.',
                'budget_exceeded'
            );
        } elseif ($spendingPercent >= 90 && $spendingPercent < 95) {
            $this->notificationService->send(
                $user,
                '🚨 Alerte Budget!',
                '90% de votre budget mensuel utilisé. Attention à vos dépenses!',
                'budget_90_percent'
            );
        } elseif ($spendingPercent >= 75 && $spendingPercent < 80) {
            $this->notificationService->send(
                $user,
                '⚠️ Attention Budget',
                '75% de votre budget mensuel dépensé. Surveillez vos dépenses.',
                'budget_75_percent'
            );
        } elseif ($spendingPercent >= 50 && $spendingPercent < 55) {
            $this->notificationService->send(
                $user,
                '⚠️ Budget à mi-parcours',
                'Vous avez dépensé 50% de votre budget mensuel.',
                'budget_50_percent'
            );
        }
    }
}
