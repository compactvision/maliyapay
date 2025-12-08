<?php

declare(strict_types=1);

namespace App\Modules\Budget\Application\Handlers;

use App\Modules\Budget\Application\Commands\DeleteBudgetCommand;
use App\Modules\Budget\Domain\Repositories\BudgetRepositoryInterface;

final class DeleteBudgetHandler
{
    public function __construct(
        private readonly BudgetRepositoryInterface $repository
    ) {
    }

    public function handle(DeleteBudgetCommand $command): void
    {
        $this->repository->delete($command->id);
    }
}
