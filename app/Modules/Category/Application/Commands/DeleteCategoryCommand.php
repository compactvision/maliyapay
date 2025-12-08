<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Commands;

use Ramsey\Uuid\UuidInterface;

/**
 * DeleteCategoryCommand
 * 
 * Command to delete a category
 */
final class DeleteCategoryCommand
{
    public function __construct(
        public readonly UuidInterface $id,
        public readonly string $userId
    ) {
    }
}
