<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Repositories;

use App\Modules\Growth\Domain\Entities\BusinessModel;

interface BusinessModelRepositoryInterface
{
    public function findAll(): array;
    public function findById(string $id): ?BusinessModel;
    public function save(BusinessModel $model): void;
    public function delete(string $id): void;
}
