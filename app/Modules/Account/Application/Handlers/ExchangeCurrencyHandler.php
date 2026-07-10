<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Handlers;

use App\Modules\Account\Application\Commands\ExchangeCurrencyCommand;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use InvalidArgumentException;

final class ExchangeCurrencyHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $repository
    ) {}

    public function handle(ExchangeCurrencyCommand $command): float
    {
        $account = $this->repository->findById($command->accountId, $command->userId);

        if ($account === null) {
            throw new InvalidArgumentException('Account not found');
        }

        if ($command->fromCurrency === $command->toCurrency) {
            throw new \DomainException('Les deux devises doivent etre differentes.');
        }

        $availableCurrencies = array_map(
            fn ($balance) => $balance->currencyCode(),
            $account->balances()
        );

        if (! in_array($command->fromCurrency, $availableCurrencies, true)) {
            throw new \DomainException('La devise source choisie pour ce portefeuille n\'existe pas.');
        }

        if (! in_array($command->toCurrency, $availableCurrencies, true)) {
            throw new \DomainException('La devise cible choisie pour ce portefeuille n\'existe pas.');
        }

        $convertedAmount = $this->calculateConvertedAmount($command);

        $account->withdraw($command->amount, $command->fromCurrency);
        $account->deposit($convertedAmount, $command->toCurrency);

        $this->repository->save($account);

        return $convertedAmount;
    }

    private function calculateConvertedAmount(ExchangeCurrencyCommand $command): float
    {
        if ($command->fromCurrency === 'USD' && $command->toCurrency === 'CDF') {
            return round($command->amount * $command->rate, 6);
        }

        if ($command->fromCurrency === 'CDF' && $command->toCurrency === 'USD') {
            return round($command->amount / $command->rate, 6);
        }

        return round($command->amount * $command->rate, 6);
    }
}
