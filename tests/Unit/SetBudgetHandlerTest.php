<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Modules\Budget\Application\Commands\SetBudgetCommand;
use App\Modules\Budget\Application\Handlers\SetBudgetHandler;
use App\Modules\Budget\Domain\Entities\Budget;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use PHPUnit\Framework\TestCase;
use Ramsey\Uuid\UuidInterface;

class SetBudgetHandlerTest extends TestCase
{
    public function test_it_keeps_separate_budgets_for_the_same_category_in_different_currencies(): void
    {
        $repository = new InMemoryBudgetRepository;
        $handler = new SetBudgetHandler($repository);

        $handler->handle(new SetBudgetCommand(
            userId: '1',
            categoryId: 'transport',
            amount: 60,
            currency: 'USD',
            period: 'monthly'
        ));

        $handler->handle(new SetBudgetCommand(
            userId: '1',
            categoryId: 'transport',
            amount: 168000,
            currency: 'CDF',
            period: 'monthly'
        ));

        $budgets = $repository->findAllByUser('1');

        $this->assertCount(2, $budgets);
        $this->assertSame(60.0, $repository->findByCategoryAndCurrency('1', 'transport', 'USD')->amount());
        $this->assertSame(168000.0, $repository->findByCategoryAndCurrency('1', 'transport', 'CDF')->amount());
    }
}

final class InMemoryBudgetRepository implements BudgetRepositoryInterface
{
    /** @var array<string, Budget> */
    private array $budgets = [];

    public function save(Budget $budget): void
    {
        $this->budgets[$budget->id()->toString()] = $budget;
    }

    public function findById(UuidInterface $id): ?Budget
    {
        return $this->budgets[$id->toString()] ?? null;
    }

    public function findByCategory(string $userId, string $categoryId): ?Budget
    {
        foreach ($this->budgets as $budget) {
            if ($budget->userId() === $userId && $budget->categoryId() === $categoryId) {
                return $budget;
            }
        }

        return null;
    }

    public function findByCategoryAndCurrency(string $userId, string $categoryId, string $currency): ?Budget
    {
        foreach ($this->budgets as $budget) {
            if (
                $budget->userId() === $userId &&
                $budget->categoryId() === $categoryId &&
                $budget->currency() === strtoupper($currency)
            ) {
                return $budget;
            }
        }

        return null;
    }

    public function findAllByUser(string $userId): array
    {
        return array_values(array_filter(
            $this->budgets,
            fn (Budget $budget) => $budget->userId() === $userId
        ));
    }

    public function delete(UuidInterface $id): void
    {
        unset($this->budgets[$id->toString()]);
    }
}
