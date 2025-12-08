<?php

declare(strict_types=1);

namespace App\Modules\Identity;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * IdentityServiceProvider
 * 
 * Registers routes for the Identity module
 */
class IdentityServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerRoutes();
    }

    /**
     * Register module routes
     */
    protected function registerRoutes(): void
    {
        // Public routes (no auth required)
        Route::middleware(['api'])
            ->prefix('api/auth')
            ->group(function () {
                Route::post('/register', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'register']);
                Route::post('/login', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'login']);
                Route::post('/forgot-password', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'forgotPassword']);
                Route::post('/reset-password', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'resetPassword']);
            });

        // Protected routes (auth required)
        Route::middleware(['api', 'auth:sanctum'])
            ->prefix('api/auth')
            ->group(function () {
                Route::post('/logout', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'logout']);
                Route::get('/user', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'user']);
                Route::put('/profile', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'updateProfile']);
                Route::post('/password', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'changePassword']);
                
                // Email verification notification (requires auth)
                Route::post('/email/verification-notification', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'sendVerificationEmail'])
                    ->middleware('throttle:6,1');
            });
    }
}
