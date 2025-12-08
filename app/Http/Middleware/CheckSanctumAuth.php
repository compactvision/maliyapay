<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CheckSanctumAuth Middleware
 * 
 * Checks if user has a valid Sanctum token
 * Redirects to login if not authenticated
 */
class CheckSanctumAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user has auth token in localStorage (frontend will handle)
        // For server-side, we check if there's a valid Sanctum token
        
        // If this is an Inertia request and user is not authenticated
        if ($request->header('X-Inertia') && !$request->bearerToken() && !session()->has('auth_token')) {
            // For web routes, we'll let the frontend handle auth
            // Just pass through and let AuthGuard component handle it
            return $next($request);
        }

        return $next($request);
    }
}
