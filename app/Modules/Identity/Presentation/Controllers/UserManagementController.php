<?php

namespace App\Modules\Identity\Presentation\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles')->latest();
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query->paginate(10);

        if ($request->wantsJson() || $request->has('format')) {
            return response()->json($users);
        }

        // Just in case it's accessed via URL directly
        return Inertia::render('Admin/Settings/Tabs/UsersTab', [
            'users' => $users
        ]);
    }
    
    // API endpoint for users list
    public function list() {
        return User::with('roles')->latest()->paginate(10);
    }

    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user->syncRoles($request->roles);

        return back()->with('success', 'Rôles de l\'utilisateur mis à jour.');
    }
}
