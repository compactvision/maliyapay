<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Queries;

use Ramsey\Uuid\UuidInterface;

/**
 * GetCategoryByIdQuery
 * 
 * Query to get a single category by ID
 */
final class GetCategoryByIdQuery
{
    public function __construct(
        public readonly UuidInterface $id,
        public readonly UuidInterface $userId
    ) {
    }
}
