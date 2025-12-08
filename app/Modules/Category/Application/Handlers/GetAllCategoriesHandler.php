<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Handlers;

use App\Modules\Category\Application\DTOs\CategoryDTO;
use App\Modules\Category\Application\Queries\GetAllCategoriesQuery;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;

/**
 * GetAllCategoriesHandler
 * 
 * Handles retrieving all categories for a user
 */
final class GetAllCategoriesHandler
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repository
    ) {
    }

    /**
     * @return CategoryDTO[]
     */
    public function handle(GetAllCategoriesQuery $query): array
    {
        $categories = $this->repository->findAllByUser($query->userId);

        return array_map(
            fn($category) => CategoryDTO::fromEntity($category),
            $categories
        );
    }
}
