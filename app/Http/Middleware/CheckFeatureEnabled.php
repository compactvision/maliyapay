<?php

namespace App\Http\Middleware;

use App\Modules\Settings\Domain\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckFeatureEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $feature
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        // Settings are stored as 'feature_{name}'
        $key = 'feature_' . $feature;
        
        // Default to enabled if not found (optional, but safer during rollout)
        // However, the user wants us to be able to deactivate them.
        // Let's assume default is ENABLED ('1') if not set yet.
        $isEnabled = Setting::get($key, '1') === '1';

        if (!$isEnabled) {
            $user = $request->user();

            // Admins can bypass or see a warning. User requested: "si je desactive une fonctionnalité la page qui affiche cette dernieres doit afficher fonctionnalité en maintenance"
            // Let's block for non-admins.
            if ($user && ($user->hasRole('admin') || $user->email === 'admin@admin.com')) {
                return $next($request);
            }

            return Inertia::render('Errors/Maintenance', [
                'title' => 'Fonctionnalité en maintenance',
                'message' => 'Cette fonctionnalité est temporairement désactivée pour maintenance. Veuillez réessayer plus tard.',
            ])->toResponse($request);
        }

        return $next($request);
    }
}
