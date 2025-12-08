<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Handlers;

use App\Modules\Category\Application\Commands\UpdateCategoryCommand;
use App\Modules\Category\Application\DTOs\CategoryDTO;
use App\Modules\Category\Domain\Events\CategoryUpdated;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use App\Modules\Category\Domain\ValueObjects\CategoryColor;
use App\Modules\Category\Domain\ValueObjects\CategoryName;
use App\Modules\Category\Domain\ValueObjects\CategoryType;
use Illuminate\Support\Facades\Event;
use InvalidArgumentException;

/**
 * UpdateCategoryHandler
 * 
 * Handles updating an existing category
 */
final class UpdateCategoryHandler
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repository
    ) {
    }

    public function handle(UpdateCategoryCommand $command): CategoryDTO
    {
        // Find existing category
        $category = $this->repository->findById($command->id, $command->userId);

        if ($category === null) {
            throw new InvalidArgumentException('Category not found');
        }

        // Check if new name conflicts with another category
        if ($this->repository->existsByName($command->name, $command->userId, $command->id)) {
            throw new InvalidArgumentException('A category with this name already exists');
        }

        // Create value objects
        $name = CategoryName::fromString($command->name);
        $type = CategoryType::fromString($command->type);
        $color = CategoryColor::fromString($command->color);

        // Update entity
        $category->update($name, $type, $color);

        // Persist
        $this->repository->save($category);

        // Dispatch domain event
        Event::dispatch(CategoryUpdated::create(
            categoryId: $category->id(),
            name: $category->name()->value(),
            type: $category->type()->value(),
            color: $category->color()->value(),
            userId: $category->userId()
        ));

        // Return DTO
        return CategoryDTO::fromEntity($category);
    }
}
