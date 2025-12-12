<?php

namespace App\Modules\Identity\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index()
    {
        return Role::with('permissions')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return back()->with('success', 'Rôle créé avec succès.');
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => ['required', 'string', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update(['name' => $request->name]);

        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return back()->with('success', 'Rôle mis à jour.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return back()->with('error', 'Le rôle admin ne peut pas être supprimé.');
        }
        
        $role->delete();
        return back()->with('success', 'Rôle supprimé.');
    }
}
