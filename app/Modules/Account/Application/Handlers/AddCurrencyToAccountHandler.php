<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Handlers;

use App\Modules\Account\Application\Commands\AddCurrencyToAccountCommand;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Account\Domain\ValueObjects\Balance;
use InvalidArgumentException;

final class AddCurrencyToAccountHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $repository
    ) {
    }

    public function handle(AddCurrencyToAccountCommand $command): void
    {
        // 1. Find Account
        $account = $this->repository->findById($command->accountId, $command->userId);

        if ($account === null) {
            throw new InvalidArgumentException('Account not found');
        }

        // 2. Add Balance
        $account->addBalance(new Balance(
            currencyCode: $command->currencyCode,
            amount: $command->initialBalance
        ));

        // 3. Save
        $this->repository->save($account);
    }
}
