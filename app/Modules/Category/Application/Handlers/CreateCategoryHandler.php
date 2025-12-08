<?php

declare(strict_types=1);

namespace App\Modules\Category\Application\Handlers;

use App\Modules\Category\Application\Commands\CreateCategoryCommand;
use App\Modules\Category\Application\DTOs\CategoryDTO;
use App\Modules\Category\Domain\Entities\Category;
use App\Modules\Category\Domain\Events\CategoryCreated;
use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use App\Modules\Category\Domain\ValueObjects\CategoryColor;
use App\Modules\Category\Domain\ValueObjects\CategoryName;
use App\Modules\Category\Domain\ValueObjects\CategoryType;
use Illuminate\Support\Facades\Event;
use InvalidArgumentException;

/**
 * CreateCategoryHandler
 * 
 * Handles the creation of a new category
 */
final class CreateCategoryHandler
{
    public function __construct(
        private readonly CategoryRepositoryInterface $repository
    ) {
    }

    public function handle(CreateCategoryCommand $command): CategoryDTO
    {
        // Check if category name already exists for this user
        if ($this->repository->existsByName($command->name, $command->userId)) {
            throw new InvalidArgumentException('A category with this name already exists');
        }

        // Create value objects
        $name = CategoryName::fromString($command->name);
        $type = CategoryType::fromString($command->type);
        $color = CategoryColor::fromString($command->color);

        // Create domain entity
        $category = Category::create(
            id: $command->id,
            name: $name,
            type: $type,
            color: $color,
            userId: $command->userId
        );

        // Persist
        $this->repository->save($category);

        // Dispatch domain event
        Event::dispatch(CategoryCreated::create(
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
