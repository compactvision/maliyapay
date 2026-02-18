<?php

declare(strict_types=1);

namespace App\Modules\Category\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Category\Application\Commands\CreateCategoryCommand;
use App\Modules\Category\Application\Commands\DeleteCategoryCommand;
use App\Modules\Category\Application\Commands\UpdateCategoryCommand;
use App\Modules\Category\Application\Handlers\CreateCategoryHandler;
use App\Modules\Category\Application\Handlers\DeleteCategoryHandler;
use App\Modules\Category\Application\Handlers\GetAllCategoriesHandler;
use App\Modules\Category\Application\Handlers\GetCategoryByIdHandler;
use App\Modules\Category\Application\Handlers\GetCategoriesByTypeHandler;
use App\Modules\Category\Application\Handlers\UpdateCategoryHandler;
use App\Modules\Category\Application\Queries\GetAllCategoriesQuery;
use App\Modules\Category\Application\Queries\GetCategoryByIdQuery;
use App\Modules\Category\Application\Queries\GetCategoriesByTypeQuery;
use App\Modules\Category\Presentation\Requests\CreateCategoryRequest;
use App\Modules\Category\Presentation\Requests\UpdateCategoryRequest;
use App\Modules\Category\Presentation\Resources\CategoryCollection;
use App\Modules\Category\Presentation\Resources\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

/**
 * CategoryController
 * 
 * Thin controller that delegates to application layer handlers
 * Returns JSON responses for API
 */
class CategoryController extends Controller
{
    public function __construct(
        private readonly CreateCategoryHandler $createHandler,
        private readonly UpdateCategoryHandler $updateHandler,
        private readonly DeleteCategoryHandler $deleteHandler,
        private readonly GetCategoryByIdHandler $getByIdHandler,
        private readonly GetAllCategoriesHandler $getAllHandler,
        private readonly GetCategoriesByTypeHandler $getByTypeHandler
    ) {
    }

    /**
     * Get all categories for the authenticated user
     */
    public function index(): JsonResponse
    {
        try {
            $userId = (string) auth()->id();
            $query = new GetAllCategoriesQuery($userId);
            $categories = $this->getAllHandler->handle($query);

            return response()->json(new CategoryCollection($categories));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a single category by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            $categoryId = Uuid::fromString($id);
            $userId = (string) auth()->id();
            $query = new GetCategoryByIdQuery($categoryId, $userId);
            $category = $this->getByIdHandler->handle($query);

            if ($category === null) {
                return response()->json([
                    'message' => 'Category not found',
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json(new CategoryResource($category));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve category',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get categories by type
     */
    public function byType(string $type): JsonResponse
    {
        try {
            $userId = (string) auth()->id();
            $query = new GetCategoriesByTypeQuery($type, $userId);
            $categories = $this->getByTypeHandler->handle($query);

            return response()->json(new CategoryCollection($categories));
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Invalid category type',
                'error' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve categories',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new category
     * 
     * @response 201 {
     *  "id": "550e8400-e29b-41d4-a716-446655440000",
     *  "name": "Courses",
     *  "type": "expense",
     *  "color": "#FF5733",
     *  "created_at": "2024-02-18T14:00:00.000000Z",
     *  "updated_at": "2024-02-18T14:00:00.000000Z"
     * }
     */
    public function store(CreateCategoryRequest $request): JsonResponse
    {
        try {
            $command = new CreateCategoryCommand(
                id: Uuid::uuid4(),
                name: $request->input('name'),
                type: $request->input('type'),
                color: $request->input('color'),
                userId: (string) auth()->id()
            );

            $category = $this->createHandler->handle($command);

            return response()->json(
                new CategoryResource($category),
                Response::HTTP_CREATED
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'error' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create category',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update an existing category
     * 
     * @response 200 {
     *  "id": "550e8400-e29b-41d4-a716-446655440000",
     *  "name": "Courses Alimentaires",
     *  "type": "expense",
     *  "color": "#FF5733",
     *  "created_at": "2024-02-18T14:00:00.000000Z",
     *  "updated_at": "2024-02-18T14:05:00.000000Z"
     * }
     */
    public function update(UpdateCategoryRequest $request, string $id): JsonResponse
    {
        try {
            $command = new UpdateCategoryCommand(
                id: Uuid::fromString($id),
                name: $request->input('name'),
                type: $request->input('type'),
                color: $request->input('color'),
                userId: (string) auth()->id()
            );

            $category = $this->updateHandler->handle($command);

            return response()->json(new CategoryResource($category));
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'error' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update category',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete a category
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $command = new DeleteCategoryCommand(
                id: Uuid::fromString($id),
                userId: (string) auth()->id()
            );

            $this->deleteHandler->handle($command);

            return response()->json([
                'message' => 'Category deleted successfully',
            ], Response::HTTP_OK);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => 'Category not found',
                'error' => $e->getMessage(),
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete category',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
