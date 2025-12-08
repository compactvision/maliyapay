<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Handlers;

use App\Modules\Account\Application\Commands\CreateAccountCommand;
use App\Modules\Account\Domain\Entities\Account;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Account\Domain\ValueObjects\AccountType;
use App\Modules\Account\Domain\ValueObjects\Balance;

final class CreateAccountHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $repository
    ) {
    }

    public function handle(CreateAccountCommand $command): void
    {
        // 1. Create Account Entity
        $account = Account::create(
            id: $command->id,
            userId: $command->userId,
            name: $command->name,
            type: AccountType::fromString($command->type),
            color: $command->color
        );

        // 2. Add initial currency if provided
        if ($command->initialCurrency !== null) {
            $account->addBalance(new Balance(
                currencyCode: $command->initialCurrency,
                amount: $command->initialBalance ?? 0.0
            ));
        }

        // 3. Save
        $this->repository->save($account);
    }
}
