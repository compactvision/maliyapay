<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Queries;

use Ramsey\Uuid\UuidInterface;

/**
 * GetAllCategoriesQuery
 * 
 * Query to get all categories for a user
 */
final class GetAllCategoriesQuery
{
    public function __construct(
        public readonly UuidInterface $userId
    ) {
    }
}
