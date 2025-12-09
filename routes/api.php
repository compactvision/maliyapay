<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Modules\Category\Presentation\Controllers\CategoryController;
use App\Modules\Account\Presentation\Controllers\AccountController;
use App\Modules\Identity\Presentation\Controllers\AuthController;
use App\Modules\Budget\Presentation\Controllers\BudgetController;
use App\Modules\Transaction\Presentation\Controllers\TransactionController;
use App\Modules\Task\Presentation\Controllers\TaskController;
use App\Modules\Routine\Presentation\Controllers\RoutineController;
use App\Modules\Routine\Presentation\Controllers\RoutineTaskController;
use App\Modules\Notification\Presentation\Controllers\NotificationController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth Routes (from previous context, though they might be in AuthController)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Email Verification
Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationEmail'])
    ->middleware(['auth:sanctum', 'throttle:6,1']);

// Password Reset
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('guest')
    ->name('password.email');

Route::post('/reset-password', [AuthController::class, 'resetPassword'])
    ->middleware('guest')
    ->name('password.update');

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Categories
    Route::apiResource('categories', CategoryController::class);
    
    // Accounts
    Route::apiResource('accounts', AccountController::class);
    Route::post('/accounts/{id}/currencies', [AccountController::class, 'addCurrency']);

    // Budgets
    Route::apiResource('budgets', \App\Modules\Budget\Presentation\Controllers\BudgetController::class);

    // Dashboard
    Route::get('/dashboard', [\App\Modules\Dashboard\Presentation\Controllers\DashboardController::class, 'index']);

    // Statistics
    Route::get('statistics', [\App\Modules\Statistic\Presentation\Controllers\StatisticController::class, 'index']);

    // Transactions
    Route::get('transactions', [TransactionController::class, 'index']);
    Route::post('transactions', [TransactionController::class, 'store']);
    Route::put('transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('transactions/{id}', [TransactionController::class, 'destroy']);

    // Tasks
    Route::get('tasks', [TaskController::class, 'index']);
    Route::post('tasks', [TaskController::class, 'store']);
    Route::put('tasks/{id}', [TaskController::class, 'update']);
    Route::post('tasks/{id}/toggle', [TaskController::class, 'toggleCompletion']);
    Route::delete('tasks/{id}', [TaskController::class, 'destroy']);

    // Routines
    Route::get('routines', [RoutineController::class, 'index']);
    Route::post('routines', [RoutineController::class, 'store']);
    Route::put('routines/{id}', [RoutineController::class, 'update']);
    Route::post('routines/{id}/toggle', [RoutineController::class, 'toggleActive']);
    Route::delete('routines/{id}', [RoutineController::class, 'destroy']);
    Route::get('routine-tasks/day/{dayOfWeek}', [RoutineController::class, 'tasksForDay']);

    // Routine Tasks
    Route::get('routines/{routineId}/tasks', [RoutineTaskController::class, 'index']);
    Route::post('routines/{routineId}/tasks', [RoutineTaskController::class, 'store']);
    Route::put('routines/{routineId}/tasks/{taskId}', [RoutineTaskController::class, 'update']);
    Route::delete('routines/{routineId}/tasks/{taskId}', [RoutineTaskController::class, 'destroy']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/delete-all', [NotificationController::class, 'deleteAll']);
    Route::post('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'delete']);
});
