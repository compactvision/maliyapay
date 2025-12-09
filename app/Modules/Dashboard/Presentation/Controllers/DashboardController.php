<?php

declare(strict_types=1);

namespace App\Modules\Dashboard\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AccountRepositoryInterface $accountRepository,
        private readonly TransactionRepositoryInterface $transactionRepository
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $userId = (string) auth()->id();

        // 1. Get Accounts with Balances
        $accounts = $this->accountRepository->findAllByUser($userId);
        
        $accountsData = array_map(fn($acc) => [
            'id' => $acc->id()->toString(),
            'name' => $acc->name(),
            'type' => $acc->type()->value, // Assuming AccountType is Enum or VO with value
            'color' => $acc->color(),
            'balances' => array_map(fn($bal) => [
                'currency' => $bal->currencyCode(),
                'amount' => $bal->amount(),
            ], $acc->balances())
        ], $accounts);

        // 2. Get All Transactions to calculate stats and get recent
        // optimizing this would involve specialized repository queries, but reusing existing for now
        $transactions = $this->transactionRepository->findAllByUser($userId);

        // Sort by date desc
        usort($transactions, fn($a, $b) => $b->date() <=> $a->date());

        // Recent 5
        $recent = array_slice($transactions, 0, 5);
        $recentData = array_map(fn($t) => [
            'id' => $t->id()->toString(),
            'description' => $t->description(),
            'amount' => $t->amount(),
            'currency' => $t->currency(),
            'type' => $t->type()->value,
            'date' => $t->date()->format('Y-m-d H:i:s'),
            'category_id' => $t->categoryId(),
        ], $recent);

        // Stats for current month
        $currentMonthStart = new \DateTimeImmutable('first day of this month 00:00:00');
        $currentMonthEnd = new \DateTimeImmutable('last day of this month 23:59:59');

        $income = [];
        $expenses = [];

        foreach ($transactions as $t) {
            if ($t->date() >= $currentMonthStart && $t->date() <= $currentMonthEnd) {
                $currency = $t->currency();
                if (!isset($income[$currency])) $income[$currency] = 0;
                if (!isset($expenses[$currency])) $expenses[$currency] = 0;

                if ($t->type() === TransactionType::INCOME) {
                    $income[$currency] += $t->amount();
                } else {
                    $expenses[$currency] += $t->amount();
                }
            }
        }

        return response()->json([
            'accounts' => $accountsData,
            'recent_transactions' => $recentData,
            'stats' => [
                'income' => $income,
                'expenses' => $expenses,
            ]
        ]);
    }
}
