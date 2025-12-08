<?php

declare(strict_types=1);

namespace App\Modules\Account\Application\Handlers;

use App\Modules\Account\Application\Queries\GetAccountByIdQuery;
use App\Modules\Account\Domain\Entities\Account;
use App\Modules\Account\Domain\Repositories\AccountRepositoryInterface;

final class GetAccountByIdHandler
{
    public function __construct(
        private readonly AccountRepositoryInterface $repository
    ) {
    }

    public function handle(GetAccountByIdQuery $query): ?Account
    {
        return $this->repository->findById($query->id, $query->userId);
    }
}
