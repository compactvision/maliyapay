<?php

declare(strict_types=1);

namespace App\Modules\Statistic\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use App\Modules\Category\Application\Queries\GetCategoriesQuery; // Assuming simplified access via model for stats
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use DateTimeImmutable;

class StatisticController extends Controller
{
    public function __construct(
        private readonly TransactionRepositoryInterface $repository
    ) {}

    public function index(Request $request): JsonResponse
    {
        $userId = (string) auth()->id();
        $transactions = $this->repository->findAllByUser($userId);
        
        // Get Distinct Currencies
        $availableCurrencies = [];
        foreach ($transactions as $t) {
            $availableCurrencies[$t->currency()] = true;
        }
        $availableCurrencies = array_keys($availableCurrencies);
        sort($availableCurrencies);

        // Requested Currency (Default to first available or USD)
        $requestedCurrency = $request->input('currency');
        if (!$requestedCurrency && count($availableCurrencies) > 0) {
            $requestedCurrency = $availableCurrencies[0];
        }
        $requestedCurrency = $requestedCurrency ?? 'CDF';

        $now = new DateTimeImmutable();
        $currentMonthStart = $now->modify('first day of this month')->setTime(0, 0, 0);
        $currentMonthEnd = $now->modify('last day of this month')->setTime(23, 59, 59);
        
        $lastMonthStart = $now->modify('first day of last month')->setTime(0, 0, 0);
        $lastMonthEnd = $now->modify('last day of last month')->setTime(23, 59, 59);

        // 1. Current Month Stats
        $currentIncome = 0;
        $currentExpenses = 0;
        $transactionCount = 0;
        $expensesByCategory = [];
        $dailySpending = [];

        // 2. Last Month Stats for Trends
        $lastIncome = 0;
        $lastExpenses = 0;

        foreach ($transactions as $t) {
            // Filter by Currency
            if ($t->currency() !== $requestedCurrency) {
                continue;
            }

            $date = $t->date();
            $amount = $t->amount();
            $type = $t->type(); // Enum

            // Current Month Aggregation
            if ($date >= $currentMonthStart && $date <= $currentMonthEnd) {
                $transactionCount++;
                
                if ($type === TransactionType::INCOME) {
                    $currentIncome += $amount;
                } else {
                    $currentExpenses += $amount;
                    
                    $catId = $t->categoryId();
                    if (!isset($expensesByCategory[$catId])) {
                         $expensesByCategory[$catId] = 0;
                    }
                    $expensesByCategory[$catId] += $amount;

                    $dayKey = $date->format('Y-m-d');
                    if (!isset($dailySpending[$dayKey])) {
                        $dailySpending[$dayKey] = 0;
                    }
                    $dailySpending[$dayKey] += $amount;
                }
            }

            // Last Month for Trends
            if ($date >= $lastMonthStart && $date <= $lastMonthEnd) {
                if ($type === TransactionType::INCOME) {
                    $lastIncome += $amount;
                } else {
                    $lastExpenses += $amount;
                }
            }
        }

        // Calculate Trends
        $incomeTrend = $lastIncome > 0 ? (($currentIncome - $lastIncome) / $lastIncome) * 100 : 100;
        $expenseTrend = $lastExpenses > 0 ? (($currentExpenses - $lastExpenses) / $lastExpenses) * 100 : 100;

        // Fetch Categories for Names
        $categories = \App\Modules\Category\Infrastructure\Models\Category::where('user_id', $userId)->get()->keyBy('id');

        // Format Expenses by Category
        $formattedExpensesByCategory = [];
        // Updated Color Palette
        $colors = [
            '#0ea5e9', // sky-500
            '#22c55e', // green-500
            '#eab308', // yellow-500
            '#f97316', // orange-500
            '#ef4444', // red-500
            '#a855f7', // purple-500
            '#ec4899', // pink-500
            '#6366f1', // indigo-500
        ];
        $i = 0;
        foreach ($expensesByCategory as $catId => $value) {
            $catName = $categories[$catId]->name ?? 'Inconnu';
            $formattedExpensesByCategory[] = [
                'name' => $catName,
                'value' => $value,
                'color' => $colors[$i % count($colors)]
            ];
            $i++;
        }

        // Format Daily Spending
        $recentDaily = [];
        for ($i = 6; $i >= 0; $i--) {
             $d = $now->modify("-{$i} days");
             $key = $d->format('Y-m-d');
             $dayLabel = $this->frenchDay($d->format('D'));
             $amount = $dailySpending[$key] ?? 0;
             $recentDaily[] = ['name' => $dayLabel, 'amount' => $amount];
        }

        // Monthly Trend
        $monthlyTrend = [];
        for ($i = 5; $i >= 0; $i--) {
             $start = $now->modify("first day of -{$i} months")->setTime(0,0,0);
             $end = $now->modify("last day of -{$i} months")->setTime(23,59,59);
             $label = $this->frenchMonth($start->format('M'));
             
             $mIncome = 0;
             $mExpense = 0;
             
             foreach ($transactions as $t) {
                 if ($t->currency() !== $requestedCurrency) {
                     continue;
                 }
                 if ($t->date() >= $start && $t->date() <= $end) {
                      if ($t->type() === TransactionType::INCOME) $mIncome += $t->amount();
                      else $mExpense += $t->amount();
                 }
             }
             $monthlyTrend[] = [
                 'name' => $label, 
                 'income' => $mIncome, 
                 'expenses' => $mExpense
             ];
        }

        return response()->json([
            'currency' => $requestedCurrency,
            'availableCurrencies' => $availableCurrencies,
            'currentIncome' => $currentIncome,
            'currentExpenses' => $currentExpenses,
            'incomeTrend' => round($incomeTrend, 1),
            'expenseTrend' => round($expenseTrend, 1),
            'transactionCount' => $transactionCount,
            'monthlyTrend' => $monthlyTrend,
            'expensesByCategory' => $formattedExpensesByCategory,
            'dailySpending' => $recentDaily
        ]);
    }

    private function frenchDay(string $day): string {
        $map = ['Mon' => 'Lun', 'Tue' => 'Mar', 'Wed' => 'Mer', 'Thu' => 'Jeu', 'Fri' => 'Ven', 'Sat' => 'Sam', 'Sun' => 'Dim'];
        return $map[$day] ?? $day;
    }

    private function frenchMonth(string $month): string {
        $map = [
            'Jan' => 'Jan', 'Feb' => 'Fév', 'Mar' => 'Mar', 'Apr' => 'Avr', 'May' => 'Mai', 'Jun' => 'Juin',
            'Jul' => 'Juil', 'Aug' => 'Août', 'Sep' => 'Sep', 'Oct' => 'Oct', 'Nov' => 'Nov', 'Dec' => 'Déc'
        ];
        return $map[$month] ?? $month;
    }
}
