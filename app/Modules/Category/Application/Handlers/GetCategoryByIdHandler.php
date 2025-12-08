<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Handlers;

use App\Modules\Category\Application\DTOs\CategoryDTO;
use App\Modules\Category\Application\Queries\GetCategoryByIdQuery;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;

/**
 * GetCategoryByIdHandler
 * 
 * Handles retrieving a single category by ID
 */
final class GetCategoryByIdHandler
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repository
    ) {
    }

    public function handle(GetCategoryByIdQuery $query): ?CategoryDTO
    {
        $category = $this->repository->findById($query->id, $query->userId);

        return $category ? CategoryDTO::fromEntity($category) : null;
    }
}
