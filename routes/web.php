<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('dashboard');
})->name('home');

Route::get('/account', function () {
    return Inertia::render('account');
})->name('account');

Route::get('/transaction', function () {
    return Inertia::render('transaction');
})->name('transaction');

Route::get('/category', function () {
    return Inertia::render('category');
})->name('category')->middleware('auth');

Route::get('/budget', function () {
    return Inertia::render('budget');
})->name('budget');

Route::get('/statistic', function () {
    return Inertia::render('statistic');
})->name('statistic');

Route::get('/task', function () {
    return Inertia::render('task');
})->name('task');

require __DIR__.'/settings.php';
