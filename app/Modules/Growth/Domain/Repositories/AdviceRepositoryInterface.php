<?php

declare(strict_types=1);

namespace App\Modules\Growth\Domain\Repositories;

use App\Modules\Growth\Domain\Entities\Advice;

interface AdviceRepositoryInterface
{
    public function findAll(): array;
    public function findById(string $id): ?Advice;
    public function save(Advice $advice): void;
    public function delete(string $id): void;
}
