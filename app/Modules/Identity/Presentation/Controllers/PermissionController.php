<?php

namespace App\Modules\Identity\Presentation\Controllers;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PermissionController extends Controller
{
    public function index()
    {
        return Permission::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name',
        ]);

        Permission::create(['name' => $request->name]);

        return back()->with('success', 'Permission créée.');
    }

    public function update(Request $request, Permission $permission)
    {
        $request->validate([
            'name' => ['required', 'string', Rule::unique('permissions', 'name')->ignore($permission->id)],
        ]);

        $permission->update(['name' => $request->name]);

        return back()->with('success', 'Permission mise à jour.');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return back()->with('success', 'Permission supprimée.');
    }
}
