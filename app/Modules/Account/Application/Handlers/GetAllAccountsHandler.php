<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Handlers;

use App\Modules\Account\Application\Queries\GetAllAccountsQuery;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;

final class GetAllAccountsHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $repository
    ) {
    }

    public function handle(GetAllAccountsQuery $query): array
    {
        return $this->repository->findAllByUser($query->userId);
    }
}
