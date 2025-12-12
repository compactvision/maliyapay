<?php

namespace App\Modules\Settings\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Application\Services\SettingsService;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaliyaSettingsController extends Controller
{
    public function __construct(private SettingsService $settingsService)
    {}

    public function index()
    {
        $settings = $this->settingsService->getAll();

        // Statistics
        $stats = [
            'users_count' => User::count(),
            'admins_count' => User::role('admin')->count(),
            'roles_count' => Role::count(),
            'permissions_count' => Permission::count(),
        ];

        return Inertia::render('admin/settings/Index', [
            'settings' => $settings,
            'stats' => $stats,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'app_name' => 'nullable|string|max:255',
            'app_desc' => 'nullable|string|max:500',
            'app_url' => 'nullable|url',
            'logo' => 'nullable|image|max:2048',
            'maintenance_mode' => 'nullable|boolean',
        ]);

        $data = $request->except(['_token']);
        
        // Handle boolean fields manually if needed, or rely on service
        // Inertia sends booleans correctly usually.
        
        $this->settingsService->update($data);

        return back()->with('success', 'Paramètres mis à jour avec succès.');
    }
}
