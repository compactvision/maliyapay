<?php

declare(strict_types=1);

namespace App\Modules\Budget\Application\Commands;

use Ramsey\Uuid\UuidInterface;

final class DeleteBudgetCommand
{
    public function __construct(
        public readonly UuidInterface $id
    ) {
    }
}
