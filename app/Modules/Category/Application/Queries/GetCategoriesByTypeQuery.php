<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Queries;

use Ramsey\Uuid\UuidInterface;

/**
 * GetCategoriesByTypeQuery
 * 
 * Query to get categories filtered by type
 */
final class GetCategoriesByTypeQuery
{
    public function __construct(
        public readonly string $type,
        public readonly UuidInterface $userId
    ) {
    }
}
