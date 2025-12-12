<?php

namespace App\Http\Middleware;

use App\Modules\Settings\Domain\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $isMaintenance = Setting::get('maintenance_mode') === '1';

        if ($isMaintenance) {
            // Allow access to login/admin routes if needed, or check for specific permission
            // For now, let's block everything except login and admin if user is admin
            // But if user is NOT logged in, they can't be admin.
            
            // Pattern: Users can login. If standard user -> Maintenance Page. If Admin -> Next.
            
            // Allow login routes
            if ($request->is('login') || $request->is('logout')) {
                return $next($request);
            }

            $user = $request->user();

            if ($user && ($user->hasRole('admin') || $user->email === 'admin@admin.com')) { // Safety for first admin
                 // Add a shared prop to Inertia to show maintenance banner to admins
                 Inertia::share('maintenance_mode', true);
                 return $next($request);
            }

            // Return Maintenance Page
            // We can simple render an Inertia page 'Maintenance'
            return Inertia::render('Errors/Maintenance')->toResponse($request);
        }

        return $next($request);
    }
}
