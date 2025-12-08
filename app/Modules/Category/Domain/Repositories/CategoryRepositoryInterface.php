<?php

declare(strict_types=1);

namespace App\Modules\Category\Domain\Repositories;

use App\Modules\Category\Domain\Entities\Category;
use App\Modules\Category\Domain\ValueObjects\CategoryType;
use Ramsey\Uuid\UuidInterface;

/**
 * CategoryRepositoryInterface
 * 
 * Defines the contract for category persistence
 * Implementation will be in Infrastructure layer
 */
interface CategoryRepositoryInterface
{
    /**
     * Find a category by ID for a specific user
     */
    public function findById(UuidInterface $id, string $userId): ?Category;

    /**
     * Find all categories for a user
     * 
     * @return Category[]
     */
    public function findAllByUser(string $userId): array;

    /**
     * Find categories by type for a user
     * 
     * @return Category[]
     */
    public function findByType(CategoryType $type, string $userId): array;

    /**
     * Check if a category name already exists for a user
     */
    public function existsByName(string $name, string $userId, ?UuidInterface $excludeId = null): bool;

    /**
     * Save a category
     */
    public function save(Category $category): void;

    /**
     * Delete a category
     */
    public function delete(Category $category): void;

    /**
     * Count categories for a user
     */
    public function countByUser(string $userId): int;

    /**
     * Count categories by type for a user
     */
    public function countByType(CategoryType $type, string $userId): int;
}
