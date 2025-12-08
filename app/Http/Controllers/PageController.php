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
        return Inertia::render('dashboard');
    }

    /**
     * Show account page
     */
    public function account(): Response
    {
        return Inertia::render('account');
    }

    /**
     * Show transaction page
     */
    public function transaction(): Response
    {
        return Inertia::render('transaction');
    }

    /**
     * Show category page
     */
    public function category(): Response
    {
        return Inertia::render('category');
    }

    /**
     * Show budget page
     */
    public function budget(): Response
    {
        return Inertia::render('budget');
    }

    /**
     * Show statistic page
     */
    public function statistic(): Response
    {
        return Inertia::render('statistic');
    }

    /**
     * Show task page
     */
    public function task(): Response
    {
        return Inertia::render('task');
    }

    /**
     * Show auth page (login/register)
     */
    public function auth(): Response
    {
        return Inertia::render('auth');
    }
}
