<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Category permissions
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',
            
            // Transaction permissions
            'view transactions',
            'create transactions',
            'edit transactions',
            'delete transactions',
            
            // Budget permissions
            'view budgets',
            'create budgets',
            'edit budgets',
            'delete budgets',
            
            // Account permissions
            'view accounts',
            'create accounts',
            'edit accounts',
            'delete accounts',
            
            // Statistics permissions
            'view statistics',
            
            // Admin permissions
            'manage users',
            'manage roles',
            'manage permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'user']);

        // Assign all permissions to admin
        $adminRole->givePermissionTo(Permission::all());

        // Assign basic permissions to user
        $userRole->givePermissionTo([
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',
            'view transactions',
            'create transactions',
            'edit transactions',
            'delete transactions',
            'view budgets',
            'create budgets',
            'edit budgets',
            'delete budgets',
            'view accounts',
            'create accounts',
            'edit accounts',
            'delete accounts',
            'view statistics',
        ]);

        $this->command->info('Roles and permissions created successfully!');
    }
}
