<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Handlers;

use App\Modules\Account\Application\Commands\DeleteAccountCommand;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use DomainException;

final class DeleteAccountHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $repository
    ) {
    }

    public function handle(DeleteAccountCommand $command): void
    {
        $account = $this->repository->findById($command->accountId, $command->userId);

        if (!$account) {
            throw new DomainException("Compte non trouvé.");
        }

        $nonZeroBalances = [];
        foreach ($account->balances() as $balance) {
            if ($balance->amount() > 0) {
                $nonZeroBalances[] = "{$balance->amount()} {$balance->currencyCode()}";
            }
        }

        if (!empty($nonZeroBalances)) {
            $balancesString = implode(', ', $nonZeroBalances);
            throw new DomainException("Le compte doit être vidé avant d'être supprimé. Soldes restants : {$balancesString}");
        }

        $this->repository->delete($account);
    }
}
