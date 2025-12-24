<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Repositories;

use App\Modules\Growth\Domain\Entities\UserBusinessProgress;

interface UserBusinessProgressRepositoryInterface
{
    public function findByUserId(int $userId): array;
    public function findByUserAndModel(int $userId, string $businessModelId): ?UserBusinessProgress;
    public function save(UserBusinessProgress $progress): void;
}
