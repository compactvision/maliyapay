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
        $advice = [];
        
        // Balance feedback
        if ($monthlyBalance > 0) {
            $advice[] = "💰 Bravo ! Vous épargnez " . number_format($monthlyBalance, 2) . " ce mois-ci.";
            if ($monthlyBalance > $totalIncome * 0.2) {
                $advice[] = "🌟 Excellent ! Vous épargnez plus de 20% de vos revenus.";
            }
        } elseif ($monthlyBalance < 0) {
            $advice[] = "⚠️ Attention ! Vos dépenses dépassent vos revenus de " . number_format(abs($monthlyBalance), 2) . ".";
            $advice[] = "💡 Réduisez vos dépenses non essentielles pour équilibrer votre budget.";
        } else {
            $advice[] = "⚖️ Votre budget est équilibré, mais essayez d'épargner un peu.";
        }

        // Budget compliance
        if (count($budgets) > 0) {
            if ($budgetCompliedCount === count($budgets)) {
                $advice[] = "🏆 Parfait ! Tous vos budgets sont respectés.";
            } else {
                $exceededCount = count($budgets) - $budgetCompliedCount;
                if ($exceededCount === 1) {
                    $advice[] = "🚨 Vous avez dépassé le budget pour 1 catégorie.";
                } else {
                    $advice[] = "🚨 Vous avez dépassé le budget pour $exceededCount catégories.";
                }
                $advice[] = "🔍 Identifiez vos dépenses excessives et ajustez vos habitudes.";
            }
        } else {
            $advice[] = "📊 Définissez des budgets par catégorie pour mieux contrôler vos finances.";
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
            'advice' => $advice
        ];
    }
}
