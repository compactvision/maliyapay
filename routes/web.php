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
// Note: For web routes with Inertia, we check auth on the frontend
// The API routes are protected with auth:sanctum middleware

Route::get('/', [PageController::class, 'dashboard'])->name('home');
Route::get('/account', [PageController::class, 'account'])->name('account');
Route::get('/transaction', [PageController::class, 'transaction'])->name('transaction');
Route::get('/category', [PageController::class, 'category'])->name('category');
Route::get('/budget', [PageController::class, 'budget'])->name('budget');
Route::get('/statistic', [PageController::class, 'statistic'])->name('statistic');
Route::get('/task', [PageController::class, 'task'])->name('task');
Route::get('/profile', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'show'])->name('profile.show');
Route::patch('/profile', [\App\Modules\Identity\Presentation\Controllers\ProfileController::class, 'update'])->name('profile.update');


require __DIR__.'/settings.php';
