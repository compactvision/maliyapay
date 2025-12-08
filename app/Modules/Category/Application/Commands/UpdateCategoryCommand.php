<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Commands;

use Ramsey\Uuid\UuidInterface;

/**
 * UpdateCategoryCommand
 * 
 * Command to update an existing category
 */
final class UpdateCategoryCommand
{
    public function __construct(
        public readonly UuidInterface $id,
        public readonly string $name,
        public readonly string $type,
        public readonly string $color,
        public readonly string $userId
    ) {
    }
}
