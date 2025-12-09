<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Modules\Category\Presentation\Controllers\CategoryController;
use App\Modules\Account\Presentation\Controllers\AccountController;
use App\Modules\Identity\Presentation\Controllers\AuthController;
use App\Modules\Budget\Presentation\Controllers\BudgetController;
use App\Modules\Transaction\Presentation\Controllers\TransactionController;

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
});
