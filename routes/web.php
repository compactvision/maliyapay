<?php

use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

// Public routes (no auth required)
Route::get('/login', [PageController::class, 'auth'])->name('login');
Route::get('/register', [PageController::class, 'auth'])->name('register');
Route::get('/verify-email', [PageController::class, 'verifyEmail'])->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', [\App\Modules\Identity\Presentation\Controllers\AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');
Route::get('/forgot-password', [PageController::class, 'forgotPassword'])->name('password.request');
Route::get('/reset-password/{token}', [PageController::class, 'resetPassword'])->name('password.reset');


// Protected routes (auth required via Sanctum)
// Protected routes (auth required via Sanctum)
Route::get('/', [PageController::class, 'dashboard'])->middleware(['feature.enabled:dashboard', 'permission:view dashboard'])->name('home');
Route::get('/account', [PageController::class, 'account'])->middleware(['feature.enabled:accounts', 'permission:view accounts'])->name('account');
Route::get('/transaction', [PageController::class, 'transaction'])->middleware(['feature.enabled:transactions', 'permission:view transactions'])->name('transaction');
Route::get('/category', [PageController::class, 'category'])->middleware(['feature.enabled:categories', 'permission:view categories'])->name('category');
Route::get('/budget', [PageController::class, 'budget'])->middleware(['feature.enabled:budgets', 'permission:view budgets'])->name('budget');
Route::get('/statistic', [PageController::class, 'statistic'])->middleware(['feature.enabled:statistics', 'permission:view statistics'])->name('statistic');
Route::get('/task', [PageController::class, 'task'])->middleware(['feature.enabled:tasks', 'permission:view tasks'])->name('task');
Route::get('/routine', [PageController::class, 'routine'])->middleware(['feature.enabled:routines', 'permission:view routines'])->name('routine');
Route::get('/notification', [PageController::class, 'notification'])->middleware('permission:view notifications')->name('notification');
Route::group(['middleware' => ['auth:sanctum', 'verified', 'feature.enabled:performance', 'permission:view habit-performance']], function () {
    Route::get('/habits', [\App\Modules\HabitPerformance\Presentation\Controllers\HabitPerformanceController::class, 'index'])->name('habit-performance.index');
    Route::post('/habits/bonus', [\App\Modules\HabitPerformance\Presentation\Controllers\HabitPerformanceController::class, 'claimBonus'])->middleware('permission:manage habit-performance')->name('habit-performance.bonus');
    Route::post('/habits/shop', [\App\Modules\HabitPerformance\Presentation\Controllers\HabitPerformanceController::class, 'purchaseReward'])->middleware('permission:manage habit-performance')->name('habit-performance.shop');
});
Route::patch('/profile', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'update'])
    ->middleware(['auth:sanctum', 'permission:view settings']) // Users should edit their own profile
    ->name('profile.update');

Route::patch('/password', [\App\Http\Controllers\Settings\PasswordController::class, 'update'])
    ->middleware(['auth:sanctum', 'permission:edit settings'])
    ->name('profile.password.update');





// Admin Routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Settings
    Route::get('/settings', [\App\Modules\Settings\Presentation\Controllers\MaliyaSettingsController::class, 'index'])->middleware('permission:view settings')->name('admin.settings.index');
    Route::post('/settings', [\App\Modules\Settings\Presentation\Controllers\MaliyaSettingsController::class, 'update'])->middleware('permission:edit settings')->name('admin.settings.update');

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
});

require __DIR__.'/settings.php';
