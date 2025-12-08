<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Handlers;

use App\Modules\Category\Application\Commands\DeleteCategoryCommand;
use App\Modules\Category\Domain\Events\CategoryDeleted;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use Illuminate\Support\Facades\Event;
use InvalidArgumentException;

/**
 * DeleteCategoryHandler
 * 
 * Handles deleting a category
 */
final class DeleteCategoryHandler
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repository
    ) {
    }

    public function handle(DeleteCategoryCommand $command): void
    {
        // Find existing category
        $category = $this->repository->findById($command->id, $command->userId);

        if ($category === null) {
            throw new InvalidArgumentException('Category not found');
        }

        // Soft delete the category
        $category->delete();

        // Persist
        $this->repository->save($category);

        // Dispatch domain event
        Event::dispatch(CategoryDeleted::create(
            categoryId: $category->id(),
            userId: $category->userId()
        ));
    }
}
