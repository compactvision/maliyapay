<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Modules\Account\Application\Commands\ExchangeCurrencyCommand;
use App\Modules\Account\Application\Handlers\ExchangeCurrencyHandler;
use App\Modules\Account\Domain\Entities\Account;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;
use App\Modules\Account\Domain\ValueObjects\AccountType;
use App\Modules\Account\Domain\ValueObjects\Balance;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class ExchangeCurrencyHandlerTest extends TestCase
{
    public function test_it_debits_source_currency_and_credits_target_currency(): void
    {
        $accountId = Uuid::uuid4();
        $account = Account::reconstitute(
            id: $accountId,
            userId: '1',
            name: 'Cash',
            type: AccountType::CASH,
            color: '#10B981',
            isArchived: false,
            balances: [
                new Balance('USD', 100),
                new Balance('CDF', 0),
            ],
            createdAt: new DateTimeImmutable,
            updatedAt: new DateTimeImmutable
        );
        $repository = new InMemoryExchangeAccountRepository($account);
        $handler = new ExchangeCurrencyHandler($repository);

        $convertedAmount = $handler->handle(new ExchangeCurrencyCommand(
            accountId: $accountId,
            userId: '1',
            fromCurrency: 'USD',
            toCurrency: 'CDF',
            amount: 10,
            rate: 2250
        ));

        $this->assertSame(22500.0, $convertedAmount);
        $this->assertSame(90.0, $repository->savedAccount->balances()[0]->amount());
        $this->assertSame(22500.0, $repository->savedAccount->balances()[1]->amount());
    }

    public function test_it_divides_by_market_rate_when_exchanging_cdf_to_usd(): void
    {
        $accountId = Uuid::uuid4();
        $account = Account::reconstitute(
            id: $accountId,
            userId: '1',
            name: 'Cash',
            type: AccountType::CASH,
            color: '#10B981',
            isArchived: false,
            balances: [
                new Balance('USD', 0),
                new Balance('CDF', 24000),
            ],
            createdAt: new DateTimeImmutable,
            updatedAt: new DateTimeImmutable
        );
        $repository = new InMemoryExchangeAccountRepository($account);
        $handler = new ExchangeCurrencyHandler($repository);

        $convertedAmount = $handler->handle(new ExchangeCurrencyCommand(
            accountId: $accountId,
            userId: '1',
            fromCurrency: 'CDF',
            toCurrency: 'USD',
            amount: 24000,
            rate: 2400
        ));

        $this->assertSame(10.0, $convertedAmount);
        $this->assertSame(10.0, $repository->savedAccount->balances()[0]->amount());
        $this->assertSame(0.0, $repository->savedAccount->balances()[1]->amount());
    }
}

final class InMemoryExchangeAccountRepository implements AccountRepositoryInterface
{
    public Account $savedAccount;

    public function __construct(private readonly Account $account) {}

    public function save(Account $account): void
    {
        $this->savedAccount = $account;
    }

    public function findById(UuidInterface $id, string $userId): ?Account
    {
        if ($this->account->id()->equals($id) && $this->account->userId() === $userId) {
            return $this->account;
        }

        return null;
    }

    public function findAllByUser(string $userId): array
    {
        return $this->account->userId() === $userId ? [$this->account] : [];
    }

    public function delete(Account $account): void {}
}
