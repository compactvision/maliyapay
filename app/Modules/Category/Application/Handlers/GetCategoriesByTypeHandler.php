<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Handlers;

use App\Modules\Category\Application\DTOs\CategoryDTO;
use App\Modules\Category\Application\Queries\GetCategoriesByTypeQuery;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use App\Modules\Category\Domain\ValueObjects\CategoryType;

/**
 * GetCategoriesByTypeHandler
 * 
 * Handles retrieving categories filtered by type
 */
final class GetCategoriesByTypeHandler
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repository
    ) {
    }

    /**
     * @return CategoryDTO[]
     */
    public function handle(GetCategoriesByTypeQuery $query): array
    {
        $type = CategoryType::fromString($query->type);
        $categories = $this->repository->findByType($type, $query->userId);

        return array_map(
            fn($category) => CategoryDTO::fromEntity($category),
            $categories
        );
    }
}
