<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Repositories;

use App\Modules\Growth\Domain\Entities\RoutineKit;

interface RoutineKitRepositoryInterface
{
    public function findAll(): array;
    public function findById(string $id): ?RoutineKit;
    public function save(RoutineKit $kit): void;
    public function delete(string $id): void;
}
