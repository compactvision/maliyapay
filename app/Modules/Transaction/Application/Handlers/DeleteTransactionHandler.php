<?php

declare(strict_types=1);

namespace App\Modules\Transaction\Application\Handlers;

use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Transaction\Application\Commands\DeleteTransactionCommand;
use App\Modules\Transaction\Domain\Repositories\TransactionRepositoryInterface;
use App\Modules\Transaction\Domain\ValueObjects\TransactionType;
use Exception;
use Ramsey\Uuid\Uuid;

class DeleteTransactionHandler
{
    public function __construct(
        private readonly TransactionRepositoryInterface $transactionRepository,
        private readonly AccountRepositoryInterface $accountRepository
    ) {
    }

    public function handle(DeleteTransactionCommand $command): void
    {
        $transaction = $this->transactionRepository->findById($command->transactionId, $command->userId);

        if (!$transaction) {
            throw new Exception("Transaction not found");
        }

        // Logic to reverse the transaction effect on account balance
        $account = $this->accountRepository->findById(Uuid::fromString($transaction->accountId()), $command->userId);

        if ($account) {
            $currencyCode = $transaction->currency();
            $amount = $transaction->amount();
            
            // Note: We access balances directly if exposed, or use domain methods. 
            // Assuming Account entity exposes balances or we manipulate it via Domain Method if exists.
            // Since I don't see Account Entity, I will assume standard property or method.
            // Let's assume we fetch the specific balance VO or entity part.
            // Actually, best practice is account->deposit/withdraw. 
            // Reversal of Income -> Withdraw. Reversal of Expense -> Deposit.
            
            if ($transaction->type() === TransactionType::INCOME) {
                $account->withdraw($amount, $currencyCode);
            } else {
                $account->deposit($amount, $currencyCode);
            }

            $this->accountRepository->save($account);
        }

        $this->transactionRepository->delete($transaction);
    }
}
