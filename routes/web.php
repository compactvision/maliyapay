<?php

use App\Http\Controllers\PageController;
use App\Http\Controllers\PrivacyController;
use Illuminate\Support\Facades\Route;

// Public routes (no auth required)
Route::get('/privacy', [PrivacyController::class, 'show'])->name('privacy');
Route::post('/privacy/requests', [PrivacyController::class, 'store'])
    ->middleware('throttle:5,10')
    ->name('privacy.requests.store');
Route::redirect('/privacy-policy', '/privacy', 301);
Route::get('/login', [PageController::class, 'auth'])->name('login');
Route::get('/register', [PageController::class, 'auth'])->name('register');
Route::get('/verify-email', [PageController::class, 'verifyEmail'])->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
Route::get('/forgot-password', [PageController::class, 'forgotPassword'])->name('password.request');
Route::get('/reset-password/{token}', [PageController::class, 'resetPassword'])->name('password.reset');
Route::view('/api-documentation', 'scribe.index');

// Protected routes (auth required via Sanctum)
Route::group(['middleware' => ['auth']], function () {
    Route::get('/', [PageController::class, 'dashboard'])->middleware(['feature.enabled:dashboard', 'permission:view dashboard'])->name('home');
    Route::get('/account', [PageController::class, 'account'])->middleware(['feature.enabled:accounts', 'permission:view accounts'])->name('account');
    Route::get('/transaction', [PageController::class, 'transaction'])->middleware(['feature.enabled:transactions', 'permission:view transactions'])->name('transaction');
    Route::get('/category', [PageController::class, 'category'])->middleware(['feature.enabled:categories', 'permission:view categories'])->name('category');
    Route::get('/budget', [PageController::class, 'budget'])->middleware(['feature.enabled:budgets', 'permission:view budgets'])->name('budget');
    Route::get('/statistic', [PageController::class, 'statistic'])->middleware(['feature.enabled:statistics', 'permission:view statistics'])->name('statistic');
    Route::get('/task', [PageController::class, 'task'])->middleware(['feature.enabled:tasks', 'permission:view tasks'])->name('task');
    Route::get('/routine', [PageController::class, 'routine'])->middleware(['feature.enabled:routines', 'permission:view routines'])->name('routine');
    Route::get('/notification', [PageController::class, 'notification'])->middleware('permission:view notifications')->name('notification');
    Route::get('/goal', [PageController::class, 'goal'])->name('goal');
    Route::get('/growth', [PageController::class, 'growth'])->middleware(['permission:view tasks'])->name('growth');
    Route::get('/growth/advice/{id}', [\App\Modules\Growth\Presentation\Controllers\GrowthController::class, 'showAdvice'])->name('growth.advice.show');
    Route::get('/growth/business/{businessId}/step/{stepId}', [\App\Modules\Growth\Presentation\Controllers\GrowthController::class, 'showQuestStep'])->name('growth.quest.step.show');

    Route::group(['middleware' => ['verified', 'feature.enabled:performance', 'permission:view habit-performance']], function () {
        Route::get('/habits', [\App\Modules\HabitPerformance\Presentation\Controllers\HabitPerformanceController::class, 'index'])->name('habit-performance.index');
        Route::post('/habits/bonus', [\App\Modules\HabitPerformance\Presentation\Controllers\HabitPerformanceController::class, 'claimBonus'])->middleware('permission:manage habit-performance')->name('habit-performance.bonus');
        Route::post('/habits/shop', [\App\Modules\HabitPerformance\Presentation\Controllers\HabitPerformanceController::class, 'purchaseReward'])->middleware('permission:manage habit-performance')->name('habit-performance.shop');
    });

    Route::get('/profile', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'show'])->middleware('permission:view settings')->name('profile.show');
    Route::patch('/profile', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'update'])
        ->middleware(['permission:view settings']) // Users should edit their own profile
        ->name('profile.update');

    Route::post('/onboarding/complete', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'completeOnboarding'])
        ->name('onboarding.complete');

    Route::patch('/password', [\App\Http\Controllers\Settings\PasswordController::class, 'update'])
        ->middleware(['permission:edit settings'])
        ->name('profile.password.update');

});

// Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Settings
    Route::get('/settings', [\App\Modules\Settings\Presentation\Controllers\MaliyaSettingsController::class, 'index'])->middleware('permission:view settings')->name('admin.settings.index');
    Route::post('/settings', [\App\Modules\Settings\Presentation\Controllers\MaliyaSettingsController::class, 'update'])->middleware('permission:edit settings')->name('admin.settings.update');

    Route::get('/growth', [\App\Http\Controllers\PageController::class, 'adminGrowth'])->name('admin.growth.index');
    Route::get('/growth/config', [\App\Modules\Growth\Presentation\Controllers\GrowthController::class, 'config'])->name('admin.growth.config');
    Route::get('/growth/advice/config', [\App\Modules\Growth\Presentation\Controllers\GrowthController::class, 'adviceConfig'])->name('admin.growth.advice.config');
    Route::get('/growth/kit/config', [\App\Modules\Growth\Presentation\Controllers\GrowthController::class, 'kitConfig'])->name('admin.growth.kit.config');
    Route::get('/growth/business/config', [\App\Modules\Growth\Presentation\Controllers\GrowthController::class, 'businessConfig'])->name('admin.growth.business.config');

    // Roles & Permissions
    Route::middleware('permission:manage roles')->group(function () {
        Route::resource('roles', \App\Modules\Identity\Presentation\Controllers\RoleController::class)->except(['create', 'edit', 'show']);
    });

    Route::middleware('permission:manage permissions')->group(function () {
        Route::resource('permissions', \App\Modules\Identity\Presentation\Controllers\PermissionController::class)->except(['create', 'edit', 'show']);
    });

    // User Management
    Route::middleware('permission:manage users')->group(function () {
        Route::get('/users', [\App\Modules\Identity\Presentation\Controllers\UserManagementController::class, 'index'])->name('admin.users.index');
        Route::post('/users/{user}/roles', [\App\Modules\Identity\Presentation\Controllers\UserManagementController::class, 'assignRole'])->name('admin.users.assign_role');
    });

    // Growth Module Admin
    Route::prefix('growth')->group(function () {
        Route::post('/advices', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'storeAdvice']);
        Route::put('/advices/{id}', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'updateAdvice']);
        Route::delete('/advices/{id}', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'destroyAdvice']);

        Route::post('/routine-kits', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'storeRoutineKit']);
        Route::put('/routine-kits/{id}', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'updateRoutineKit']);
        Route::delete('/routine-kits/{id}', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'destroyRoutineKit']);

        Route::post('/business-models', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'storeBusinessModel']);
        Route::put('/business-models/{id}', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'updateBusinessModel']);
        Route::delete('/business-models/{id}', [\App\Modules\Growth\Presentation\Controllers\AdminGrowthController::class, 'destroyBusinessModel']);
    });
});

require __DIR__.'/settings.php';
