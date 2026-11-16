<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Handlers;

use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use App\Modules\Transaction\Application\Commands\CreateTransactionCommand;
use App\Modules\Transaction\Application\Exceptions\TransactionIdempotencyConflict;
use App\Modules\Transaction\Domain\Entities\Transaction;
use App\Modules\Transaction\Domain\Events\TransactionCreated;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use DomainException;
use Illuminate\Support\Facades\DB;
use Ramsey\Uuid\Uuid;
use Throwable;

class CreateTransactionHandler
{
    public function __construct(
        private readonly TransactionRepositoryInterface $transactionRepository,
        private readonly BudgetRepositoryInterface $budgetRepository,
        private readonly AccountRepositoryInterface $accountRepository,
        private readonly CategoryRepositoryInterface $categoryRepository,
    ) {}

    public function handle(CreateTransactionCommand $command): string
    {
        return DB::transaction(function () use ($command): string {
            // Serialize this user's creates, including requests for different wallets in the same budget.
            $user = DB::table('users')->where('id', $command->userId)->lockForUpdate()->first(['id']);
            if ($user === null) {
                throw new DomainException('Account owner not found');
            }

            $submission = [];
            if ($command->idempotencyKey !== null) {
                $submission = [
                    'user_id' => $command->userId,
                    'key_hash' => hash('sha256', $command->idempotencyKey),
                ];
                $requestHash = $this->requestHash($command);
                $saved = DB::table('transaction_idempotency_keys')->where($submission)->first();

                if ($saved !== null) {
                    if ($saved->request_hash !== $requestHash) {
                        throw new TransactionIdempotencyConflict;
                    }

                    return $saved->transaction_id;
                }

                $submission['request_hash'] = $requestHash;
            }

            $transaction = $this->createTransaction($command);
            $transactionId = $transaction->id()->toString();

            if ($submission !== []) {
                DB::table('transaction_idempotency_keys')->insert([
                    ...$submission,
                    'transaction_id' => $transactionId,
                ]);
            }

            DB::afterCommit(static function () use ($transaction): void {
                try {
                    TransactionCreated::dispatch(
                        $transaction->id(),
                        $transaction->userId(),
                        $transaction->amount(),
                        $transaction->categoryId(),
                        $transaction->type(),
                        $transaction->date(),
                    );
                } catch (Throwable $exception) {
                    // A failed listener must not turn a committed write into a failed response.
                    report($exception);
                }
            });

            return $transactionId;
        }, 3);
    }

    private function requestHash(CreateTransactionCommand $command): string
    {
        return hash('sha256', json_encode([
            $command->accountId,
            $command->categoryId,
            $command->amount,
            $command->currency,
            $command->type->value,
            $command->description,
            $command->date->format('Y-m-d H:i:s'),
        ], JSON_THROW_ON_ERROR));
    }

    private function createTransaction(CreateTransactionCommand $command): Transaction
    {
        $account = $this->accountRepository->findById(Uuid::fromString($command->accountId), $command->userId);
        if ($account === null) {
            throw new DomainException('Account not found');
        }

        $category = $this->categoryRepository->findById(Uuid::fromString($command->categoryId), $command->userId);
        if ($category === null) {
            throw new DomainException('Category not found');
        }

        if ($command->type === TransactionType::EXPENSE) {
            $this->checkBudget($command);
            $account->withdraw($command->amount, $command->currency);
        } else {
            $account->deposit($command->amount, $command->currency);
        }
        $this->accountRepository->save($account);

        $transaction = Transaction::create(
            id: Uuid::uuid4(),
            userId: $command->userId,
            accountId: $command->accountId,
            categoryId: $command->categoryId,
            amount: $command->amount,
            currency: $command->currency,
            type: $command->type,
            description: $command->description,
            date: $command->date,
        );
        $this->transactionRepository->save($transaction);

        return $transaction;
    }

    private function checkBudget(CreateTransactionCommand $command): void
    {
        $budget = $this->budgetRepository->findByCategoryAndCurrency(
            $command->userId,
            $command->categoryId,
            $command->currency,
        );
        if ($budget === null) {
            return;
        }

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
        $spent = $this->transactionRepository->getSpentAmountForCategory(
            $command->userId,
            $command->categoryId,
            $startDate,
            $endDate,
            $command->currency,
        );

        if (($spent + $command->amount) > $budget->amount()) {
            throw new DomainException("Budget exceeded for this category ({$budget->period()->value}). Limit: {$budget->amount()}, Spent so far: {$spent}, New: {$command->amount}");
        }
    }
}
