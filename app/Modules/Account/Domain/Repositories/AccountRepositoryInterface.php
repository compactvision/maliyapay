<?php

declare(strict_types=1);

namespace App\Modules\Account\Domain\Repositories;

use App\Modules\Account\Domain\Entities\Account;
use Ramsey\Uuid\UuidInterface;

interface AccountRepositoryInterface
{
    public function save(Account $account): void;

    public function findById(UuidInterface $id, string $userId): ?Account;

    /**
     * @return Account[]
     */
    public function findAllByUser(string $userId): array;

    public function delete(Account $account): void;
}
