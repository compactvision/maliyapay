<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user has admin role or specific email
        if ($request->user() && ($request->user()->hasRole('admin') || $request->user()->email === 'admin@admin.com')) {
            return $next($request);
        }

        abort(403, 'Unauthorized action.');
    }
}
