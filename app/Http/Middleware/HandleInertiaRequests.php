<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar,
                    'play_notification_sound' => $request->user()->play_notification_sound, // Share preference
                    'roles' => $request->user()->getRoleNames(), // Share roles
                    'auto_lock_enabled' => $request->user()->auto_lock_enabled,
                    'auto_lock_timeout' => $request->user()->auto_lock_timeout,
                    'pin_code_set' => $request->user()->pin_code_set,
                ] : null,
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            // We remove the explicit maintenance_mode read here because it is handled by the CheckMaintenanceMode middleware
            // to avoid "Inertia class not found" if use statement is missing, or trying to read before set.
            // If we want it here, we must ensure Inertia is imported and understand null is returned if not set yet.
            // 'maintenance_mode' => Inertia::getShared('maintenance_mode'), 
             'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
