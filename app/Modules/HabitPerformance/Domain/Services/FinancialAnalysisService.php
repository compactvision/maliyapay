<?php

declare(strict_types=1);

namespace App\Modules\HabitPerformance\Domain\Services;

use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\Entities\Transaction;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use DateTimeImmutable;

class FinancialAnalysisService
{
    public function __construct(
        private TransactionRepositoryInterface $transactionRepository,
        private BudgetRepositoryInterface $budgetRepository
    ) {
    }

    public function analyze(int $userId): array
    {
        $userIdStr = (string) $userId;
        $startOfMonth = new DateTimeImmutable('first day of this month');
        $endOfMonth = new DateTimeImmutable('last day of this month');

        // Fetch transactions
        $transactions = $this->transactionRepository->findByUserAndPeriod(
            $userIdStr,
            $startOfMonth,
            $endOfMonth
        );

        // Fetch budgets
        $budgets = $this->budgetRepository->findAllByUser($userIdStr);

        // Calculate totals by category
        $spentByCategory = [];
        $totalSpent = 0.0;
        foreach ($transactions as $transaction) {
            /** @var Transaction $transaction */
            if ($transaction->type() === TransactionType::EXPENSE) { 
                $catId = $transaction->categoryId();
                if (!isset($spentByCategory[$catId])) {
                    $spentByCategory[$catId] = 0.0;
                }
                $spentByCategory[$catId] += $transaction->amount();
                $totalSpent += $transaction->amount();
            }
        }

        // Prepare report
        $categoriesReport = [];
        $budgetCompliedCount = 0;
        $totalBudgetLimit = 0.0;
        
        foreach ($budgets as $budget) {
            $catId = $budget->categoryId();
            $limit = $budget->amount();
            $spent = $spentByCategory[$catId] ?? 0.0;
            $totalBudgetLimit += $limit;

            $status = 'ok';
            $color = 'green';
            if ($spent > $limit) {
                $status = 'exceeded';
                $color = 'red';
            } else {
                $budgetCompliedCount++;
                if ($spent > $limit * 0.8) {
                    $color = 'orange';
                }
            }

            $categoriesReport[] = [
                'categoryId' => $catId,
                'limit' => $limit,
                'spent' => $spent,
                'remaining' => max(0, $limit - $spent),
                'status' => $status,
                'color' => $color
            ];
        }

        // Calculate income for Balance
        $totalIncome = 0.0;
        foreach ($transactions as $transaction) {
             if ($transaction->type() === TransactionType::INCOME) {
                 $totalIncome += $transaction->amount();
             }
        }
        $monthlyBalance = $totalIncome - $totalSpent;

        // Generate personalized financial advice
        // Generate personalized financial advice & Rules
        $advice = [];
        $financialStatus = 'Neutral';

        // 1. Rule: Balance 50% check
        // We need "Balance Mensuelle Disponible". Assuming this means Income for the month?
        // Or "Beginning Balance + Income"? 
        // User says: "Comparer les dépenses à la balance mensuelle disponible"
        // Let's assume Balance Available = Total Income.
        $balanceAvailable = $totalIncome; // Simplified for this context
        
        $spendingRatio = 0.0;
        if ($balanceAvailable > 0) {
            $spendingRatio = $totalSpent / $balanceAvailable;
        }

        // Current day of month for context (e.g. if 50% spent on day 2, that's bad)
        $today = (int) (new DateTimeImmutable())->format('d');
        $daysInMonth = (int) $endOfMonth->format('d');
        $monthProgress = $today / $daysInMonth;

        if ($spendingRatio > 0.5) {
            // Already spent > 50%
            if ($monthProgress < 0.5) {
                // Critical: Spent > 50% before mid-month
                $advice[] = "⚠️ Alerte : Vous avez déjà consommé plus de 50% de vos revenus alors que le mois n'est pas fini.";
                $advice[] = "💡 Conseil : Réduisez drastiquement les dépenses non essentielles.";
                $financialStatus = 'Danger';
            } else {
                // Normal usage? 
                if ($spendingRatio > 0.8 && $monthProgress < 0.8) {
                     $advice[] = "⚠️ Attention : Vos dépenses accélèrent trop vite.";
                } else {
                     $advice[] = "ℹ️ Vous avez utilisé plus de la moitié de votre budget.";
                }
            }
        } elseif ($spendingRatio < 0.5 && $monthProgress > 0.8) {
             // End of month approaching and still < 50% spent? Excellent!
             $advice[] = "🌟 Excellent ! Vous avez dépensé moins de 50% de vos revenus ce mois-ci.";
             $advice[] = "💰 C'est le moment idéal pour mettre de côté ou investir.";
             $financialStatus = 'Saver';
        }

        // Balance feedback
        if ($monthlyBalance > 0) {
            $advice[] = "✅ Balance positive : +" . number_format($monthlyBalance, 2);
        } elseif ($monthlyBalance < 0) {
            $advice[] = "🛑 Balance négative : " . number_format($monthlyBalance, 2);
        }

        // Budget compliance
        if (count($budgets) > 0) {
            $overBudgetCount = count($budgets) - $budgetCompliedCount;
            if ($overBudgetCount === 0) {
                 $advice[] = "🏆 Tous vos budgets sont respectés. Continuez ainsi !";
            } else {
                 $advice[] = "🚨 $overBudgetCount catégories ont dépassé leur budget.";
            }
        } else {
            $advice[] = "conseil : Définissez des budgets pour mieux suivre vos dépenses.";
        }

        // Score (0-100)
        $score = 100;
        if (count($budgets) > 0) {
            $overBudgetCount = count($budgets) - $budgetCompliedCount;
            $score -= ($overBudgetCount * 20);
        } else {
             $score = 50; 
        }
        $score = max(0, $score);

        return [
            'score' => $score,
            'summary' => "Balance: " . number_format($monthlyBalance, 2) . ". Budgets: $budgetCompliedCount/" . count($budgets) . " respectés.",
            'monthlyBalance' => $monthlyBalance,
            'totalIncome' => $totalIncome,
            'totalExpenses' => $totalSpent,
            'categories' => $categoriesReport,
            'advice' => $advice,
            'financialStatus' => $financialStatus
        ];
    }
}
