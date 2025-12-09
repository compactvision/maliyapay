<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

/**
 * PageController
 * 
 * Handles rendering of all application pages
 */
class PageController extends Controller
{
    /**
     * Show dashboard page
     */
    public function dashboard(): Response
    {
        return Inertia::render('dashboard', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show account page
     */
    public function account(): Response
    {
        return Inertia::render('account', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show transaction page
     */
    public function transaction(): Response
    {
        return Inertia::render('transaction', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show category page
     */
    public function category(): Response
    {
        return Inertia::render('category', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show budget page
     */
    public function budget(): Response
    {
        return Inertia::render('budget', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show statistic page
     */
    public function statistic(): Response
    {
        return Inertia::render('statistic', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show task page
     */
    public function task(): Response
    {
        return Inertia::render('task', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show routine page
     */
    public function routine(): Response
    {
        return Inertia::render('routine', [
            'requiresAuth' => true,
        ]);
    }

    /**
     * Show auth page (login/register)
     */
    public function auth(): Response
    {
        return Inertia::render('auth', [
            'requiresAuth' => false,
        ]);
    }

    /**
     * Show email verification notice page
     */
    public function verifyEmail(): Response
    {
        return Inertia::render('verify-email', [
            'requiresAuth' => false,
        ]);
    }

    /**
     * Show forgot password page
     */
    public function forgotPassword(): Response
    {
        return Inertia::render('forgot-password', [
            'requiresAuth' => false,
        ]);
    }

    /**
     * Show reset password page
     */
    public function resetPassword(string $token): Response
    {
        return Inertia::render('reset-password', [
            'requiresAuth' => false,
            'token' => $token,
            'email' => request()->query('email'),
        ]);
    }
}
