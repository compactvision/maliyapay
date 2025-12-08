<?php

declare(strict_types=1);

namespace App\Modules\Category;

use App\Modules\Category\Domain\Repositories\CategoryRepositoryInterface;
use App\Modules\Category\Infrastructure\Models\Category;
use App\Modules\Category\Infrastructure\Repositories\EloquentCategoryRepository;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * CategoryServiceProvider
 * 
 * Registers bindings and routes for the Category module
 */
class CategoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind repository interface to implementation
        $this->app->bind(
            CategoryRepositoryInterface::class,
            function ($app) {
                return new EloquentCategoryRepository(new Category());
            }
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register routes
        $this->registerRoutes();
    }

    /**
     * Register module routes
     */
    protected function registerRoutes(): void
    {
        Route::middleware(['api', 'auth:sanctum'])
            ->prefix('api/categories')
            ->group(function () {
                Route::get('/', [\App\Modules\Category\Presentation\Controllers\CategoryController::class, 'index']);
                Route::get('/type/{type}', [\App\Modules\Category\Presentation\Controllers\CategoryController::class, 'byType']);
                Route::get('/{id}', [\App\Modules\Category\Presentation\Controllers\CategoryController::class, 'show']);
                Route::post('/', [\App\Modules\Category\Presentation\Controllers\CategoryController::class, 'store']);
                Route::put('/{id}', [\App\Modules\Category\Presentation\Controllers\CategoryController::class, 'update']);
                Route::delete('/{id}', [\App\Modules\Category\Presentation\Controllers\CategoryController::class, 'destroy']);
            });
    }
}
