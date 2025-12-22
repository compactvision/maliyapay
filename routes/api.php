<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Modules\Category\Presentation\Controllers\CategoryController;
use App\Modules\Account\Presentation\Controllers\AccountController;
use App\Modules\Identity\Presentation\Controllers\AuthController;
use App\Modules\Identity\Presentation\Controllers\PinController;
use App\Modules\Budget\Presentation\Controllers\BudgetController;
use App\Modules\Transaction\Presentation\Controllers\TransactionController;
use App\Modules\Task\Presentation\Controllers\TaskController;
use App\Modules\Routine\Presentation\Controllers\RoutineController;
use App\Modules\Routine\Presentation\Controllers\RoutineTaskController;
use App\Modules\Notification\Presentation\Controllers\NotificationController;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

Route::group(['prefix' => 'auth'], function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/two-factor-challenge', [AuthController::class, 'twoFactorLogin']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    // Email Verification
    Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationEmail'])
        ->middleware(['auth:sanctum', 'throttle:6,1']);

    // Password Reset
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('guest')
        ->name('api.password.email');

    Route::post('/reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('guest')
        ->name('api.password.update');

    // PIN & Auto-lock
    Route::post('/pin/verify', [PinController::class, 'verify']); // Public, but requires email + PIN

    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('/user', function (Request $request) {
            $user = $request->user();
            return response()->json([
                'user' => array_merge($user->toArray(), [
                    'roles' => $user->getRoleNames(),
                ])
            ]);
        });
        Route::post('/pin/setup', [PinController::class, 'setup']);
        Route::post('/pin/toggle', [PinController::class, 'toggleAutoLock']);
        Route::post('/pin/settings', [PinController::class, 'updateSettings']);
        
        // Profile & Password updates (API versions)
        Route::put('/profile', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'update']);
        Route::post('/password', [\App\Http\Controllers\Settings\PasswordController::class, 'update']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    // Protected Routes
    // Categories
    Route::middleware('permission:view categories')->group(function () {
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('categories/{id}', [CategoryController::class, 'show']);
    });
    Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:create categories');
    Route::put('categories/{id}', [CategoryController::class, 'update'])->middleware('permission:edit categories');
    Route::delete('categories/{id}', [CategoryController::class, 'destroy'])->middleware('permission:delete categories');
    
    // Accounts
    Route::middleware('permission:view accounts')->group(function () {
        Route::get('accounts', [AccountController::class, 'index']);
        Route::get('accounts/{id}', [AccountController::class, 'show']);
    });
    Route::middleware('permission:create accounts')->post('accounts', [AccountController::class, 'store']);
    Route::middleware('permission:edit accounts')->group(function () {
        Route::put('accounts/{id}', [AccountController::class, 'update']);
        Route::post('/accounts/{id}/currencies', [AccountController::class, 'addCurrency']);
    });
    Route::delete('accounts/{id}', [AccountController::class, 'destroy'])->middleware('permission:delete accounts');

    // Budgets
    Route::middleware('permission:view budgets')->group(function () {
        Route::get('budgets', [BudgetController::class, 'index']);
        Route::get('budgets/{id}', [BudgetController::class, 'show']);
    });
    Route::post('budgets', [BudgetController::class, 'store'])->middleware('permission:create budgets');
    Route::put('budgets/{id}', [BudgetController::class, 'update'])->middleware('permission:edit budgets');
    Route::delete('budgets/{id}', [BudgetController::class, 'destroy'])->middleware('permission:delete budgets');

    // Dashboard
    Route::get('/dashboard', [\App\Modules\Dashboard\Presentation\Controllers\DashboardController::class, 'index'])
        ->middleware('permission:view dashboard');

    // Statistics
    Route::get('statistics', [\App\Modules\Statistic\Presentation\Controllers\StatisticController::class, 'index'])
        ->middleware('permission:view statistics');

    // Transactions
    Route::middleware('permission:view transactions')->get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store'])->middleware('permission:create transactions');
    Route::put('transactions/{id}', [TransactionController::class, 'update'])->middleware('permission:edit transactions');
    Route::delete('transactions/{id}', [TransactionController::class, 'destroy'])->middleware('permission:delete transactions');

    // Tasks
    Route::middleware('permission:view tasks')->get('tasks', [TaskController::class, 'index']);
    Route::post('tasks', [TaskController::class, 'store'])->middleware('permission:create tasks');
    Route::middleware('permission:edit tasks')->group(function () {
        Route::put('tasks/{id}', [TaskController::class, 'update']);
        Route::post('tasks/{id}/toggle', [TaskController::class, 'toggleCompletion']);
    });
    Route::delete('tasks/{id}', [TaskController::class, 'destroy'])->middleware('permission:delete tasks');

    // Routines
    Route::middleware('permission:view routines')->group(function () {
        Route::get('routines', [RoutineController::class, 'index']);
        Route::get('routine-tasks/day/{dayOfWeek}', [RoutineController::class, 'tasksForDay']);
        
        // Routine Tasks view
        Route::get('routines/{routineId}/tasks', [RoutineTaskController::class, 'index']);
    });
    
    Route::post('routines', [RoutineController::class, 'store'])->middleware('permission:create routines');
    
    Route::middleware('permission:edit routines')->group(function () {
        Route::put('routines/{id}', [RoutineController::class, 'update']);
        Route::post('routines/{id}/toggle', [RoutineController::class, 'toggleActive']);
        
        // Routine Tasks edit
        Route::post('routines/{routineId}/tasks', [RoutineTaskController::class, 'store']);
        Route::put('routines/{routineId}/tasks/{taskId}', [RoutineTaskController::class, 'update']);
    });
    
    Route::middleware('permission:delete routines')->group(function () {
        Route::delete('routines/{id}', [RoutineController::class, 'destroy']);
        Route::delete('routines/{routineId}/tasks/{taskId}', [RoutineTaskController::class, 'destroy']);
    });

    // Notifications
    Route::middleware('permission:view notifications')->group(function () {
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    });
    
    Route::middleware('permission:manage notifications')->group(function () {
        Route::post('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
        Route::delete('notifications/delete-all', [NotificationController::class, 'deleteAll']);
        Route::post('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    });
    
    Route::delete('notifications/{id}', [NotificationController::class, 'delete'])->middleware('permission:delete notifications');
});
