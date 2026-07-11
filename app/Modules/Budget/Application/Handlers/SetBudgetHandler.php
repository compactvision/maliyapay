<?php

declare(strict_types=1);

namespace App\Modules\Budget\Application\Handlers;

use App\Modules\Budget\Application\Commands\SetBudgetCommand;
use App\Modules\Budget\Domain\Entities\Budget;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;
use App\Modules\Budget\Domain\ValueObjects\BudgetPeriod;
use Ramsey\Uuid\Uuid;

final class SetBudgetHandler
{
    public function __construct(
        private readonly BudgetRepositoryInterface $repository
    ) {}

    public function handle(SetBudgetCommand $command): void
    {
        // One budget can exist per category and per currency.
        $existingBudget = $this->repository->findByCategoryAndCurrency(
            $command->userId,
            $command->categoryId,
            $command->currency
        );

        if ($existingBudget) {
            // Update
            $budget = Budget::reconstitute(
                id: $existingBudget->id(),
                userId: $command->userId,
                categoryId: $command->categoryId,
                amount: $command->amount,
                currency: strtoupper($command->currency),
                period: BudgetPeriod::fromString($command->period),
                createdAt: $existingBudget->createdAt(),
                updatedAt: new \DateTimeImmutable
            );
        } else {
            // Create
            $budget = Budget::create(
                id: Uuid::uuid4(),
                userId: $command->userId,
                categoryId: $command->categoryId,
                amount: $command->amount,
                currency: strtoupper($command->currency),
                period: BudgetPeriod::fromString($command->period)
            );
        }

        $this->repository->save($budget);
    }
}
