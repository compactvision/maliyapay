<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth:sanctum', 'permission:view settings'])->group(function () {
    // Route::redirect('settings', '/profile'); // On remplace la redirection par la vraie page
    // Route::redirect('settings/profile', '/profile'); // On garde celle-ci si on veut
     Route::get('settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
     Route::patch('settings/notifications', [\App\Http\Controllers\SettingsController::class, 'update'])->middleware('permission:edit settings')->name('settings.notifications.update');
     Route::patch('settings/language', [\App\Http\Controllers\SettingsController::class, 'updateLanguage'])->middleware('permission:edit settings')->name('settings.language.update');

    // Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->middleware('permission:edit settings')->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->middleware('permission:edit settings')->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware(['throttle:6,1', 'permission:edit settings'])
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::post('settings/two-factor', [TwoFactorAuthenticationController::class, 'store'])
        ->middleware('permission:edit settings')
        ->name('two-factor.enable');

    Route::delete('settings/two-factor', [TwoFactorAuthenticationController::class, 'destroy'])
        ->middleware('permission:edit settings')
        ->name('two-factor.disable');
});
