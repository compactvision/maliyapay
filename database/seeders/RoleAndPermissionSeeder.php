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

            // Task permissions
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',

            // Routine permissions
            'view routines',
            'create routines',
            'edit routines',
            'delete routines',

            // Habit Performance permissions
            'view habit-performance',
            'manage habit-performance',

            // Notification permissions
            'view notifications',
            'delete notifications',
            'manage notifications',
            
            // Statistics permissions
            'view statistics',

            // Dashboard permissions
            'view dashboard',

            // Settings permissions
            'view settings',
            'edit settings',
            
            // Identity/Admin permissions
            'manage users',
            'manage roles',
            'manage permissions',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Assign all permissions to admin
        $adminRole->syncPermissions(Permission::all());

        // Assign basic permissions to user
        $userRole->syncPermissions([
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
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'view routines',
            'create routines',
            'edit routines',
            'delete routines',
            'view habit-performance',
            'view notifications',
            'delete notifications',
            'view statistics',
            'view dashboard',
            'view settings',
        ]);

        $this->command->info('Roles and permissions created successfully!');
    }
}
