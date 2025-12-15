<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Handlers;

use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Transaction\Application\Commands\CreateTransactionCommand;
use App\Modules\Transaction\Domain\Entities\Transaction;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use DateTimeImmutable;
use Exception;
use Ramsey\Uuid\Uuid;

class CreateTransactionHandler
{
    public function __construct(
        private readonly TransactionRepositoryInterface $transactionRepository,
        private readonly BudgetRepositoryInterface $budgetRepository,
        private readonly AccountRepositoryInterface $accountRepository
    ) {
    }

    public function handle(CreateTransactionCommand $command): void
    {
        // 1. Business Logic: Budget Check (for Expenses)
        if ($command->type === TransactionType::EXPENSE) {
            $budget = $this->budgetRepository->findByCategory($command->userId, $command->categoryId);

            if ($budget) {
                // Calculate period dates
                $startDate = match ($budget->period()->value) {
                    'daily' => $command->date->setTime(0, 0, 0),
                    'weekly' => $command->date->modify('monday this week')->setTime(0, 0, 0),
                    'monthly' => $command->date->modify('first day of this month')->setTime(0, 0, 0),
                };
                
                $endDate = match ($budget->period()->value) {
                    'daily' => $command->date->setTime(23, 59, 59),
                    'weekly' => $command->date->modify('sunday this week')->setTime(23, 59, 59),
                    'monthly' => $command->date->modify('last day of this month')->setTime(23, 59, 59),
                };

                // Get current spent amount
                $spent = $this->transactionRepository->getSpentAmountForCategory(
                    $command->userId,
                    $command->categoryId,
                    $startDate,
                    $endDate
                );

                if (($spent + $command->amount) > $budget->amount()) {
                    throw new Exception("Budget exceeded for this category ({$budget->period()->value}). Limit: {$budget->amount()}, Spent so far: {$spent}, New: {$command->amount}");
                }
            }
        }

        // 2. Account Update
        $account = $this->accountRepository->findById(Uuid::fromString($command->accountId), $command->userId);
        if (!$account) {
            throw new Exception("Account not found");
        }

        if ($command->type === TransactionType::EXPENSE) {
            $account->withdraw($command->amount, $command->currency);
        } else {
            $account->deposit($command->amount, $command->currency);
        }
        $this->accountRepository->save($account);

        // 3. Create & Save Transaction
        $transaction = Transaction::create(
            id: Uuid::uuid4(),
            userId: $command->userId,
            accountId: $command->accountId,
            categoryId: $command->categoryId,
            amount: $command->amount,
            currency: $command->currency,
            type: $command->type,
            description: $command->description,
            date: $command->date
        );

        $this->transactionRepository->save($transaction);

        \App\Modules\Transaction\Domain\Events\TransactionCreated::dispatch(
            $transaction->id(),
            $transaction->userId(),
            $transaction->amount(),
            $transaction->categoryId(),
            $transaction->type(),
            $transaction->date()
        );
    }
}
